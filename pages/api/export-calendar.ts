import { NextApiRequest, NextApiResponse } from 'next';
import { Assignment } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { assignments, courseInfo } = req.body;

    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignments data'
      });
    }

    // Generate ICS (iCalendar) format
    const icsContent = generateICS(assignments, courseInfo);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${courseInfo?.title || 'syllabus'}-calendar.ics"`);
    
    res.status(200).send(icsContent);

  } catch (error) {
    console.error('Calendar export error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

function generateICS(assignments: Assignment[], courseInfo: any): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Syllabus Calendar//LawBandit//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${courseInfo?.title || 'Syllabus Calendar'}`,
    `X-WR-CALDESC:Generated from ${courseInfo?.title || 'syllabus'}`,
    ''
  ];

  assignments.forEach((assignment) => {
    const startDate = new Date(assignment.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // All-day event

    const startDateStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Clean description for ICS format
    const description = (assignment.description || '')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\\/g, '\\\\');

    const summary = assignment.title
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\\/g, '\\\\');

    ics.push(
      'BEGIN:VEVENT',
      `UID:${assignment.id}@syllabus-calendar.com`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${startDateStr.split('T')[0]}`,
      `DTEND;VALUE=DATE:${endDateStr.split('T')[0]}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `CATEGORIES:${assignment.type.toUpperCase()}`,
      assignment.isRequired ? 'STATUS:CONFIRMED' : 'STATUS:TENTATIVE',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}
