# CampusSaathi — College Knowledge Base Directory

Drop your college documents (PDFs, Markdown, or text files) directly into this directory or any of the subfolders below. These files will be parsed, chunked, and vector-indexed for the RAG AI assistant.

---

## Suggested Folder Organization

You can drop your PDFs anywhere in `knowledge_base/` or organize them by category:

- `academic/`
  - Academic calendars, examination schedules, grading policies, attendance regulations.
- `departments/`
  - Department syllabus, lab manuals, course outlines (CSE, ECE, Mechanical, Civil, etc.).
- `student_services/`
  - Central library rules & timings, hostel guidelines, scholarship circulars, certificates/bonafide procedures.
- `administration/`
  - Campus code of conduct, fee structures, general college rules, grievance redressal.
- `notices/`
  - Official college circulars, event announcements, workshop schedules.

---

## Supported File Formats
- `.pdf` (Standard readable PDFs with extractable text)
- `.md` / `.txt` (Formatted plain text or markdown)

*Note: Scanned image-only PDFs without OCR may require text extraction. Text-based PDFs will be parsed and embedded automatically during the knowledge ingestion step.*
