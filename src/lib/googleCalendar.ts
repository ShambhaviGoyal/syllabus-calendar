import { Assignment, CourseInfo } from '../types';

// Google Calendar API configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;


export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  colorId?: string;
  visibility?: string;
  transparency?: string;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;

  constructor() {
    // Check if we have a stored access token
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('google_calendar_token');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Get Google Calendar authorization URL
  getAuthUrl(): string {
    // Use environment variable for redirect URI, fallback to Vercel URL
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
      : process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/google/callback`
      : 'https://syllabustocalendar-alpha.vercel.app/auth/google/callback';
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return authUrl;
  }

  // Set access token
  setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_calendar_token', token);
    }
  }

  // Clear access token
  clearAccessToken(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_calendar_token');
    }
  }

  // Convert assignment to Google Calendar event
  private assignmentToGoogleEvent(assignment: Assignment, courseInfo?: CourseInfo): GoogleCalendarEvent {
    const startDate = new Date(assignment.date);
    
    // Check if date is valid
    if (isNaN(startDate.getTime())) {
      throw new Error(`Invalid date format: ${assignment.date}`);
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Get color based on assignment type
    const colorMap: { [key: string]: string } = {
      reading: '2',      // Green
      assignment: '11',  // Red
      exam: '5',         // Yellow
      presentation: '6', // Orange
      conference: '10',  // Blue
      other: '1'         // Lavender
    };

    const description = [
      assignment.description || '',
      courseInfo ? `Course: ${courseInfo.title}` : '',
      courseInfo?.professor ? `Professor: ${courseInfo.professor}` : '',
      `Type: ${assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}`,
      assignment.isRequired ? 'Required' : 'Optional'
    ].filter(Boolean).join('\n\n');

    return {
      summary: assignment.title,
      description: description,
      start: {
        date: startDate.toISOString().split('T')[0],
        timeZone: 'America/New_York'
      },
      end: {
        date: endDate.toISOString().split('T')[0],
        timeZone: 'America/New_York'
      },
      colorId: colorMap[assignment.type] || '1',
      visibility: 'private',
      transparency: 'opaque'
    };
  }

  // Create a single event in Google Calendar
  async createEvent(assignment: Assignment, courseInfo?: CourseInfo): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const event = this.assignmentToGoogleEvent(assignment, courseInfo);
      
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          this.clearAccessToken();
          throw new Error('Authentication expired. Please re-authenticate.');
        }
        throw new Error(`Failed to create event: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Create multiple events in Google Calendar
  async createEvents(assignments: Assignment[], courseInfo?: CourseInfo): Promise<{ success: number; failed: number }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    let success = 0;
    let failed = 0;

    for (const assignment of assignments) {
      try {
        await this.createEvent(assignment, courseInfo);
        success++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  // Create a new calendar for the course
  async createCalendar(courseInfo: CourseInfo): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const calendar = {
        summary: `${courseInfo.title} - Syllabus Calendar`,
        description: `Calendar for ${courseInfo.title} with Professor ${courseInfo.professor}`,
        timeZone: 'America/New_York'
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendar)
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAccessToken();
          throw new Error('Authentication expired. Please re-authenticate.');
        }
        throw new Error(`Failed to create calendar: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error creating Google Calendar:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const googleCalendarService = new GoogleCalendarService();
