import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  getDocumentChunksCollection,
  getMarksCollection,
  getTimetablesCollection,
  getNoticesCollection,
  getStudentsCollection,
} from "@/lib/db/collections";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message query is required." },
        { status: 400 }
      );
    }

    const query = message.trim();
    const lowerQuery = query.toLowerCase();

    // 1. Authenticate user from session cookie (if logged in)
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyAuthToken(token) : null;

    const ai = new GoogleGenAI({ apiKey });
    const additionalContexts: string[] = [];
    const citations: { title: string; section: string }[] = [];

    // 2. Specialized Database Intent Detection

    // A. Marks / Grades Query
    const asksForMarks =
      lowerQuery.includes("mark") ||
      lowerQuery.includes("grade") ||
      lowerQuery.includes("cgpa") ||
      lowerQuery.includes("score") ||
      lowerQuery.includes("internal") ||
      lowerQuery.includes("result");

    if (asksForMarks) {
      if (session && session.role === "STUDENT") {
        const marksCol = await getMarksCollection();
        const studentsCol = await getStudentsCollection();
        const student = await studentsCol.findOne({ studentId: session.identifier });
        const marks = await marksCol.find({ studentId: session.identifier }).toArray();

        if (marks.length > 0) {
          const marksSummary = marks
            .map(
              (m) =>
                `• ${m.subjectCode} - ${m.subjectName} (Sem ${m.semester}): Internal: ${m.internalMarks}/40, End-Sem: ${m.endSemMarks}/60, Total: ${m.totalMarks}/100, Grade: ${m.grade}`
            )
            .join("\n");

          additionalContexts.push(
            `[STUDENT ACADEMIC RECORDS for ${session.name} (${session.identifier}) - Dept: ${session.department}, CGPA: ${student?.cgpa || "N/A"}]:\n${marksSummary}`
          );
          citations.push({
            title: "Student Examination Database",
            section: `Marks Record (${session.identifier})`,
          });
        }
      } else if (!session) {
        additionalContexts.push(
          `[NOTE TO AI]: The user asked for personal marks or grades, but they are not logged in. Politely remind them to log in with their Student ID to view their official semester marks.`
        );
      }
    }

    // B. Timetable / Schedule Query
    const asksForTimetable =
      lowerQuery.includes("timetable") ||
      lowerQuery.includes("schedule") ||
      lowerQuery.includes("class on") ||
      lowerQuery.includes("routine");

    if (asksForTimetable) {
      const dept = session?.department || "CSE";
      const timetablesCol = await getTimetablesCollection();
      const schedules = await timetablesCol.find({ department: dept }).limit(5).toArray();

      if (schedules.length > 0) {
        const scheduleSummary = schedules
          .map((t) => {
            const slots = t.slots
              .map(
                (s) =>
                  `  - [${s.time}] ${s.subjectCode}: ${s.subjectName} by ${s.teacherName} (Room ${s.room})`
              )
              .join("\n");
            return `Day: ${t.dayOfWeek} (${t.department} Sem ${t.semester}):\n${slots}`;
          })
          .join("\n\n");

        additionalContexts.push(`[DEPARTMENTAL TIMETABLES]:\n${scheduleSummary}`);
        citations.push({
          title: "Master Departmental Timetable",
          section: `${dept} Weekly Schedule`,
        });
      }
    }

    // C. Campus Notices / Announcements Query
    const asksForNotices =
      lowerQuery.includes("notice") ||
      lowerQuery.includes("circular") ||
      lowerQuery.includes("announcement") ||
      lowerQuery.includes("deadline") ||
      lowerQuery.includes("event");

    if (asksForNotices) {
      const noticesCol = await getNoticesCollection();
      const notices = await noticesCol
        .find({})
        .sort({ date: -1 })
        .limit(6)
        .toArray();

      if (notices.length > 0) {
        const noticesSummary = notices
          .map(
            (n) =>
              `• [${n.date}] (${n.category.toUpperCase()}) ${n.title}: ${n.content}`
          )
          .join("\n\n");

        additionalContexts.push(`[OFFICIAL CAMPUS NOTICES]:\n${noticesSummary}`);
        citations.push({
          title: "Campus Circulars & Notices",
          section: "Latest Announcements",
        });
      }
    }

    // 3. Knowledge Base Semantic Vector Search (RAG)
    try {
      const chunksCol = await getDocumentChunksCollection();
      const allChunks = await chunksCol
        .find({ embedding: { $exists: true } })
        .toArray();

      if (allChunks.length > 0) {
        // Embed user query
        const embedRes = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: query,
          config: { outputDimensionality: 768 },
        });

        const queryVector = embedRes.embeddings?.[0]?.values;
        if (queryVector && queryVector.length > 0) {
          const scored = allChunks
            .map((chunk) => ({
              title: chunk.title,
              section: chunk.section,
              content: chunk.content,
              score: cosineSimilarity(queryVector, chunk.embedding!),
            }))
            .sort((a, b) => b.score - a.score);

          // Select top 3-4 most relevant chunks
          const topMatches = scored.slice(0, 4).filter((m) => m.score > 0.45);
          for (const match of topMatches) {
            additionalContexts.push(
              `[VERIFIED COLLEGE DOCUMENT: "${match.title}" | Section: "${match.section}"]:\n${match.content}`
            );
            citations.push({
              title: match.title,
              section: match.section,
            });
          }
        }
      }
    } catch (vectorErr) {
      console.warn("Vector search fallback triggered:", vectorErr);
    }

    // 4. Construct System Prompt & Conversation Context
    const userRole = session ? `${session.role} (${session.name})` : "Guest Visitor";
    const contextPrompt =
      additionalContexts.length > 0
        ? `\n\n--- VERIFIED INSTITUTIONAL GROUND-TRUTH CONTEXT ---\n${additionalContexts.join(
            "\n\n---\n\n"
          )}\n--- END OF CONTEXT ---\n`
        : "\n(No specific database documents matched. Provide general institutional advice or invite them to check specific circulars).\n";

    const systemPrompt = `You are "CampusSaathi", the official AI Campus Companion for Purnachandra Group of Institutions.
Your mission is to assist students and faculty with verified academic, administrative, and campus information.

User Persona: You are conversing with ${userRole}.
Tone: Friendly, encouraging, highly structured, clear, and professional.

CRITICAL GROUNDING RULES:
1. Base your answers strictly on the verified institutional context provided below.
2. If the user asks about attendance, fees, ID card replacement, dress code, exams, or invigilation duties, quote the exact numbers (e.g., 75% attendance, ₹150 duplicate ID fee, etc.).
3. When referencing college policies, always append a clear "Verified Source: [Document Title - Section]" at the bottom of your answer.
4. If the question cannot be answered from the provided context, state clearly that you don't have that record on file and recommend contacting the Academic Office or raising a Helpdesk ticket.
5. Format your responses with clean Markdown headers, bullet points, and bold highlights for key figures.

${contextPrompt}`;

    // 5. Generate Answer with Gemini 3.6 Flash
    const messages = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-4)) {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        }
      }
    }

    // Add current query with context
    messages.push({
      role: "user",
      parts: [{ text: `${systemPrompt}\n\nStudent/User Query: "${query}"` }],
    });

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: messages,
    });

    const replyText =
      chatResponse.text ||
      "I processed your query, but could not formulate a response. Please try again.";

    // Deduplicate citations by section
    const uniqueCitations = citations.filter(
      (c, idx, self) =>
        idx === self.findIndex((t) => t.title === c.title && t.section === c.section)
    );

    return NextResponse.json({
      success: true,
      reply: replyText,
      citations: uniqueCitations,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err.message ||
          "An error occurred while communicating with the AI model. Please try again.",
      },
      { status: 500 }
    );
  }
}
