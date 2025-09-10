import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { ProcessedSyllabus } from '../types';

interface FileUploadProps {
  onUploadSuccess: (data: ProcessedSyllabus) => void;
  onUploadError: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        onUploadError('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('syllabus', selectedFile);

      const response = await fetch('/api/upload-syllabus', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        onUploadSuccess(result.data);
      } else {
        onUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <div className="mb-4">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        
        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-sm text-gray-600">
              Click to select a PDF syllabus or drag and drop
            </span>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {selectedFile && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-700">
            Selected: {selectedFile.name}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="-ml-1 mr-2 h-4 w-4" />
              Upload & Process
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Upload your law school syllabus (PDF format) to automatically extract assignments and dates
      </div>
    </div>
  );
}