import { useState } from 'react'
import Head from 'next/head'
import FileUpload from '../src/components/FileUpload'
import Calendar from '../src/components/Calendar'
import ListView from '../src/components/ListView'
import { ProcessedSyllabus } from '../src/types'
import { Calendar as CalendarIcon, List, BookOpen } from 'lucide-react'

export default function Home() {
  const [syllabusData, setSyllabusData] = useState<ProcessedSyllabus | null>(null)
  const [error, setError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const handleUploadSuccess = (data: ProcessedSyllabus) => {
    setSyllabusData(data)
    setError('')
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setSyllabusData(null)
  }

  const handleReset = () => {
    setSyllabusData(null)
    setError('')
  }

  return (
    <>
      <Head>
        <title>Syllabus Calendar - Convert Syllabi to Interactive Calendars</title>
        <meta name="description" content="Upload your law school syllabus and automatically convert it to an interactive calendar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Syllabus Calendar
                </h1>
              </div>
              {syllabusData && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Upload New Syllabus
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!syllabusData ? (
            /* Upload Section */
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Transform Your Syllabus into an Interactive Calendar
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload your law school syllabus PDF and automatically extract all assignments, 
                  readings, and important dates into a beautiful calendar view.
                </p>
              </div>

              <div className="mb-8">
                <FileUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>

              {error && (
                <div className="max-w-md mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Results Section */
            <div>
              {/* Course Info */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {syllabusData.courseInfo.title}
                    </h2>
                    <p className="text-gray-600">
                      {syllabusData.courseInfo.professor} • {syllabusData.courseInfo.semester}
                    </p>
                    {syllabusData.courseInfo.classTime && (
                      <p className="text-sm text-gray-500">
                        {syllabusData.courseInfo.classTime}
                        {syllabusData.courseInfo.room && ` • ${syllabusData.courseInfo.room}`}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'calendar'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Calendar
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'list'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <List className="h-4 w-4 mr-2" />
                        List
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar/List View */}
              <div className="bg-white rounded-lg shadow-sm">
                {viewMode === 'calendar' ? (
                  <Calendar assignments={syllabusData.assignments} />
                ) : (
                  <ListView assignments={syllabusData.assignments} />
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {syllabusData.assignments.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {syllabusData.assignments.filter(a => a.type === 'reading').length}
                  </div>
                  <div className="text-sm text-gray-600">Readings</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {syllabusData.assignments.filter(a => a.type === 'assignment').length}
                  </div>
                  <div className="text-sm text-gray-600">Assignments Due</div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Built for Law Bandit Software Internship Application
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}