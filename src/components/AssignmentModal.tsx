import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, FileText, Presentation, Users, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Assignment, CourseInfo } from '../types';
import { format, parseISO } from 'date-fns';

interface AssignmentModalProps {
  assignment: Assignment | null;
  courseInfo?: CourseInfo;
  isOpen: boolean;
  onClose: () => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ assignment, courseInfo, isOpen, onClose }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Check Google connection status
  React.useEffect(() => {
    const token = localStorage.getItem('google_calendar_token');
    setIsGoogleConnected(!!token);
  }, []);

  if (!isOpen || !assignment) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return <BookOpen className="h-5 w-5" />;
      case 'assignment': return <FileText className="h-5 w-5" />;
      case 'exam': return <AlertCircle className="h-5 w-5" />;
      case 'presentation': return <Presentation className="h-5 w-5" />;
      case 'conference': return <Users className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reading': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'assignment': return 'text-red-600 bg-red-50 border-red-200';
      case 'exam': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'presentation': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'conference': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleGoogleCalendarAdd = async () => {
    if (!isGoogleConnected) {
      alert('Please connect to Google Calendar first from the main page.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const accessToken = localStorage.getItem('google_calendar_token');
      
      // Check if we're in demo mode (no real Google credentials)
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        // Demo mode - simulate successful addition
        setTimeout(() => {
          setIsGoogleLoading(false);
          alert('Demo mode: Event added to Google Calendar successfully! In production, this would create a real calendar event.');
        }, 1500);
        return;
      }

      const response = await fetch('/api/google-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          assignment,
          courseInfo,
          action: 'createEvent'
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Event added to Google Calendar successfully!');
      } else {
        alert(result.error || 'Failed to add event to Google Calendar');
      }
    } catch (error) {
      alert('Failed to add event to Google Calendar');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white/20 text-white`}>
                  {getTypeIcon(assignment.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {assignment.title}
                  </h3>
                  <p className="text-blue-100 text-sm capitalize">
                    {assignment.type}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Date and Time Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium text-gray-900">
                    {format(parseISO(assignment.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {(assignment.timeStart || assignment.timeEnd) && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {assignment.timeStart && format(parseISO(`2000-01-01T${assignment.timeStart}`), 'h:mm a')}
                      {assignment.timeStart && assignment.timeEnd && ' - '}
                      {assignment.timeEnd && format(parseISO(`2000-01-01T${assignment.timeEnd}`), 'h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {assignment.description && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>
              </div>
            )}

            {/* Status and Type */}
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(assignment.type)}`}>
                {getTypeIcon(assignment.type)}
                <span className="ml-2 capitalize">{assignment.type}</span>
              </span>
              
              {assignment.isRequired && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-700 bg-red-50 border border-red-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Required
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  try {
                    // Generate ICS content for this single assignment
                    const icsContent = generateSingleEventICS(assignment, courseInfo);
                    
                    // Create and download the file
                    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${assignment.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-event.ics`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error exporting single event:', error);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download ICS
              </button>
              {isGoogleConnected && (
                <button
                  onClick={handleGoogleCalendarAdd}
                  disabled={isGoogleLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1 inline" />
                      Add to Google Calendar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateSingleEventICS(assignment: Assignment, courseInfo?: CourseInfo): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
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

  const courseTitle = courseInfo?.title || 'Syllabus Calendar';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Syllabus Calendar//LawBandit//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${courseTitle}`,
    `X-WR-CALDESC:Generated from ${courseTitle}`,
    '',
    'BEGIN:VEVENT',
    `UID:${assignment.id}@syllabus-calendar.com`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;VALUE=DATE:${startDateStr.split('T')[0]}`,
    `DTEND;VALUE=DATE:${endDateStr.split('T')[0]}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `CATEGORIES:${assignment.type.toUpperCase()}`,
    assignment.isRequired ? 'STATUS:CONFIRMED' : 'STATUS:TENTATIVE',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return ics.join('\r\n');
}

export default AssignmentModal;
