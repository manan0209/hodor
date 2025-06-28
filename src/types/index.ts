export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  created_at: string
  updated_at: string
  subscription_tier: 'free' | 'pro'
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary_min?: number
  salary_max?: number
  description: string
  requirements: string[]
  benefits: string[]
  remote: boolean
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  job_type: 'full time' | 'part time' | 'contract' | 'internship'
  posted_date: string
  source: string
  source_url: string
  ai_match_score?: number
  ai_match_reasons?: string[]
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  status: 'draft' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  applied_date?: string
  cover_letter?: string
  resume_version?: string
  notes?: string
  interview_dates?: string[]
  offer_details?: {
    salary: number
    benefits: string[]
    start_date: string
  }
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_id: string
  name: string
  content: {
    personal_info: {
      name: string
      email: string
      phone: string
      location: string
      linkedin?: string
      github?: string
      website?: string
    }
    summary: string
    experience: Array<{
      title: string
      company: string
      location: string
      start_date: string
      end_date?: string
      current: boolean
      description: string[]
    }>
    education: Array<{
      degree: string
      school: string
      location: string
      graduation_date: string
      gpa?: string
    }>
    skills: {
      technical: string[]
      soft: string[]
    }
    projects?: Array<{
      name: string
      description: string
      technologies: string[]
      url?: string
      github?: string
    }>
    certifications?: Array<{
      name: string
      issuer: string
      date: string
      url?: string
    }>
  }
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface JobSearch {
  id: string
  user_id: string
  query: string
  filters: {
    locations: string[]
    remote: boolean
    salary_min?: number
    experience_levels: string[]
    job_types: string[]
    companies?: string[]
  }
  results_count: number
  created_at: string
}

export interface AIProfile {
  id: string
  user_id: string
  preferences: {
    ideal_role: string
    preferred_industries: string[]
    preferred_companies: string[]
    location_preferences: string[]
    remote_preference: 'required' | 'preferred' | 'no-preference' | 'not-preferred'
    salary_expectations: {
      min: number
      max: number
      currency: string
    }
    work_style: string[]
    career_goals: string
  }
  skills_profile: {
    primary_skills: string[]
    secondary_skills: string[]
    skill_levels: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'expert'>
    certifications: string[]
  }
  ai_insights: {
    strengths: string[]
    improvement_areas: string[]
    market_analysis: string
    recommended_roles: string[]
  }
  created_at: string
  updated_at: string
}

export interface Analytics {
  user_id: string
  period: 'week' | 'month' | 'quarter' | 'year'
  metrics: {
    applications_sent: number
    interviews_scheduled: number
    offers_received: number
    response_rate: number
    average_response_time: number
    top_skills_matched: string[]
    industry_breakdown: Record<string, number>
    salary_range_applied: {
      min: number
      max: number
      average: number
    }
  }
  trends: {
    application_velocity: number[]
    response_rates: number[]
    interview_success_rate: number[]
  }
  generated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'new_match' | 'application_update' | 'interview_reminder' | 'system' | 'achievement'
  title: string
  message: string
  read: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
}

// Form Types
export interface JobSearchFilters {
  query: string
  locations: string[]
  remote: boolean
  salary_min?: number
  salary_max?: number
  experience_levels: string[]
  job_types: string[]
  companies: string[]
  date_posted: 'any' | 'today' | 'week' | 'month'
}

export interface OnboardingData {
  personal_info: {
    name: string
    email: string
    phone: string
    location: string
  }
  career_info: {
    current_title: string
    experience_level: string
    target_roles: string[]
    industries: string[]
  }
  preferences: {
    remote_preference: string
    salary_expectations: {
      min: number
      max: number
    }
    location_preferences: string[]
  }
  skills: string[]
  resume_file?: File
}
