# Talent Hub - Job Portal Platform

## Overview
Talent Hub is a modern job portal platform built with React and TypeScript, designed to connect employers with job seekers. The platform offers a seamless experience for both employers to post jobs and manage applications, and for job seekers to find and apply for positions matching their skills.

## Key Features

### For Employers
- Post and manage job listings
- Track application statistics
- Review candidate applications
- Real-time application status updates
- Detailed applicant profiles
- Application management workflow

### For Job Seekers
- Create and manage professional profiles
- Search and filter job listings
- Save interesting jobs
- Easy job application process
- Track application status
- Withdraw applications
- Resume and cover letter management

## Technology Stack
- **Frontend**: React, TypeScript
- **UI Framework**: Tailwind CSS, shadcn-ui
- **Build Tool**: Vite
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time Updates**: Supabase Realtime

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/talent-hub.git
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory and add the following:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Project Structure
```
talent-hub/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── integrations/     # Third-party integrations
├── public/               # Static assets
└── ...config files
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production

## Deployment
The application can be deployed to any static hosting service. We recommend:
- Vercel

