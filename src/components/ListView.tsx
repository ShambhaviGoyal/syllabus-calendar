import React, { useState } from 'react';
import { Assignment } from '../types';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, BookOpen, FileText, Presentation, Users, AlertCircle } from 'lucide-react';

interface ListViewProps {
  assignments: Assignment[];
}

const ListView: React.FC<ListViewProps> = ({ assignments }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');

  // Sort assignments
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return a.type.localeCompare(b.type);
    }
  });

  // Filter assignments
  const filteredAssignments = filterType === 'all' 
    ? sortedAssignments 
    : sortedAssignments.filter(assignment => assignment.type === filterType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'exam': return <AlertCircle className="h-4 w-4" />;
      case 'presentation': return <Presentation className="h-4 w-4" />;
      case 'conference': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reading': return 'text-blue-600 bg-blue-50';
      case 'assignment': return 'text-red-600 bg-red-50';
      case 'exam': return 'text-yellow-600 bg-yellow-50';
      case 'presentation': return 'text-purple-600 bg-purple-50';
      case 'conference': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const uniqueTypes = [...new Set(assignments.map(a => a.type))];

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No assignments found for the selected filter.
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(assignment.type)}`}>
                      {getTypeIcon(assignment.type)}
                      <span className="ml-1 capitalize">{assignment.type}</span>
                    </span>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(parseISO(assignment.date), 'MMM d, yyyy')}
                    </div>

                    {(assignment.timeStart || assignment.timeEnd) && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {assignment.timeStart && format(parseISO(`2000-01-01T${assignment.timeStart}`), 'h:mm a')}
                        {assignment.timeStart && assignment.timeEnd && ' - '}
                        {assignment.timeEnd && format(parseISO(`2000-01-01T${assignment.timeEnd}`), 'h:mm a')}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {assignment.title}
                  </h3>

                  {assignment.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {assignment.description}
                    </p>
                  )}
                </div>

                {assignment.isRequired && (
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      Required
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900">Total: </span>
            <span className="text-gray-600">{filteredAssignments.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Required: </span>
            <span className="text-gray-600">{filteredAssignments.filter(a => a.isRequired).length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Readings: </span>
            <span className="text-gray-600">{filteredAssignments.filter(a => a.type === 'reading').length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Assignments: </span>
            <span className="text-gray-600">{filteredAssignments.filter(a => a.type === 'assignment').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListView;