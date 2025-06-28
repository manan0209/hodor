import { canUserSearch, getAllUserJobs } from '@/lib/user-quota'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { allowed, quota, remaining } = await canUserSearch(userId)
    const userJobs = await getAllUserJobs(userId)

    return NextResponse.json({
      success: true,
      status: {
        remaining_searches: remaining,
        max_searches: quota?.max_searches || 3,
        searches_used: quota?.searches_used || 0,
        usage_percentage: quota ? Math.round((quota.searches_used / quota.max_searches) * 100) : 0,
        is_near_limit: remaining <= 1,
        is_at_limit: !allowed,
        total_jobs_found: userJobs.length,
        current_month: quota?.month_year
      }
    })
  } catch (error) {
    console.error('Status check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get user status', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
