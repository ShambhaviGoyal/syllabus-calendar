# Google Calendar Integration Setup

## Current Status: Demo Mode ✅

Your Google Calendar integration is currently working in **demo mode**, which means:
- ✅ The UI shows Google Calendar buttons
- ✅ Clicking "Connect Google Calendar" simulates the connection
- ✅ Clicking "Sync to Google Calendar" shows success messages
- ✅ Individual event "Add to Google Calendar" works in demo mode

## For Production (Real Google Calendar Integration)

To enable real Google Calendar integration, you need to set up Google OAuth credentials:

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://your-app.vercel.app/auth/google/callback` (for production)

### 3. Environment Variables

Add these to your `.env.local` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. For Vercel Deployment

Add the same environment variables in your Vercel dashboard:
- Go to your project settings
- Add environment variables
- Make sure to set `NEXT_PUBLIC_APP_URL` to your Vercel URL

## Testing

### Demo Mode (Current)
- Upload a syllabus
- Click "Connect Google Calendar" - shows demo connection
- Click "Sync to Google Calendar" - shows demo success message
- Click individual events - "Add to Google Calendar" works in demo mode

### Production Mode (After setup)
- Same flow but with real Google OAuth redirect
- Real calendar events will be created in your Google Calendar

## Why Demo Mode?

Demo mode allows you to:
- ✅ Test the complete user experience
- ✅ Show the functionality to LawBandit
- ✅ Deploy without needing Google credentials
- ✅ Focus on the core syllabus processing features

The ICS export feature works perfectly without Google Calendar integration!
