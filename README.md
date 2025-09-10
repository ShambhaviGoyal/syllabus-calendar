# 📅 Syllabus Calendar - LawBandit Internship Project

A powerful web application that converts law school syllabi into interactive calendars using AI. Upload a PDF syllabus and automatically extract all assignments, readings, and important dates into a beautiful, organized calendar view.

## 🎯 Project Overview

This project was built for the **LawBandit Software Internship Application** (Fall 2025). It addresses the "Syllabus → Calendar" feature requirement, allowing law students to upload their course syllabi and automatically generate interactive calendars with all important dates and assignments.

### Key Features

- 📄 **PDF Upload & Processing**: Upload law school syllabi in PDF format
- 🤖 **AI-Powered Extraction**: Uses OpenAI GPT-4 to intelligently extract assignments and dates
- 📅 **Interactive Calendar View**: Beautiful calendar interface with color-coded assignment types
- 📋 **List View**: Alternative list view with filtering and sorting capabilities
- 📤 **Calendar Export**: Export to ICS format for any calendar app
- 🔗 **Google Calendar Integration**: Direct sync with Google Calendar (optional)
- 🎨 **Modern UI/UX**: Beautiful glass-morphism design with gradient backgrounds and professional typography
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices

## 🚀 Live Demo

- **Live App**: [Deploy to Vercel](#deployment)
- **GitHub Repo**: [View Source Code](https://github.com/yourusername/syllabus-calendar)

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with Inter font family and custom glass-morphism design
- **Calendar**: FullCalendar.js
- **AI Processing**: OpenAI GPT-4o-mini
- **PDF Processing**: pdf-parse
- **File Upload**: Formidable
- **Calendar Export**: ICS format generation
- **Google Integration**: Google Calendar API, OAuth 2.0
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - falls back to mock data if not provided)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/syllabus-calendar.git
cd syllabus-calendar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: If you don't have an OpenAI API key, the app will use mock data for demonstration purposes.

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
syllabus-calendar/
├── pages/
│   ├── api/
│   │   ├── upload-syllabus.ts    # API endpoint for file processing
│   │   ├── export-calendar.ts    # ICS calendar export
│   │   ├── google-auth.ts        # Google OAuth authentication
│   │   └── google-calendar.ts    # Google Calendar API integration
│   ├── auth/
│   │   └── google/
│   │       └── callback.tsx      # Google OAuth callback page
│   ├── _app.tsx                  # Next.js app configuration
│   └── index.tsx                 # Main application page
├── src/
│   ├── components/
│   │   ├── Calendar.tsx          # FullCalendar component
│   │   ├── FileUpload.tsx        # File upload interface
│   │   ├── ListView.tsx          # List view component
│   │   └── AssignmentModal.tsx   # Assignment details modal
│   ├── lib/
│   │   ├── aiProcessor.ts        # OpenAI integration
│   │   ├── pdfParser.ts          # PDF text extraction
│   │   └── googleCalendar.ts     # Google Calendar service
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── public/                       # Static assets
└── uploads/                      # Temporary file storage
```

## 🔧 How It Works

### 1. PDF Upload
Users upload a PDF syllabus through the drag-and-drop interface.

### 2. Text Extraction
The application uses `pdf-parse` to extract raw text from the PDF.

### 3. AI Processing
OpenAI GPT-4o-mini analyzes the text and extracts:
- Course information (title, professor, semester)
- Assignment dates and details
- Reading requirements
- Exam schedules
- Conference/meeting times

### 4. Calendar Generation
The extracted data is formatted and displayed in:
- **Calendar View**: Interactive monthly/weekly calendar with color-coded events
- **List View**: Sortable and filterable list of all assignments

## 🎨 Features in Detail

### Calendar View
- Color-coded assignment types:
  - 🔵 Blue: Readings
  - 🔴 Red: Assignments Due
  - 🟡 Yellow: Exams
  - 🟣 Purple: Presentations
  - 🟢 Green: Conferences
- Click events for detailed information
- Month/week view toggle
- Responsive design

### List View
- Filter by assignment type
- Sort by date or type
- Detailed assignment information
- Summary statistics

### AI Processing
- Intelligent date extraction
- Assignment type classification
- Course information parsing
- Fallback to mock data if API unavailable

## 🚀 Deployment

### Deploy to Vercel

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
   - Add environment variable: `OPENAI_API_KEY`

3. **Deploy**:
   ```bash
   # Vercel will automatically deploy on push
   git push origin main
   ```

### Environment Variables

Set these in your Vercel dashboard:

**Required:**
- `OPENAI_API_KEY`: Your OpenAI API key (optional - falls back to mock data)

**Optional (for Google Calendar integration):**
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Public Google Client ID
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., https://your-app.vercel.app)

#### Setting up Google Calendar Integration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy the credentials to your environment variables
7. Add test users in the OAuth consent screen for development

**Note:** The app works perfectly without Google Calendar integration using the ICS export feature. The Google Calendar integration demonstrates complete OAuth 2.0 implementation and API integration.

#### Current Google Calendar Integration Status

✅ **Fully Implemented Features:**
- Complete OAuth 2.0 authentication flow
- Google Calendar API integration
- Real-time event synchronization
- Professional error handling
- Individual event management
- ICS export for any calendar app

⚠️ **Development Status:**
- OAuth flow works perfectly (redirects to Google sign-in)
- API integration is complete and functional
- Events sync successfully (may require Google verification for production)
- Perfect for demonstrating technical implementation skills

## 🧪 Testing

### With Real Syllabi
1. Upload any law school syllabus PDF
2. The AI will extract and organize all dates
3. View results in both calendar and list formats

### Mock Data
If no API key is provided, the app uses realistic mock data based on actual law school syllabi.

## 🎯 Approach & Design Decisions

### Technical Approach
1. **Next.js API Routes**: Chose Next.js for seamless full-stack development and Vercel deployment
2. **TypeScript**: Ensures type safety and better development experience
3. **AI Integration**: OpenAI GPT-4o-mini for cost-effective, accurate text processing
4. **Progressive Enhancement**: App works with or without AI processing

### User Experience
1. **Intuitive Upload**: Drag-and-drop interface with clear instructions
2. **Dual Views**: Calendar for visual overview, list for detailed information
3. **Modern Design**: Glass-morphism UI with gradient backgrounds and professional typography
4. **Responsive Design**: Works perfectly on desktop, tablet, and mobile
5. **Error Handling**: Graceful fallbacks and clear error messages
6. **Interactive Elements**: Smooth animations and hover effects

### Performance
1. **Efficient AI Processing**: Uses GPT-4o-mini for cost optimization
2. **Client-side Rendering**: Fast, interactive calendar updates
3. **Optimized Bundle**: Minimal dependencies, tree-shaking enabled

## 🔮 Future Enhancements

- **Enhanced Google Calendar Integration**: Full production-ready Google Calendar sync
- **Multiple Syllabus Support**: Handle multiple courses simultaneously
- **Assignment Tracking**: Mark assignments as complete
- **Notifications**: Email/SMS reminders for upcoming assignments
- **Collaborative Features**: Share calendars with study groups
- **Advanced AI Features**: Smart scheduling suggestions and conflict detection

## 🤝 Contributing

This project was built for the LawBandit internship application. For questions or feedback, please reach out!

## 📄 License

This project is created for educational and internship application purposes.

## 🙏 Acknowledgments

- **LawBandit** for the internship opportunity and clear requirements
- **OpenAI** for providing powerful AI capabilities
- **FullCalendar** for the excellent calendar component
- **Tailwind CSS** for the beautiful design system

---

**Built with ❤️ for the LawBandit Software Internship Application**
