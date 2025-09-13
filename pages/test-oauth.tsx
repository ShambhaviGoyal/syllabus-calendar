import { useState } from 'react';

export default function TestOAuth() {
  const [result, setResult] = useState<string>('');

  const testOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = 'https://syllabustocalendar-alpha.vercel.app/auth/google/callback';
    
    console.log('Testing OAuth with:');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent`;
    
    console.log('Full OAuth URL:', authUrl);
    setResult(authUrl);
    
    // Try to redirect
    window.location.href = authUrl;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>OAuth Test Page</h1>
      <p>Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}</p>
      <p>Redirect URI: https://syllabustocalendar-alpha.vercel.app/auth/google/callback</p>
      <button onClick={testOAuth} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Test OAuth
      </button>
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Generated URL:</h3>
          <textarea 
            value={result} 
            readOnly 
            style={{ width: '100%', height: '100px', fontSize: '12px' }}
          />
        </div>
      )}
    </div>
  );
}
