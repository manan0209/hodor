import { formatEmploymentType, formatLocation, searchJobs, type JobSearchParams } from '@/lib/jsearch'
import {
    canUserSearch,
    getAllUserJobs,
    incrementUserSearch,
    saveUserJobSearch
} from '@/lib/user-quota'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from Authorization header (set by client)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required - please sign in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobType, role, experience, location, salary } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Build search parameters
    const searchParams: JobSearchParams = {
      query: `${role} ${experience}`,
      location: formatLocation(location),
      employmentType: formatEmploymentType(jobType),
      page: 1,
      numPages: 1
    }

    // Check if user has existing jobs for this month first
    let existingJobs: any[] = []
    try {
      existingJobs = await getAllUserJobs(userId)
      console.log(`Found ${existingJobs.length} existing jobs for user ${userId}`)
    } catch (error) {
      console.log('Database not ready yet, proceeding with fresh search:', error)
    }
    
    if (existingJobs.length > 0) {
      // User has existing jobs, return them with enhanced scoring
      const enhancedJobs = existingJobs.map((job: any) => ({
        ...job,
        matchScore: calculateMatchScore(job, { jobType, role, experience, location, salary }),
        job_description: job.job_description?.substring(0, 500) + (job.job_description?.length > 500 ? '...' : ''),
      }))

      // Sort by match score and return top 4
      enhancedJobs.sort((a: any, b: any) => b.matchScore - a.matchScore)

      return NextResponse.json({
        success: true,
        jobs: enhancedJobs.slice(0, 4),
        meta: {
          total: enhancedJobs.length,
          query: searchParams.query,
          location: searchParams.location,
          from_user_collection: true,
          message: "Showing jobs from your personal collection this month"
        }
      })
    }

    // Check user's quota for new searches
    let quotaCheck
    try {
      quotaCheck = await canUserSearch(userId)
      console.log('Quota check:', quotaCheck)
    } catch (error) {
      console.log('Database not ready yet, allowing search:', error)
      // If quota tables don't exist, allow the search (fallback for initial setup)
      quotaCheck = { allowed: true, quota: null, remaining: 3 }
    }
    
    const { allowed, quota, remaining } = quotaCheck
    
    if (!allowed && quota) {
      return NextResponse.json(
        { 
          error: 'Monthly search limit reached',
          message: `You've used all ${quota.max_searches || 3} searches for this month. Your searches will reset next month. You can still view your saved jobs from this month!`,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10),
          remaining: 0,
          quota: quota
        },
        { status: 429 }
      )
    }

    // Call JSearch API for fresh results
    const results = await searchJobs(searchParams)

    if (!results.data || results.data.length === 0) {
      return NextResponse.json({
        success: true,
        jobs: [],
        meta: {
          total: 0,
          query: searchParams.query,
          location: searchParams.location,
          remaining_searches: remaining,
          message: "No jobs found for your search criteria. Try different keywords or location."
        }
      })
    }

    // Take only 4 jobs and enhance them
    const jobsToSave = results.data.slice(0, 4)
    const enhancedJobs = jobsToSave.map((job: any) => ({
      ...job,
      matchScore: calculateMatchScore(job, { jobType, role, experience, location, salary }),
      job_description: job.job_description?.substring(0, 500) + (job.job_description?.length > 500 ? '...' : ''),
    }))

    // Sort by match score
    enhancedJobs.sort((a: any, b: any) => b.matchScore - a.matchScore)

    // Save the search and increment quota
    let updatedQuota = quota
    try {
      const [searchResult, quotaResult] = await Promise.all([
        saveUserJobSearch(userId, searchParams, enhancedJobs),
        quota ? incrementUserSearch(userId) : Promise.resolve(null)
      ])
      
      if (quotaResult) {
        updatedQuota = quotaResult
      }
      
      console.log('Successfully saved search to database')
    } catch (error) {
      console.log('Could not save search to database:', error)
      // Continue even if database save fails
    }

    const finalRemaining = Math.max(0, remaining - 1)
    const finalQuotaUsed = updatedQuota ? updatedQuota.searches_used : 1

    return NextResponse.json({
      success: true,
      jobs: enhancedJobs,
      meta: {
        total: enhancedJobs.length,
        query: searchParams.query,
        location: searchParams.location,
        remaining_searches: finalRemaining,
        quota_used: finalQuotaUsed,
        max_searches: updatedQuota ? updatedQuota.max_searches : 3,
        from_user_collection: false,
        message: updatedQuota 
          ? `Fresh search complete! You have ${finalRemaining} searches remaining this month.`
          : "Fresh job search results! Database quota system will be enabled once tables are set up."
      }
    })

  } catch (error) {
    console.error('Job search error:', error)
    
    return NextResponse.json(
      { 
        error: 'Job search failed', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

// Simple matching algorithm
function calculateMatchScore(job: any, preferences: any): number {
  let score = 0

  // Role matching (most important)
  if (job.job_title?.toLowerCase().includes(preferences.role?.toLowerCase())) {
    score += 40
  }

  // Employment type matching
  if (job.job_employment_type?.toLowerCase().includes(preferences.jobType?.toLowerCase().replace(' job', ''))) {
    score += 20
  }

  // Location matching
  if (preferences.location) {
    const prefLocation = preferences.location.toLowerCase()
    const jobLocation = `${job.job_city} ${job.job_state} ${job.job_country}`.toLowerCase()
    
    if (prefLocation.includes('remote') && job.job_is_remote) {
      score += 30
    } else if (jobLocation.includes(prefLocation.replace('in ', ''))) {
      score += 25
    }
  }

  // Experience matching (basic)
  if (preferences.experience && job.job_description) {
    const expYears = parseInt(preferences.experience.match(/\d+/)?.[0] || '0')
    const jobDesc = job.job_description.toLowerCase()
    
    if (expYears === 0 && (jobDesc.includes('entry level') || jobDesc.includes('junior'))) {
      score += 15
    } else if (expYears >= 3 && (jobDesc.includes('senior') || jobDesc.includes('experienced'))) {
      score += 15
    }
  }

  // Salary matching (if available)
  if (preferences.salary && job.job_min_salary) {
    const prefSalary = parseInt(preferences.salary.replace(/[^0-9]/g, ''))
    if (prefSalary && job.job_min_salary <= prefSalary && job.job_max_salary >= prefSalary) {
      score += 10
    }
  }

  // Recent posting bonus
  if (job.job_posted_at_timestamp) {
    const daysAgo = (Date.now() - job.job_posted_at_timestamp * 1000) / (1000 * 60 * 60 * 24)
    if (daysAgo <= 7) score += 5
  }

  return score
}
