import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { extractTextFromPDF, cleanText } from '../src/lib/pdfParser';
import { processSyllabusWithAI } from '../src/lib/aiProcessor';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload and process syllabus endpoint
app.post('/api/upload-syllabus', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('Processing uploaded file:', req.file.originalname);

    // Extract text from PDF
    const rawText = await extractTextFromPDF(req.file.buffer);
    const cleanedText = cleanText(rawText);
    
    console.log('Extracted text length:', cleanedText.length);

    // Process with AI
    const result = await processSyllabusWithAI(cleanedText);
    
    console.log('AI processing result:', {
      success: result.success,
      assignmentCount: result.assignments.length,
      courseTitle: result.courseInfo.title
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});