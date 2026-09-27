# CampusSaathi Project Presentation Deck (HTML/CSS/JS)
**Purnachandra Group of Institutions • Purnachandra Higher Secondary School, Raghunathpur, Baripada**  
*Presented by: +2 First Year Students (Science, Commerce & Arts)*

---

## 🚀 How to Run the Presentation

This presentation is **100% standalone and portable**. It has zero build steps and no server requirements.

### Method 1: Direct File Open (Offline Ready)
1. Navigate to this folder: `CampusSaathi/presentation/`
2. Double-click **`index.html`** or right-click and choose **Open With > Google Chrome / Microsoft Edge / Safari / Brave**.
3. The presentation will immediately launch in full HD resolution.

### Method 2: Local HTTP Server (Optional)
If you prefer running via a local server:
```bash
# Using Python
cd presentation
python3 -m http.server 3333
# Open in browser: http://localhost:3333
```
or with Node `npx serve`:
```bash
npx serve presentation
```

---

## ⌨️ Presentation Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`→` (Right Arrow)** / **`Space`** / **`PageDown`** | **Next Slide** |
| **`←` (Left Arrow)** / **`Backspace`** / **`PageUp`** | **Previous Slide** |
| **`F`** | **Toggle Fullscreen Mode** (Fills entire screen/projector) |
| **`Esc` (Escape)** | **Exit Fullscreen** / Close Slide Overview |
| **`G`** or **`O`** | **Slide Overview (Grid View)** to jump to any slide |
| **`T`** | **Toggle Dark / Light Mode** |
| **`Home`** | Jump to **First Slide** |
| **`End`** | Jump to **Final Slide** |
| **Mobile Swipe Left / Right** | Swipe to navigate on touchscreens & tablets |

---

## 📋 Slide Outline (12 Slides)

1. **Cover & Hero Slide**: CampusSaathi branding, +2 First Year Student credits, PCHSS Baripada identity.
2. **The Challenge & Motivation**: Friction in hostel phone rules, notice fragmentation, doubt clearing delays.
3. **High-Level 3-Tier Architecture**: Presentation layer, API & Gateway layer, and MongoDB Atlas + Gemini AI store.
4. **Technology Stack**: Next.js 16, React 19, TypeScript, MongoDB Atlas, Google Gemini 2.5 Flash & text-embedding-001.
5. **Authentication & Strict RBAC**: Bcrypt hash verification, JWT in HTTP-Only cookies, and ironclad role separation.
6. **RAG AI Pipeline Flow**: How official Markdown rules & timetables are chunked, vectorized, and retrieved with zero hallucination.
7. **Student Portal Experience**: Master timetable periods 1–8 with real teachers, academic exam schedules, attendance tracking, and helpdesk.
8. **Teacher & Staff Portal**: Master routine, Sunday emergency duty chart alerts, doubt clearing diary.
9. **Admin Portal & Management**: User directory CRUD, safe MongoDB cascade deletion, direct password reset, 1-click KB synchronizer.
10. **Authentic Institutional Grounding**: Real 22-point student undertaking, 12-point faculty norms, full timetable, and 2026-27 calendar.
11. **Future Innovation Roadmap**: Voice assistant in Odia/Hindi, automated smart gate-pass with WhatsApp parent notifications, RFID attendance.
12. **Conclusion & Q&A**: Acknowledgments to Principal, Teachers, and Mentors; open floor for questions.

---

## 📁 File Structure

```
presentation/
├── index.html       # Single-page HTML presentation structure
├── style.css        # Tesla-inspired styling (dark/light themes, animations, glassmorphism)
├── script.js        # Keyboard shortcuts, fullscreen, timer, and slide logic
├── README.md        # Presentation guide & documentation
└── assets/          # Logos & branding icons
    ├── campussaathi-logo.svg
    ├── campussaathi-mark.svg
    ├── campussaathi-wordmark.svg
    ├── institute-logo.png
    └── institute-logo.svg
```
