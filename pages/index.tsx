import { useState, useEffect } from 'react'
import Head from 'next/head'
import FileUpload from '../src/components/FileUpload'
import Calendar from '../src/components/Calendar'
import ListView from '../src/components/ListView'
import { ProcessedSyllabus } from '../src/types'
import { Calendar as CalendarIcon, List, BookOpen, Download, Calendar as CalendarExport, FileText, Plus } from 'lucide-react'

export default function Home() {
  const [syllabusData, setSyllabusData] = useState<ProcessedSyllabus | null>(null)
  const [error, setError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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

  const handleExportCalendar = async () => {
    if (!syllabusData) return;

    try {
      const response = await fetch('/api/export-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignments: syllabusData.assignments,
          courseInfo: syllabusData.courseInfo
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${syllabusData.courseInfo.title}-calendar.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export calendar');
      }
    } catch (error) {
      setError('Failed to export calendar');
    }
  }

  const handleGoogleAuth = () => {
    // Check if we have Google Client ID configured
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      // Demo mode - simulate connection for testing
      setIsGoogleLoading(true);
      setTimeout(() => {
        setIsGoogleConnected(true);
        setIsGoogleLoading(false);
        alert('Demo mode: Google Calendar connection simulated. In production, this would redirect to Google OAuth.');
      }, 2000);
      return;
    }

    // Redirect to Google OAuth
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }

  const handleGoogleCalendarSync = async () => {
    if (!syllabusData || !isGoogleConnected) return;

    setIsGoogleLoading(true);
    try {
      const accessToken = localStorage.getItem('google_calendar_token');
      
      // Check if we're in demo mode (no real Google credentials)
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        // Demo mode - simulate successful sync
        setTimeout(() => {
          setIsGoogleLoading(false);
          alert(`Demo mode: Successfully synced ${syllabusData.assignments.length} events to Google Calendar! In production, this would create real calendar events.`);
        }, 2000);
        return;
      }

      const response = await fetch('/api/google-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          assignments: syllabusData.assignments,
          courseInfo: syllabusData.courseInfo,
          action: 'createEvents'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setError('');
        alert(`Successfully synced ${result.created} events to Google Calendar!`);
      } else {
        setError(result.error || 'Failed to sync with Google Calendar');
      }
    } catch (error) {
      setError('Failed to sync with Google Calendar');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  // Check Google connection status on component mount
  useEffect(() => {
    // Clear any existing token to force fresh OAuth flow
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_calendar_connected');
    setIsGoogleConnected(false);
  }, []);

  return (
    <>
      <Head>
        <title>Syllabus Calendar - Convert Syllabi to Interactive Calendars</title>
        <meta name="description" content="Upload your law school syllabus and automatically convert it to an interactive calendar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl mr-4 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Syllabus Calendar
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Transform your syllabi into interactive calendars</p>
                </div>
              </div>
              {syllabusData && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
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
              <div className="mb-12">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                  AI-Powered Syllabus Processing
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Transform Your Syllabus into an 
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Interactive Calendar</span>
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                  Upload your law school syllabus PDF and watch as AI automatically extracts all assignments, 
                  readings, and important dates into a beautiful, organized calendar view.
                </p>
              </div>

              <div className="mb-8">
                <FileUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>

              {error && (
                <div className="max-w-md mx-auto mb-4 p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Extraction</h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">AI automatically identifies assignments, readings, and important dates from your syllabus.</p>
                </div>
                
                <div className="p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CalendarIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Calendar</h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">View your assignments in a beautiful, color-coded calendar with multiple view options.</p>
                </div>
                
                <div className="p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Download className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Export & Sync</h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">Export your calendar to Google Calendar, Outlook, or any calendar app.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-8">
              {/* Course Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-6 lg:mb-0">
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {syllabusData.courseInfo.title}
                        </h2>
                        <p className="text-lg text-gray-600 font-medium">
                          {syllabusData.courseInfo.professor} • {syllabusData.courseInfo.semester}
                        </p>
                      </div>
                    </div>
                    {syllabusData.courseInfo.classTime && (
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 w-fit">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {syllabusData.courseInfo.classTime}
                        {syllabusData.courseInfo.room && ` • ${syllabusData.courseInfo.room}`}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
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
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleExportCalendar}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        <CalendarExport className="h-4 w-4 mr-2" />
                        Export ICS File
                      </button>
                      
                      {!isGoogleConnected ? (
                        <button
                          onClick={handleGoogleAuth}
                          disabled={isGoogleLoading}
                          className="flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {isGoogleLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          ) : (
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          )}
                          Connect Google Calendar
                        </button>
                      ) : (
                        <button
                          onClick={handleGoogleCalendarSync}
                          disabled={isGoogleLoading}
                          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {isGoogleLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Sync to Google Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar/List View */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {viewMode === 'calendar' ? (
                  <Calendar assignments={syllabusData.assignments} courseInfo={syllabusData.courseInfo} />
                ) : (
                  <ListView assignments={syllabusData.assignments} />
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {syllabusData.assignments.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Items</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {syllabusData.assignments.filter(a => a.type === 'reading').length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Readings</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {syllabusData.assignments.filter(a => a.type === 'assignment').length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Assignments Due</div>
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