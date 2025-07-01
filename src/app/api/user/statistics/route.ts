import { getSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Authorization header
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user statistics
    try {
      const supabase = getSupabaseAdmin()
      
      // Get total searches count
      const { data: searches, error: searchError } = await supabase
        .from('user_job_searches')
        .select('id, job_data')
        .eq('user_id', userId)
      
      if (searchError) {
        console.error('Error fetching searches:', searchError)
      }

      // Get total saved jobs count
      const { data: savedJobs, error: savedError } = await supabase
        .from('user_saved_jobs')
        .select('id')
        .eq('user_id', userId)
      
      if (savedError) {
        console.error('Error fetching saved jobs:', savedError)
      }

      // Calculate total jobs fetched (sum of job_data arrays)
      const totalJobsFetched = searches?.reduce((total, search) => {
        const jobs = Array.isArray(search.job_data) ? search.job_data.length : 0
        return total + jobs
      }, 0) || 0

      // Get current month quota info
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: quota, error: quotaError } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single()

      if (quotaError && quotaError.code !== 'PGRST116') {
        console.error('Error fetching quota:', quotaError)
      }

      return NextResponse.json({
        success: true,
        statistics: {
          totalSearches: searches?.length || 0,
          totalJobsFetched,
          savedJobsCount: savedJobs?.length || 0,
          currentMonthSearches: quota?.searches_used || 0,
          maxSearchesPerMonth: quota?.max_searches || 3,
          searchesRemaining: (quota?.max_searches || 3) - (quota?.searches_used || 0)
        }
      })

    } catch (error) {
      console.log('Database not ready yet, returning default stats:', error)
      return NextResponse.json({
        success: true,
        statistics: {
          totalSearches: 0,
          totalJobsFetched: 0,
          savedJobsCount: 0,
          currentMonthSearches: 0,
          maxSearchesPerMonth: 3,
          searchesRemaining: 3
        }
      })
    }

  } catch (error) {
    console.error('Statistics error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
