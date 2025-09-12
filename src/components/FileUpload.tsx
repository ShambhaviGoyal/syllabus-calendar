import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { ProcessedSyllabus } from '../types';

interface FileUploadProps {
  onUploadSuccess: (data: ProcessedSyllabus, isMockData?: boolean, message?: string) => void;
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('syllabus', selectedFile);

      const response = await fetch('/api/upload-syllabus', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        onUploadSuccess(result.data, result.isMockData, result.message);
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
    <div className="w-full max-w-lg mx-auto">
      <div className="border-2 border-dashed border-white/40 rounded-2xl p-12 text-center hover:border-blue-400/60 hover:bg-white/20 transition-all duration-300 bg-white/60 backdrop-blur-sm shadow-xl">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Upload Your Syllabus</h3>
          <p className="text-gray-600 font-medium">Drag and drop your PDF file here, or click to browse</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
              <Upload className="h-5 w-5 mr-2" />
              Choose PDF File
            </div>
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">File Selected</p>
                <p className="text-sm text-green-600 truncate">{selectedFile.name}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Processing with AI...
            </>
          ) : (
            <>
              <Upload className="-ml-1 mr-3 h-5 w-5" />
              Upload & Process Syllabus
            </>
          )}
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Supports PDF files up to 10MB</p>
        <p className="mt-1">AI will automatically extract assignments, readings, and important dates</p>
      </div>
    </div>
  );
}