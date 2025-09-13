import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DebugOAuth() {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
      allNextPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')),
      allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('VERCEL')),
      currentUrl: typeof window !== 'undefined' ? window.location.origin : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      nodeEnv: process.env.NODE_ENV,
      isServer: typeof window === 'undefined'
    };
    
    setDebugInfo(info);
    console.log('Debug OAuth Info:', info);
    console.log('All process.env keys:', Object.keys(process.env));
  }, []);

  const generateOAuthUrl = () => {
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
      : 'https://syllabustocalendar-alpha.vercel.app/auth/google/callback';
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      prompt: 'consent'
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('Generated OAuth URL:', url);
    console.log('Redirect URI:', redirectUri);
    
    return { url, redirectUri };
  };

  const testOAuth = () => {
    const { url, redirectUri } = generateOAuthUrl();
    alert(`OAuth URL: ${url}\n\nRedirect URI: ${redirectUri}`);
  };

  const openOAuth = () => {
    const { url } = generateOAuthUrl();
    window.open(url, '_blank');
  };

  return (
    <>
      <Head>
        <title>Debug OAuth - Syllabus Calendar</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">OAuth Debug Information</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Environment Variables:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={testOAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4"
              >
                Test OAuth URL Generation
              </button>
              
              <button
                onClick={openOAuth}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Open OAuth URL
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">Next Steps:</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Check the generated OAuth URL above</li>
                <li>2. Verify the redirect URI matches your Google Cloud Console configuration</li>
                <li>3. Make sure your Vercel URL is exactly: <code>https://syllabustocalendar-alpha.vercel.app</code></li>
                <li>4. Test the OAuth flow by clicking "Open OAuth URL"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
