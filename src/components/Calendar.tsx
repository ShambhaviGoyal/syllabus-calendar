import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Assignment } from '../types';
import AssignmentModal from './AssignmentModal';

interface CalendarProps {
  assignments: Assignment[];
  courseInfo?: any;
}

const Calendar: React.FC<CalendarProps> = ({ assignments, courseInfo }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert assignments to FullCalendar events
  const events = assignments.map(assignment => {
    const typeColors: { [key: string]: string } = {
      reading: '#3B82F6',     // Blue
      assignment: '#EF4444',   // Red
      exam: '#F59E0B',        // Yellow
      presentation: '#8B5CF6', // Purple
      conference: '#10B981',   // Green
      other: '#6B7280'        // Gray
    };

    // Validate date format
    const dateStr = assignment.date;
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    
    if (!isValidDate) {
      console.warn('Invalid date format for assignment:', assignment.title, 'Date:', dateStr);
    }

    return {
      id: assignment.id,
      title: assignment.title,
      date: assignment.date,
      backgroundColor: typeColors[assignment.type] || typeColors.other,
      borderColor: typeColors[assignment.type] || typeColors.other,
      textColor: 'white',
      extendedProps: {
        description: assignment.description,
        type: assignment.type,
        isRequired: assignment.isRequired,
        timeStart: assignment.timeStart,
        timeEnd: assignment.timeEnd
      }
    };
  });

  const handleEventClick = (info: any) => {
    const { extendedProps } = info.event;
    const assignment = assignments.find(a => a.id === info.event.id);
    
    if (assignment) {
      setSelectedAssignment(assignment);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Readings</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Assignments Due</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Exams</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span>Presentations</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Conferences</span>
          </div>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        height="auto"
        initialDate={assignments.length > 0 ? assignments[0].date : undefined}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkClick="popover"
      />

      {/* Assignment Modal */}
      <AssignmentModal
        assignment={selectedAssignment}
        courseInfo={courseInfo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Calendar;