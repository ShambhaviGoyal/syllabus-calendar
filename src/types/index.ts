export interface Assignment {
  id: string;
  date: string; // ISO format (YYYY-MM-DD)
  title: string;
  type: 'reading' | 'assignment' | 'exam' | 'presentation' | 'conference' | 'other';
  description?: string;
  isRequired: boolean;
  timeStart?: string; // HH:MM format
  timeEnd?: string; // HH:MM format
}

export interface CourseInfo {
  title: string;
  professor: string;
  semester: string;
  classTime?: string;
  room?: string;
}

export interface ProcessedSyllabus {
  assignments: Assignment[];
  courseInfo: CourseInfo;
  success: boolean;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: ProcessedSyllabus;
  error?: string;
}