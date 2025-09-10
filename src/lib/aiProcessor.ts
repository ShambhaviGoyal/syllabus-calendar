import OpenAI from 'openai';
import { ProcessedSyllabus, Assignment } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processSyllabusWithAI(text: string): Promise<ProcessedSyllabus> {
  try {
    const prompt = `
Analyze this law school syllabus and extract all assignments, readings, and important dates. 
Return a JSON object with the following structure:

{
  "courseInfo": {
    "title": "Course title",
    "professor": "Professor name", 
    "semester": "Semester and year",
    "classTime": "Class time if mentioned",
    "room": "Room number if mentioned"
  },
  "assignments": [
    {
      "id": "unique_id",
      "date": "YYYY-MM-DD",
      "title": "Brief title of the assignment",
      "type": "reading|assignment|exam|presentation|conference|other",
      "description": "Detailed description",
      "isRequired": true/false,
      "timeStart": "HH:MM" (if specific time mentioned),
      "timeEnd": "HH:MM" (if specific time mentioned)
    }
  ]
}

Important guidelines:
1. Extract ALL dates that have associated tasks, readings, or assignments
2. For reading assignments, use type "reading"
3. For written work due dates, use type "assignment"
4. For exams and oral arguments, use type "exam" or "presentation"
5. For conferences/meetings, use type "conference"
6. Make titles concise but descriptive
7. Include page numbers and chapter references in descriptions
8. If a date has multiple tasks, create separate entries for each
9. Use the year 2025 for dates that don't specify a year
10. Only include dates that have specific academic activities

Syllabus text:
${text}

Return ONLY the JSON object, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(response);
    
    // Add unique IDs if missing
    parsed.assignments = parsed.assignments.map((assignment: any, index: number) => ({
      ...assignment,
      id: assignment.id || `assignment_${index}_${Date.now()}`,
    }));

    return {
      ...parsed,
      success: true,
    };
  } catch (error) {
    console.error('Error processing with AI:', error);
    return {
      courseInfo: {
        title: 'Unknown Course',
        professor: 'Unknown',
        semester: 'Unknown',
      },
      assignments: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}