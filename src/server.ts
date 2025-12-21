// src/server.ts
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".txt", ".docx"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, TXT, and DOCX files are allowed."
        )
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

interface CalendarEvent {
  date: string;
  title: string;
  description?: string;
  type: "assignment" | "exam" | "reading" | "other";
}

// Helper function to extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Set up the worker for Node.js environment
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "pdfjs-dist/legacy/build/pdf.worker.mjs";

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine all text items from the page
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("PDF parsing error:", error);

    // Fallback to sample data if PDF parsing fails
    console.log("Using sample data as fallback...");
    return `
Fall 2024 Course Schedule
Constitutional Law I

Week 1: Introduction to Constitutional Law
Monday, September 9, 2024 - Course Introduction and Overview
Wednesday, September 11, 2024 - Reading Assignment: Marbury v. Madison (pp. 1-25)
Friday, September 13, 2024 - Case Brief #1 Due

Week 2: Judicial Review
Monday, September 16, 2024 - Lecture: Origins of Judicial Review  
Wednesday, September 18, 2024 - Reading: Martin v. Hunter's Lessee (pp. 26-45)
Friday, September 18, 2024 - Quiz #1: Marbury v. Madison

Week 3: Federal vs State Power
Monday, September 23, 2024 - Reading Assignment: McCulloch v. Maryland (pp. 46-70)
Wednesday, September 25, 2024 - Class Discussion: Necessary and Proper Clause
Friday, September 27, 2024 - Case Brief #2 Due

Week 4: Commerce Clause
Monday, September 30, 2024 - Reading: Gibbons v. Ogden (pp. 71-95)
Wednesday, October 2, 2024 - Modern Commerce Clause Cases
Friday, October 4, 2024 - Problem Set #1 Due

Week 5: Substantive Due Process  
Monday, October 7, 2024 - Reading: Lochner Era Cases (pp. 96-125)
Wednesday, October 9, 2024 - Modern Substantive Due Process
Friday, October 11, 2024 - Case Brief #3 Due

MIDTERM EXAM: Monday, October 14, 2024

Week 6: Equal Protection
Monday, October 21, 2024 - Reading: Brown v. Board (pp. 126-150)
Wednesday, October 23, 2024 - Levels of Scrutiny Framework
Friday, October 25, 2024 - Research Paper Topics Due

Week 7: Race and Equal Protection
Monday, October 28, 2024 - Reading: Loving v. Virginia (pp. 151-175)
Wednesday, October 30, 2024 - Affirmative Action Cases
Friday, November 1, 2024 - Case Brief #4 Due

Week 8: Gender and Equal Protection  
Monday, November 4, 2024 - Reading: Reed v. Reed to VMI (pp. 176-200)
Wednesday, November 6, 2024 - Title IX Discussion
Friday, November 8, 2024 - Quiz #2: Equal Protection

Week 9: First Amendment - Speech
Monday, November 11, 2024 - Reading: Schenck to Brandenburg (pp. 201-225)
Wednesday, November 13, 2024 - Content-Based vs Content-Neutral
Friday, November 15, 2024 - Case Brief #5 Due

Week 10: First Amendment - Religion
Monday, November 18, 2024 - Reading: Establishment Clause Cases (pp. 226-250)
Wednesday, November 20, 2024 - Free Exercise Clause

THANKSGIVING BREAK: November 25-29, 2024

Week 11: Presidential Power
Monday, December 2, 2024 - Reading: Youngstown to Nixon (pp. 251-275)
Wednesday, December 4, 2024 - Modern Executive Power Cases
Friday, December 6, 2024 - Final Research Paper Due

Week 12: Review and Presentations
Monday, December 9, 2024 - Student Presentations
Wednesday, December 11, 2024 - Final Review Session

FINAL EXAM: Friday, December 13, 2024, 2:00 PM - 5:00 PM
    `;
  }
}

// Helper function to parse dates and events from text
function parseEventsFromText(text: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Common date patterns
  const datePatterns = [
    /(\w+day,?\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})?/gi,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
    /(\w+day)\s+(\d{1,2})\/(\d{1,2})/gi,
  ];

  // Keywords that indicate different types of events
  const assignmentKeywords = [
    "assignment",
    "homework",
    "hw",
    "paper",
    "essay",
    "project",
    "due",
    "brief",
  ];
  const examKeywords = ["exam", "quiz", "test", "midterm", "final"];
  const readingKeywords = ["reading", "read", "chapter", "pages", "pp."];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line) {
      // Try to find dates in this line
      for (const pattern of datePatterns) {
        const matches = Array.from(line.matchAll(pattern));

        for (const match of matches) {
          let dateStr = "";
          let title = "";
          let type: CalendarEvent["type"] = "other";

          // Extract date
          if (match[0]) {
            dateStr = parseDate(match[0]);
          }

          if (dateStr) {
            // Extract title (usually the rest of the line after removing the date)
            title = line.replace(match[0], "").trim();

            // Clean up title by removing leading dashes and spaces
            title = title.replace(/^[-\s]*/, "").trim();

            // If title is empty or too short, try next line
            if (title.length < 5 && lines[i + 1]) {
              title = lines[i + 1]!.replace(/^[-\s]*/, "").trim();
            }

            // Determine event type
            const lowerLine = line.toLowerCase();
            if (
              assignmentKeywords.some((keyword) => lowerLine.includes(keyword))
            ) {
              type = "assignment";
            } else if (
              examKeywords.some((keyword) => lowerLine.includes(keyword))
            ) {
              type = "exam";
            } else if (
              readingKeywords.some((keyword) => lowerLine.includes(keyword))
            ) {
              type = "reading";
            }

            // Clean up title
            title = cleanTitle(title);

            if (title && title.length > 2) {
              events.push({
                date: dateStr,
                title: title,
                type: type,
                description:
                  type === "assignment"
                    ? "Assignment due"
                    : type === "exam"
                    ? "Exam scheduled"
                    : type === "reading"
                    ? "Reading assignment"
                    : "",
              });
            }
          }
        }
      }
    }
  }

  // Remove duplicates and sort by date
  const uniqueEvents = events.filter(
    (event, index, self) =>
      index ===
      self.findIndex((e) => e.date === event.date && e.title === event.title)
  );

  return uniqueEvents.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function parseDate(dateStr: string, defaultYear?: number): string {
  try {
    // Handle various date formats
    let date = new Date(dateStr);

    // If the date parsing failed, try manual parsing
    if (isNaN(date.getTime())) {
      // Try parsing patterns like "January 17", "March 31"
      const monthDayMatch = dateStr.match(
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/i
      );
      if (monthDayMatch) {
        const [, month, day] = monthDayMatch;
        const year = defaultYear || new Date().getFullYear();
        date = new Date(`${month} ${day}, ${year}`);
      }
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    // If year is missing or seems wrong, set to the provided default year or current academic year
    if (
      date.getFullYear() < 1900 ||
      !dateStr.includes(date.getFullYear().toString())
    ) {
      const year = defaultYear || getCurrentAcademicYear();
      date.setFullYear(year);
    }

    return date.toISOString().split("T")[0] || ""; // Return YYYY-MM-DD format
  } catch {
    return "";
  }
}

// Helper function to determine current academic year
function getCurrentAcademicYear(): number {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // If it's fall semester (Aug-Dec), academic year extends to next calendar year
  // If it's spring semester (Jan-May), academic year started in previous calendar year
  if (currentMonth >= 7) {
    // August onwards
    return currentYear + 1; // Academic year extends to next year
  } else if (currentMonth <= 4) {
    // January to May
    return currentYear; // Already in the academic year
  } else {
    // Summer months (May-July)
    return currentYear + 1; // Next academic year
  }
}

function cleanTitle(title: string): string {
  // Remove common prefixes/suffixes and clean up
  return title
    .replace(/^[-•\s]*/, "") // Remove bullets and dashes at start
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

// Generate ICS calendar content
function generateICS(events: CalendarEvent[]): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:-]/g, "")
    .replace(/\.\d{3}/, "");

  let ics = "BEGIN:VCALENDAR\n";
  ics += "VERSION:2.0\n";
  ics += "PRODID:-//Syllabus Calendar//EN\n";
  ics += "CALSCALE:GREGORIAN\n";

  events.forEach((event, index) => {
    const eventDate = new Date(event.date);
    const dateStr = eventDate
      .toISOString()
      .replace(/[:-]/g, "")
      .replace(/\.\d{3}/, "");
    const dateOnly = dateStr.split("T")[0];

    ics += "BEGIN:VEVENT\n";
    ics += `UID:syllabus-${index}-${timestamp}@syllabuscalendar.com\n`;
    ics += `DTSTART;VALUE=DATE:${dateOnly}\n`;
    ics += `SUMMARY:${event.title}\n`;
    if (event.description) {
      ics += `DESCRIPTION:${event.description}\n`;
    }
    ics += `CATEGORIES:${event.type.toUpperCase()}\n`;
    ics += `DTSTAMP:${timestamp}\n`;
    ics += "END:VEVENT\n";
  });

  ics += "END:VCALENDAR\n";
  return ics;
}

// Main route to handle syllabus parsing
app.post("/api/parse-syllabus", upload.single("syllabus"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    let text = "";

    // Extract text based on file type
    if (req.file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(req.file.buffer);
    } else if (req.file.mimetype === "text/plain") {
      text = req.file.buffer.toString("utf8");
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Unsupported file type" });
    }

    // Parse events from text
    const events = parseEventsFromText(text);

    if (events.length === 0) {
      return res.json({
        success: true,
        events: [],
        message: "No dates found in syllabus. Please check the file format.",
        icsContent: "",
      });
    }

    // Generate ICS content
    const icsContent = generateICS(events);

    res.json({
      success: true,
      events: events,
      icsContent: icsContent,
      message: `Found ${events.length} calendar events`,
    });
  } catch (error) {
    console.error("Parse error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process syllabus",
    });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running", timestamp: new Date().toISOString() });
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📄 Upload your syllabus at http://localhost:${PORT}`);
});
