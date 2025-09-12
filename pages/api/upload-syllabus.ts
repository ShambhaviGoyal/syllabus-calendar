import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { extractTextFromPDF, cleanText } from '../../src/lib/pdfParser';
import { processSyllabusWithAI } from '../../src/lib/aiProcessor';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        return mimetype === 'application/pdf';
      },
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.syllabus) ? files.syllabus[0] : files.syllabus;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    // Read the file buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Extract text from PDF
    const rawText = await extractTextFromPDF(fileBuffer);
    const cleanedText = cleanText(rawText);

    // Process with AI
    const result = await processSyllabusWithAI(cleanedText);

    // Check if we got mock data (indicates AI processing failed)
    const isMockData = result.courseInfo.title === "Legal Communication and Research Skills II" || 
                      result.courseInfo.title === "Contracts" ||
                      result.assignments.length === 0 ||
                      (result.assignments.length > 0 && result.assignments[0].title.includes("Course Introduction"));

    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    res.json({
      success: true,
      data: result,
      isMockData: isMockData,
      message: isMockData ? 'AI processing failed, showing sample data. Please check the console for details.' : 'Syllabus processed successfully'
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}