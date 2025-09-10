import type { NextApiRequest, NextApiResponse } from 'next';
import { processSyllabusWithAI } from '../../src/lib/aiProcessor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // For mock version, we'll simulate processing based on form data
    // In a real version, you'd extract text from the uploaded PDF
    
    console.log('Processing upload request...');
    
    // Get filename from the request (if available)
    const filename = req.body?.filename || 'syllabus.pdf';
    
    // Use mock processing
    const result = await processSyllabusWithAI(filename);
    
    console.log('Mock processing completed:', {
      success: result.success,
      assignmentCount: result.assignments.length
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
}