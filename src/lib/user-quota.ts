import { getSupabaseAdmin } from './supabase'

export interface UserQuota {
  id: number
  user_id: string
  month_year: string
  searches_used: number
  max_searches: number
  created_at: string
  updated_at: string
}

export interface UserJobSearch {
  id: number
  user_id: string
  search_query: string
  search_location?: string
  search_employment_type?: string
  search_experience?: string
  job_data: any[]
  search_timestamp: string
  month_year: string
}

export interface SavedJob {
  id: number
  user_id: string
  job_id: string
  job_data: any
  match_score: number
  is_applied: boolean
  is_favorited: boolean
  saved_at: string
  applied_at?: string
  notes?: string
}

// Get current month in YYYY-MM format
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

// Get user's quota for current month
export async function getUserQuota(userId: string): Promise<UserQuota | null> {
  const currentMonth = getCurrentMonth()
  
  const { data, error } = await getSupabaseAdmin()
    .from('user_quotas')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', currentMonth)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching user quota:', error)
    return null
  }
  
  return data
}

// Create or get user quota for current month
export async function ensureUserQuota(userId: string): Promise<UserQuota | null> {
  const currentMonth = getCurrentMonth()
  
  // Try to get existing quota
  let quota = await getUserQuota(userId)
  
  if (!quota) {
    // Create new quota for this month
    const { data, error } = await getSupabaseAdmin()
      .from('user_quotas')
      .insert({
        user_id: userId,
        month_year: currentMonth,
        searches_used: 0,
        max_searches: 3
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user quota:', error)
      return null
    }
    
    quota = data
  }
  
  return quota
}

// Check if user can perform a search
export async function canUserSearch(userId: string): Promise<{
  allowed: boolean
  quota: UserQuota | null
  remaining: number
}> {
  const quota = await ensureUserQuota(userId)
  
  if (!quota) {
    return { allowed: false, quota: null, remaining: 0 }
  }
  
  const remaining = quota.max_searches - quota.searches_used
  const allowed = remaining > 0
  
  return { allowed, quota, remaining }
}

// Increment user's search count
export async function incrementUserSearch(userId: string): Promise<UserQuota | null> {
  const currentMonth = getCurrentMonth()
  
  // First get current count, then increment
  const quota = await getUserQuota(userId)
  if (!quota) return null
  
  const { data, error } = await getSupabaseAdmin()
    .from('user_quotas')
    .update({ 
      searches_used: quota.searches_used + 1
    })
    .eq('user_id', userId)
    .eq('month_year', currentMonth)
    .select()
    .single()
  
  if (error) {
    console.error('Error incrementing user search count:', error)
    return null
  }
  
  return data
}

// Save user's job search results
export async function saveUserJobSearch(
  userId: string,
  searchParams: {
    query: string
    location?: string
    employmentType?: string
    experience?: string
  },
  jobResults: any[]
): Promise<UserJobSearch | null> {
  const currentMonth = getCurrentMonth()
  
  const { data, error } = await getSupabaseAdmin()
    .from('user_job_searches')
    .insert({
      user_id: userId,
      search_query: searchParams.query,
      search_location: searchParams.location,
      search_employment_type: searchParams.employmentType,
      search_experience: searchParams.experience,
      job_data: jobResults,
      month_year: currentMonth
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error saving user job search:', error)
    return null
  }
  
  return data
}

// Get user's previous job searches for current month
export async function getUserJobSearches(userId: string, monthYear?: string): Promise<UserJobSearch[]> {
  const targetMonth = monthYear || getCurrentMonth()
  
  const { data, error } = await getSupabaseAdmin()
    .from('user_job_searches')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', targetMonth)
    .order('search_timestamp', { ascending: false })
  
  if (error) {
    console.error('Error fetching user job searches:', error)
    return []
  }
  
  return data || []
}

// Get all jobs from user's searches (flattened)
export async function getAllUserJobs(userId: string, monthYear?: string): Promise<any[]> {
  const searches = await getUserJobSearches(userId, monthYear)
  
  const allJobs: any[] = []
  searches.forEach(search => {
    if (search.job_data && Array.isArray(search.job_data)) {
      allJobs.push(...search.job_data)
    }
  })
  
  // Remove duplicates based on job_id
  const uniqueJobs = allJobs.filter((job, index, array) => 
    array.findIndex(j => j.job_id === job.job_id) === index
  )
  
  return uniqueJobs
}

// Save a job to user's permanent collection
export async function saveJobToCollection(
  userId: string, 
  job: any, 
  matchScore: number = 0
): Promise<SavedJob | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('user_saved_jobs')
    .upsert({
      user_id: userId,
      job_id: job.job_id,
      job_data: job,
      match_score: matchScore,
      is_favorited: true
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error saving job to collection:', error)
    return null
  }
  
  return data
}

// Get user's saved jobs
export async function getUserSavedJobs(userId: string): Promise<SavedJob[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('user_saved_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching saved jobs:', error)
    return []
  }
  
  return data || []
}

// Mark job as applied
export async function markJobAsApplied(userId: string, jobId: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from('user_saved_jobs')
    .update({ 
      is_applied: true,
      applied_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('job_id', jobId)
  
  if (error) {
    console.error('Error marking job as applied:', error)
    return false
  }
  
  return true
}
