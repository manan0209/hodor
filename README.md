# Hodor

A modern job search platform that streamlines job discovery, resume optimization, and application tracking for job seekers.

## Features

- **Job Search**: Real-time search across 200+ job boards with intelligent filtering and ranking
- **Resume Builder**: Professional templates with ATS optimization and PDF export
- **Resume Analysis**: Upload and analyze existing resumes with improvement suggestions  
- **User Dashboard**: Track search history, saved jobs, and usage statistics
- **Quota Management**: Fair usage system with monthly search limits

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Google OAuth via Supabase Auth
- **APIs**: JSearch API for job aggregation, PDF.js for document processing
- **Deployment**: Vercel with analytics integration

## Quick Start

```bash
git clone https://github.com/your-username/hodor.git
cd hodor
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAPIDAPI_KEY=your_rapidapi_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Database Setup

The application uses Supabase PostgreSQL with the following tables:
- `user_quotas` - Monthly search limits and usage tracking
- `user_job_searches` - Search history and job data storage
- `user_saved_jobs` - Bookmarked positions and preferences

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test your changes thoroughly
5. Submit a pull request

## License

MIT License

Copyright (c) 2025 Hodor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
