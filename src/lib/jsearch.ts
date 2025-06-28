// JSearch API integration for job search
// Free tier: 200 requests/month

export interface JobSearchParams {
  query: string
  location?: string
  employmentType?: string
  experienceLevel?: string
  page?: number
  numPages?: number
}

export interface Job {
  job_id: string
  employer_name: string
  employer_logo?: string
  job_title: string
  job_description: string
  job_apply_link: string
  job_city?: string
  job_state?: string
  job_country?: string
  job_posted_at_timestamp?: number
  job_posted_at_datetime_utc?: string
  job_employment_type?: string
  job_is_remote?: boolean
  job_min_salary?: number
  job_max_salary?: number
  job_salary_currency?: string
  job_salary_period?: string
  job_highlights?: {
    Qualifications?: string[]
    Responsibilities?: string[]
    Benefits?: string[]
  }
  job_required_experience?: {
    no_experience_required?: boolean
    required_experience_in_months?: number
    experience_mentioned?: boolean
    experience_preferred?: boolean
  }
}

export interface JobSearchResponse {
  status: string
  request_id: string
  parameters: any
  data: Job[]
  num_pages: number
}

const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

if (!RAPIDAPI_KEY) {
  console.warn('RAPIDAPI_KEY not found in environment variables')
}

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI key not configured')
  }

  // Check cache first
  const cached = getCachedSearch(params)
  if (cached) {
    return cached
  }

  // Build query string
  const query = `${params.query}${params.location ? ` in ${params.location}` : ''}`
  
  const url = new URL('https://jsearch.p.rapidapi.com/search')
  url.searchParams.append('query', query)
  url.searchParams.append('page', (params.page || 1).toString())
  url.searchParams.append('num_pages', (params.numPages || 1).toString())
  
  // Limit to 3 results max for free tier
  url.searchParams.append('page_size', '3')

  if (params.employmentType) {
    url.searchParams.append('employment_types', params.employmentType.toUpperCase())
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the successful response
    setCachedSearch(params, data)
    
    return data
  } catch (error) {
    console.error('Job search API error:', error)
    throw error
  }
}

// Helper function to format job employment type
export function formatEmploymentType(jobType: string): string {
  const typeMap: { [key: string]: string } = {
    'full time job': 'FULLTIME',
    'part time job': 'PARTTIME',
    'internship': 'INTERN',
  }
  return typeMap[jobType.toLowerCase()] || 'FULLTIME'
}

// Helper function to format experience level
export function formatExperienceLevel(experience: string): string {
  // JSearch doesn't have direct experience filtering, 
  // but we can use it in the query
  return experience
}

// Helper function to clean and format location
export function formatLocation(location: string): string {
  if (!location) return ''
  
  // Remove "in " prefix if present
  const cleaned = location.replace(/^in\s+/i, '')
  
  // Handle special cases
  const locationMap: { [key: string]: string } = {
    'delhi ncr': 'Delhi NCR, India',
    'mumbai': 'Mumbai, India',
    'bangalore': 'Bangalore, India',
    'pune': 'Pune, India',
    'hyderabad': 'Hyderabad, India',
    'chennai': 'Chennai, India',
    'anywhere in india': 'India',
    'remote': 'Remote',
    'hybrid': 'Remote',
  }
  
  return locationMap[cleaned.toLowerCase()] || cleaned
}

// Rate limiting helper with better tracking
interface RateLimitData {
  count: number
  resetDate: string // YYYY-MM format for monthly reset
}

function getRateLimitData(): RateLimitData {
  if (typeof window !== 'undefined') {
    // Client-side: use localStorage (fallback)
    const stored = localStorage.getItem('jsearch_rate_limit')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {}
    }
  }
  
  // Server-side: use environment variable or default
  const envCount = process.env.JSEARCH_REQUEST_COUNT
  const envResetDate = process.env.JSEARCH_RESET_DATE
  
  return {
    count: envCount ? parseInt(envCount) : 0,
    resetDate: envResetDate || new Date().toISOString().slice(0, 7) // YYYY-MM
  }
}

function saveRateLimitData(data: RateLimitData): void {
  if (typeof window !== 'undefined') {
    // Client-side: use localStorage
    localStorage.setItem('jsearch_rate_limit', JSON.stringify(data))
  }
  // Server-side: In a real app, you'd save to database
  // For MVP, we'll just track in memory
}

export function checkRateLimit(): { allowed: boolean; remaining: number; resetDate?: string } {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const rateLimitData = getRateLimitData()
  
  // Reset counter if it's a new month
  if (rateLimitData.resetDate !== currentMonth) {
    rateLimitData.count = 0
    rateLimitData.resetDate = currentMonth
  }
  
  const monthlyLimit = 200
  const remaining = monthlyLimit - rateLimitData.count
  
  if (rateLimitData.count >= monthlyLimit) {
    return { 
      allowed: false, 
      remaining: 0,
      resetDate: getNextMonthDate(rateLimitData.resetDate)
    }
  }
  
  // Increment counter
  rateLimitData.count++
  saveRateLimitData(rateLimitData)
  
  return { 
    allowed: true, 
    remaining: remaining - 1,
    resetDate: getNextMonthDate(rateLimitData.resetDate)
  }
}

export function getRateLimitStatus(): { remaining: number; total: number; resetDate?: string } {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const rateLimitData = getRateLimitData()
  
  // Reset counter if it's a new month
  if (rateLimitData.resetDate !== currentMonth) {
    rateLimitData.count = 0
    rateLimitData.resetDate = currentMonth
  }
  
  const monthlyLimit = 200
  const remaining = monthlyLimit - rateLimitData.count
  
  return {
    remaining: Math.max(0, remaining),
    total: monthlyLimit,
    resetDate: getNextMonthDate(rateLimitData.resetDate)
  }
}

function getNextMonthDate(currentMonth: string): string {
  const date = new Date(currentMonth + '-01')
  date.setMonth(date.getMonth() + 1)
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

// Simple in-memory cache for job searches
interface CacheEntry {
  data: JobSearchResponse
  timestamp: number
  searchKey: string
}

const searchCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function generateSearchKey(params: JobSearchParams): string {
  return `${params.query}_${params.location}_${params.employmentType}_${params.page}`.toLowerCase()
}

export function getCachedSearch(params: JobSearchParams): JobSearchResponse | null {
  const key = generateSearchKey(params)
  const cached = searchCache.get(key)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('Using cached job search results')
    return cached.data
  }
  
  return null
}

export function setCachedSearch(params: JobSearchParams, data: JobSearchResponse): void {
  const key = generateSearchKey(params)
  searchCache.set(key, {
    data,
    timestamp: Date.now(),
    searchKey: key
  })
  
  // Clean old cache entries (keep last 50)
  if (searchCache.size > 50) {
    const entries = Array.from(searchCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < 10; i++) {
      searchCache.delete(entries[i][0])
    }
  }
}
