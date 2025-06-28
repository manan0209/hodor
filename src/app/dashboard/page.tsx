'use client'

import { supabase, type AuthUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface JobPreferences {
  jobType: string
  role: string
  experience: string
  location: string
  salary: string
}

interface Job {
  job_id: string
  employer_name: string
  employer_logo?: string
  job_title: string
  job_description: string
  job_apply_link: string
  job_city?: string
  job_state?: string
  job_country?: string
  job_posted_at_datetime_utc?: string
  job_employment_type?: string
  job_is_remote?: boolean
  job_min_salary?: number
  job_max_salary?: number
  job_salary_currency?: string
  job_salary_period?: string
  matchScore: number
}

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobPreferences, setJobPreferences] = useState<JobPreferences | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchMeta, setSearchMeta] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setUser(user as AuthUser)
      
      // Get job preferences from URL params or localStorage
      const params = new URLSearchParams(window.location.search)
      const savedPreferences = {
        jobType: params.get('jobType') || localStorage.getItem('jobType') || '',
        role: params.get('role') || localStorage.getItem('role') || '',
        experience: params.get('experience') || localStorage.getItem('experience') || '',
        location: params.get('location') || localStorage.getItem('location') || '',
        salary: params.get('salary') || localStorage.getItem('salary') || ''
      }
      
      if (savedPreferences.role) {
        setJobPreferences(savedPreferences)
        // Auto-search if preferences are available
        searchJobs(savedPreferences)
      }
      
      setLoading(false)
    }

    getUser()
  }, [router])

  const searchJobs = async (preferences: JobPreferences) => {
    if (!preferences.role || !user) return
    
    setSearchLoading(true)
    setSearchError(null)
    setHasSearched(true)
    setSearchMeta(null)
    
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to search jobs')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      setSearchMeta(data.meta || null)
    } catch (error) {
      console.error('Job search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Failed to search jobs')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-red-500">Hodor</span> Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user?.user_metadata?.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-300">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-gray-400">
            Let's find you the perfect job opportunity.
          </p>
        </div>

        {/* Job Preferences Section */}
        {jobPreferences?.role ? (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Your Job Search Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Job Type</div>
                <div className="font-medium capitalize">{jobPreferences.jobType}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Role</div>
                <div className="font-medium capitalize">{jobPreferences.role}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Experience</div>
                <div className="font-medium">{jobPreferences.experience}</div>
              </div>
              {jobPreferences.location && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Location</div>
                  <div className="font-medium capitalize">{jobPreferences.location}</div>
                </div>
              )}
              {jobPreferences.salary && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Salary</div>
                  <div className="font-medium">{jobPreferences.salary}</div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button 
                onClick={() => router.push('/')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Update Preferences →
              </button>
              <button
                onClick={() => jobPreferences && searchJobs(jobPreferences)}
                disabled={searchLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search Again'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Ready to start your job hunt?</h3>
            <p className="text-gray-400 mb-6">
              Tell us what you're looking for and let our AI find the perfect matches.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
              Set Job Preferences
            </button>
          </div>
        )}

        {/* Job Results Section */}
        {hasSearched && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Job Matches</h3>
              {jobs.length > 0 && (
                <span className="text-gray-400">
                  Found {jobs.length} perfect matches
                </span>
              )}
            </div>

            {/* Search Metadata */}
            {searchMeta && (
              <div className="mb-6 p-4 bg-gray-900/30 border border-gray-700 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${searchMeta.from_user_collection ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                    <span className="text-gray-300">
                      {searchMeta.from_user_collection ? 'Your Collection' : 'Fresh Search'}
                    </span>
                  </div>
                  
                  {searchMeta.remaining_searches !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        searchMeta.remaining_searches === 0 ? 'bg-red-400' : 
                        searchMeta.remaining_searches === 1 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <span className="text-gray-300">
                        {searchMeta.remaining_searches} searches left this month
                      </span>
                    </div>
                  )}
                  
                  {searchMeta.quota_used && searchMeta.max_searches && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-gray-300">
                        {searchMeta.quota_used}/{searchMeta.max_searches} searches used
                      </span>
                    </div>
                  )}
                </div>
                
                {searchMeta.warning && (
                  <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-yellow-200 text-sm">{searchMeta.warning}</span>
                    </div>
                  </div>
                )}
                
                {searchMeta.message && (
                  <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-blue-200 text-sm">{searchMeta.message}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
                <span className="ml-3 text-gray-400">Finding your perfect jobs...</span>
              </div>
            ) : searchError ? (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 text-center">
                <div className="text-red-200 mb-2">⚠️ Search Failed</div>
                <div className="text-gray-300">{searchError}</div>
                <button
                  onClick={() => jobPreferences && searchJobs(jobPreferences)}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => (
                  <div key={job.job_id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-red-500/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {job.employer_logo && (
                          <img 
                            src={job.employer_logo} 
                            alt={job.employer_name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                            {job.job_title}
                          </h4>
                          <div className="text-gray-400 mb-2">
                            {job.employer_name}
                            {(job.job_city || job.job_state) && (
                              <span className="ml-2">
                                • {job.job_city}{job.job_state && `, ${job.job_state}`}
                              </span>
                            )}
                            {job.job_is_remote && (
                              <span className="ml-2 text-green-400">• Remote</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {job.job_employment_type && (
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                                {job.job_employment_type}
                              </span>
                            )}
                            {(job.job_min_salary || job.job_max_salary) && (
                              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                                {job.job_salary_currency || '$'}{job.job_min_salary?.toLocaleString()}
                                {job.job_max_salary && ` - ${job.job_salary_currency || '$'}${job.job_max_salary.toLocaleString()}`}
                                {job.job_salary_period && ` / ${job.job_salary_period}`}
                              </span>
                            )}
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm">
                              {job.matchScore}% Match
                            </span>
                          </div>
                          {job.job_description && (
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                              {job.job_description}
                            </p>
                          )}
                          {job.job_posted_at_datetime_utc && (
                            <div className="text-xs text-gray-500">
                              Posted {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-red-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-blue-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                      </div>
                      <a
                        href={job.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Apply Now →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  We couldn't find any jobs matching your criteria. Try adjusting your preferences or search terms.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Update Search Criteria
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions - only show if no jobs searched yet */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-red-500/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Job Search</h3>
              <p className="text-gray-400 text-sm">Find and apply to relevant job opportunities</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Resume Builder</h3>
              <p className="text-gray-400 text-sm">Create and optimize your resume with AI</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-gray-400 text-sm">Track your application progress and success rate</p>
            </div>
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 More Features Coming Soon!</h3>
          <p className="text-gray-400 mb-6">
            We're working hard to bring you AI-powered job matching, interview preparation, salary insights, and much more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">AI Job Matching</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">Interview Prep</span>
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">Salary Insights</span>
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">Company Reviews</span>
          </div>
        </div>
      </main>
    </div>
  )
}
