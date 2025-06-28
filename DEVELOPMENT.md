# Hodor Development Guide

## 🎯 Current Status

✅ **Completed**:
- Clean project structure with `src/` directory
- Modern landing page with prompt-driven interface
- TypeScript configuration with path mapping
- Tailwind CSS setup
- Next.js 14 with App Router
- Basic component structure
- Environment configuration
- Fresh documentation

🔄 **In Progress**:
- Development server running on http://localhost:3001
- Clean, minimal landing page with AI-powered design

## 🚀 Next Development Steps

### Phase 1: Foundation (Week 1-2)

#### 1. Authentication System
```bash
# Install auth dependencies
npm install next-auth @next-auth/prisma-adapter

# Create auth configuration
src/lib/auth.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/(auth)/signin/page.tsx
src/app/(auth)/signup/page.tsx
```

#### 2. Database Setup
```bash
# Install Prisma and Supabase
npm install prisma @prisma/client @supabase/supabase-js

# Initialize Prisma
npx prisma init
npx prisma migrate dev --name init
```

#### 3. User Profile System
```typescript
// Database schema for users
model User {
  id String @id @default(cuid())
  email String @unique
  name String
  avatar String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Profile information
  profile UserProfile?
  resumes Resume[]
  applications Application[]
  searches JobSearch[]
}

model UserProfile {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id])
  
  // Career information
  currentTitle String?
  experienceLevel String?
  targetRoles String[]
  industries String[]
  skills String[]
  
  // Preferences
  remotePreference String?
  salaryMin Int?
  salaryMax Int?
  locationPreferences String[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Phase 2: Core Features (Week 3-4)

#### 1. Job Search Integration
```typescript
// Job APIs to integrate
const jobAPIs = {
  rapidAPI: 'https://rapidapi.com/jobs/',
  adzuna: 'https://api.adzuna.com/',
  jobSearch: 'https://jobs.api.com/',
  reed: 'https://www.reed.co.uk/api/'
}

// Job search service
src/lib/jobs.ts
src/app/api/jobs/search/route.ts
src/app/api/jobs/[id]/route.ts
```

#### 2. AI Matching Engine
```typescript
// OpenAI integration for job matching
src/lib/ai.ts
src/lib/matching.ts
src/app/api/ai/match/route.ts
src/app/api/ai/optimize/route.ts
```

#### 3. Application Tracking
```typescript
// Application management
src/app/(dashboard)/applications/page.tsx
src/app/(dashboard)/jobs/page.tsx
src/app/(dashboard)/profile/page.tsx
src/components/ApplicationCard.tsx
src/components/JobCard.tsx
```

### Phase 3: AI Enhancement (Week 5-6)

#### 1. Resume Optimization
```typescript
// AI-powered resume builder
src/lib/resume.ts
src/app/(dashboard)/resume/page.tsx
src/components/ResumeBuilder.tsx
src/components/ResumePreview.tsx
```

#### 2. Cover Letter Generation
```typescript
// Dynamic cover letter creation
src/lib/coverLetter.ts
src/app/api/ai/cover-letter/route.ts
src/components/CoverLetterEditor.tsx
```

#### 3. Smart Notifications
```typescript
// Email and in-app notifications
src/lib/notifications.ts
src/app/api/notifications/route.ts
src/components/NotificationCenter.tsx
```

## 🗂 File Structure Roadmap

```
src/
├── app/
│   ├── (auth)/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard home)
│   │   ├── jobs/
│   │   │   ├── page.tsx (job search)
│   │   │   └── [id]/page.tsx (job details)
│   │   ├── applications/
│   │   │   ├── page.tsx (application tracking)
│   │   │   └── [id]/page.tsx (application details)
│   │   ├── profile/
│   │   │   ├── page.tsx (profile management)
│   │   │   └── resume/page.tsx (resume builder)
│   │   └── analytics/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── jobs/
│   │   │   ├── search/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── ai/
│   │   │   ├── match/route.ts
│   │   │   ├── optimize/route.ts
│   │   │   └── cover-letter/route.ts
│   │   ├── applications/route.ts
│   │   └── profile/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (landing page - ✅ done)
├── components/
│   ├── ui/ (✅ basic structure done)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── forms/
│   │   ├── SignInForm.tsx
│   │   ├── ProfileForm.tsx
│   │   └── JobSearchForm.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   └── JobFilters.tsx
│   ├── applications/
│   │   ├── ApplicationCard.tsx
│   │   ├── ApplicationList.tsx
│   │   └── ApplicationStatus.tsx
│   ├── resume/
│   │   ├── ResumeBuilder.tsx
│   │   ├── ResumePreview.tsx
│   │   └── ResumeTemplates.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── auth.ts (NextAuth configuration)
│   ├── db.ts (Prisma client)
│   ├── ai.ts (OpenAI integration)
│   ├── jobs.ts (Job search APIs)
│   ├── matching.ts (AI matching algorithm)
│   ├── resume.ts (Resume processing)
│   ├── email.ts (Email service)
│   └── utils.ts (✅ basic utils done)
├── hooks/
│   ├── useAuth.ts
│   ├── useJobs.ts
│   ├── useApplications.ts
│   └── useProfile.ts
├── types/ (✅ comprehensive types done)
│   └── index.ts
└── utils/ (✅ utility functions done)
    └── index.ts
```

## 🔧 Environment Setup Checklist

### Required API Keys & Services

#### Authentication
- [ ] Google OAuth Client ID & Secret
- [ ] NextAuth Secret

#### Database
- [ ] Supabase Project URL & Keys
- [ ] Database URL for Prisma

#### AI Services
- [ ] OpenAI API Key (GPT-4 access)
- [ ] Anthropic API Key (Claude access)
- [ ] Pinecone API Key (Vector database)

#### Job APIs
- [ ] RapidAPI Key
- [ ] Adzuna App ID & Key
- [ ] LinkedIn API Access (if available)

#### Infrastructure
- [ ] Cloudinary Account (file storage)
- [ ] Resend API Key (emails)
- [ ] Stripe Keys (payments)
- [ ] Upstash Redis (caching)

### Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript checking

# Database
npx prisma studio       # Open Prisma Studio
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database

# Deployment
vercel --prod           # Deploy to Vercel
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Accent**: Pink (#EC4899)
- **Background**: Gray 950 (#030712)
- **Surface**: Gray 900 (#111827)

### Typography
- **Font**: Inter (from Google Fonts)
- **Headings**: Font weights 600-700
- **Body**: Font weight 400-500

### Components
- **Buttons**: Rounded-xl, gradient backgrounds
- **Cards**: Backdrop blur, border subtle
- **Inputs**: Focus states with colored borders
- **Animations**: Smooth transitions, hover effects

## 📊 Success Metrics to Track

### User Engagement
- Sign-up conversion rate from landing page
- Daily/Monthly active users
- Session duration
- Feature adoption rates

### Application Success
- Jobs applied to per user
- Interview rate (interviews/applications)
- Offer rate (offers/applications)
- Time to hire

### AI Performance
- Job match accuracy (user feedback)
- Resume optimization effectiveness
- Cover letter response rates
- Search relevancy scores

## 🚀 Launch Strategy

### Beta Launch (Week 7-8)
1. **Internal Testing**: Team testing and bug fixes
2. **Limited Beta**: 50 users from network
3. **Feedback Collection**: User interviews and surveys
4. **Iteration**: Quick fixes based on feedback

### Public Launch (Week 9-10)
1. **Product Hunt Launch**: Prepare assets and community
2. **Content Marketing**: Blog posts, social media
3. **Influencer Outreach**: Career coaches, recruiters
4. **Community Building**: Discord, Twitter engagement

### Growth (Month 2-3)
1. **Referral Program**: Incentivize user referrals
2. **Partnership**: Job boards, career services
3. **SEO**: Content optimization for job search terms
4. **Paid Ads**: Google, LinkedIn, Facebook campaigns

## 📝 Current Tasks

### Immediate (Next 2-3 days)
1. Fix any remaining TypeScript errors
2. Set up Supabase project and database
3. Implement Google OAuth authentication
4. Create basic dashboard layout
5. Set up job search API integration

### This Week
1. Build user profile creation flow
2. Implement basic job search functionality
3. Create application tracking system
4. Add email notifications
5. Test end-to-end user flow

### Next Week
1. Integrate OpenAI for AI matching
2. Build resume upload and parsing
3. Implement cover letter generation
4. Add analytics and tracking
5. Polish UI/UX based on testing

---

*This guide will be updated as we progress through development. Each completed feature should be checked off and new tasks added as needed.*
