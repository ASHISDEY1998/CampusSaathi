import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDocumentChunksCollection } from "@/lib/db/collections";
import { DocumentChunk } from "@/types";
import { GoogleGenAI } from "@google/genai";

// Helper to recursively collect all .md files in directory
function getMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      entry.name.toLowerCase() !== "readme.md"
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

// Helper to chunk markdown text by headings or sensible sizes
function chunkMarkdown(docId: string, filename: string, content: string): Omit<DocumentChunk, "_id">[] {
  const chunks: Omit<DocumentChunk, "_id">[] = [];
  const lines = content.split("\n");

  let currentTitle = filename.replace(/\.md$/, "").replace(/[_-]/g, " ");
  let currentSection = "General Overview";
  let currentBuffer: string[] = [];
  let pageNumber = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if line is title #
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      currentTitle = trimmed.replace(/^#\s+/, "").trim();
      continue;
    }

    // Check if line is a section header (## or ###)
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      if (currentBuffer.join("\n").trim().length > 0) {
        const text = currentBuffer.join("\n").trim();
        if (text.length > 50) {
          chunks.push({
            docId,
            title: currentTitle,
            section: currentSection,
            page: pageNumber++,
            content: text,
          });
        }
        currentBuffer = [];
      }
      currentSection = trimmed.replace(/^#+\s+/, "").trim();
      continue;
    }

    currentBuffer.push(line);

    // If section buffer gets too large (> 1200 characters), break chunk for better retrieval
    if (currentBuffer.join("\n").length > 1200) {
      const text = currentBuffer.join("\n").trim();
      chunks.push({
        docId,
        title: currentTitle,
        section: currentSection,
        page: pageNumber++,
        content: text,
      });
      currentBuffer = [];
    }
  }

  // Flush remaining buffer
  if (currentBuffer.join("\n").trim().length > 0) {
    const text = currentBuffer.join("\n").trim();
    if (text.length > 30) {
      chunks.push({
        docId,
        title: currentTitle,
        section: currentSection,
        page: pageNumber,
        content: text,
      });
    }
  }

  return chunks;
}

export async function POST() {
  try {
    const kbDir = path.resolve(process.cwd(), "knowledge_base");
    if (!fs.existsSync(kbDir)) {
      return NextResponse.json(
        { success: false, error: "Knowledge base directory not found." },
        { status: 404 }
      );
    }

    const mdFiles = getMarkdownFiles(kbDir);
    if (mdFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No markdown files found in knowledge_base directory." },
        { status: 404 }
      );
    }

    const chunksCollection = await getDocumentChunksCollection();
    const allChunks: Omit<DocumentChunk, "_id">[] = [];
    const fileSummaries: { name: string; category: string; chunks: number }[] = [];

    for (const filePath of mdFiles) {
      const relativePath = path.relative(kbDir, filePath);
      const category = path.dirname(relativePath);
      const filename = path.basename(filePath);
      const docId = filename.replace(/\.md$/, "");
      const content = fs.readFileSync(filePath, "utf-8");

      const fileChunks = chunkMarkdown(docId, filename, content);
      allChunks.push(...fileChunks);
      fileSummaries.push({
        name: filename,
        category: category === "." ? "root" : category,
        chunks: fileChunks.length,
      });
    }

    // Optional vector embedding generation with gemini-embedding-001
    const apiKey = process.env.GEMINI_API_KEY;
    let embeddingsGenerated = 0;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const BATCH_SIZE = 6;
        for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
          const batch = allChunks.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (chunk) => {
              try {
                const embedRes = await ai.models.embedContent({
                  model: "gemini-embedding-001",
                  contents: `${chunk.title} - ${chunk.section}\n${chunk.content}`,
                  config: { outputDimensionality: 768 },
                });
                const values = embedRes.embeddings?.[0]?.values;
                if (values && values.length > 0) {
                  chunk.embedding = values;
                  embeddingsGenerated++;
                }
              } catch {
                // Safe fallback: continue without embeddings if Gemini quota or connection fails
              }
            })
          );
        }
      } catch (geminiErr) {
        console.warn("Gemini embedding client initialization skipped:", geminiErr);
      }
    }

    // Clear existing chunks and insert newly parsed chunks
    await chunksCollection.deleteMany({});
    if (allChunks.length > 0) {
      await chunksCollection.insertMany(allChunks as DocumentChunk[]);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${mdFiles.length} knowledge base documents (${allChunks.length} chunks) to MongoDB Atlas.`,
      filesCount: mdFiles.length,
      chunksCount: allChunks.length,
      embeddingsGenerated,
      files: fileSummaries,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Knowledge base sync error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync knowledge base." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const chunksCollection = await getDocumentChunksCollection();
    const count = await chunksCollection.countDocuments();
    const distinctDocs = await chunksCollection.distinct("docId");

    const kbDir = path.resolve(process.cwd(), "knowledge_base");
    const localFiles = getMarkdownFiles(kbDir).map((f) => path.basename(f));

    return NextResponse.json({
      success: true,
      indexedChunks: count,
      indexedDocs: distinctDocs,
      localFiles,
      isSynced: count > 0 && distinctDocs.length >= localFiles.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch sync status." },
      { status: 500 }
    );
  }
}
