import { getSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    
    const { data: savedJobs, error } = await supabase
      .from('user_saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 })
    }

    return NextResponse.json({ 
      savedJobs: savedJobs || [],
      count: savedJobs?.length || 0
    })
  } catch (error) {
    console.error('Error in saved jobs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const {
      job_id,
      employer_name,
      job_title,
      job_description,
      job_apply_link,
      job_city,
      job_state,
      job_country,
      job_posted_at_datetime_utc,
      job_employment_type,
      job_is_remote,
      job_min_salary,
      job_max_salary,
      job_salary_currency,
      job_salary_period,
      match_score
    } = body

    if (!job_id || !job_title) {
      return NextResponse.json({ error: 'Job ID and title are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    
    const { data: savedJob, error } = await supabase
      .from('user_saved_jobs')
      .insert({
        user_id: userId,
        job_id,
        employer_name,
        job_title,
        job_description,
        job_apply_link,
        job_city,
        job_state,
        job_country,
        job_posted_at_datetime_utc,
        job_employment_type,
        job_is_remote,
        job_min_salary,
        job_max_salary,
        job_salary_currency,
        job_salary_period,
        match_score
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Job already saved' }, { status: 409 })
      }
      console.error('Error saving job:', error)
      return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Job saved successfully',
      savedJob
    })
  } catch (error) {
    console.error('Error in save job API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const url = new URL(request.url)
  const jobId = url.searchParams.get('job_id')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('user_saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId)

    if (error) {
      console.error('Error deleting saved job:', error)
      return NextResponse.json({ error: 'Failed to delete saved job' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Job removed from saved list'
    })
  } catch (error) {
    console.error('Error in delete saved job API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
