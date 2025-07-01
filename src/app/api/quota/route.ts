import { canUserSearch } from '@/lib/user-quota'
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

    // Check user's quota
    let quotaCheck
    try {
      quotaCheck = await canUserSearch(userId)
    } catch (error) {
      console.log('Database not ready yet, returning default quota:', error)
      quotaCheck = { allowed: true, quota: null, remaining: 3 }
    }
    
    const { allowed, quota, remaining } = quotaCheck
    
    return NextResponse.json({
      success: true,
      remaining_searches: remaining,
      max_searches: quota?.max_searches || 3,
      searches_used: quota?.searches_used || 0,
      allowed,
      month_year: quota?.month_year || new Date().toISOString().slice(0, 7)
    })

  } catch (error) {
    console.error('Quota check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check quota', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
