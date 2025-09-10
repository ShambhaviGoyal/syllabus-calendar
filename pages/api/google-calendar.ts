import { NextApiRequest, NextApiResponse } from 'next';
import { googleCalendarService } from '../../src/lib/googleCalendar';
import { Assignment, CourseInfo } from '../../src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { accessToken, assignments, courseInfo, action } = req.body;

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'Access token is required' });
    }

    // Set the access token
    googleCalendarService.setAccessToken(accessToken);

    if (action === 'createEvents') {
      if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({ success: false, error: 'Assignments array is required' });
      }

      const result = await googleCalendarService.createEvents(assignments, courseInfo);
      
      res.json({
        success: true,
        message: `Successfully created ${result.success} events. ${result.failed} events failed.`,
        created: result.success,
        failed: result.failed
      });

    } else if (action === 'createEvent') {
      const { assignment } = req.body;
      
      if (!assignment) {
        return res.status(400).json({ success: false, error: 'Assignment is required' });
      }

      await googleCalendarService.createEvent(assignment, courseInfo);
      
      res.json({
        success: true,
        message: 'Event created successfully in Google Calendar'
      });

    } else if (action === 'createCalendar') {
      if (!courseInfo) {
        return res.status(400).json({ success: false, error: 'Course info is required' });
      }

      const calendarId = await googleCalendarService.createCalendar(courseInfo);
      
      res.json({
        success: true,
        message: 'Calendar created successfully',
        calendarId: calendarId
      });

    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Google Calendar API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to interact with Google Calendar',
    });
  }
}
