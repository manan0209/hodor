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
  const [quotaInfo, setQuotaInfo] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
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
      
      console.log('Loaded preferences:', savedPreferences) // Debug log
      
      // Fetch quota information
      fetchQuotaInfo(user.id)
      
      // Fetch user statistics
      fetchUserStats(user.id)
      
      setLoading(false)
      
      // Auto-search after everything is loaded - delay to ensure all state is ready
      if (savedPreferences.role && savedPreferences.role.trim()) {
        setJobPreferences(savedPreferences)
        
        // Use the user from the closure scope, not the state
        const currentUser = user
        setTimeout(() => {
          console.log('Auto-searching with preferences:', savedPreferences) // Debug log
          console.log('User available for auto-search:', !!currentUser) // Debug log
          setHasSearched(true) // Show that we're about to search
          
          // Create a modified searchJobs that uses the current user
          if (!savedPreferences.role || !currentUser) {
            console.log('Skipping auto-search - missing role or user:', { role: savedPreferences.role, user: !!currentUser }) // Debug log
            return
          }
          
          // Call searchJobs with the current user context
          searchJobsWithUser(savedPreferences, currentUser as AuthUser)
        }, 500)
      } else {
        console.log('No role found, skipping auto-search') // Debug log
      }
    }

    getUser()
  }, [router])

  const fetchQuotaInfo = async (userId: string) => {
    try {
      const response = await fetch('/api/quota', {
        headers: {
          'x-user-id': userId,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuotaInfo(data)
      }
    } catch (error) {
      console.error('Failed to fetch quota info:', error)
    }
  }

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch('/api/user/statistics', {
        headers: {
          'x-user-id': userId,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.statistics)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const searchJobs = async (preferences: JobPreferences) => {
    console.log('searchJobs called with:', preferences) // Debug log
    if (!preferences.role || !user) {
      console.log('Skipping search - missing role or user:', { role: preferences.role, user: !!user }) // Debug log
      return
    }
    
    searchJobsWithUser(preferences, user)
  }

  const searchJobsWithUser = async (preferences: JobPreferences, currentUser: AuthUser) => {
    console.log('searchJobsWithUser called with:', preferences, 'user:', !!currentUser) // Debug log
    if (!preferences.role || !currentUser) {
      console.log('Skipping search - missing role or user:', { role: preferences.role, user: !!currentUser }) // Debug log
      return
    }
    
    setSearchLoading(true)
    setSearchError(null)
    setHasSearched(true)
    setSearchMeta(null)
    
    console.log('Starting job search...') // Debug log
    console.log('Search parameters being sent:', {
      jobType: preferences.jobType,
      role: preferences.role,
      experience: preferences.experience,
      location: preferences.location,
      salary: preferences.salary
    }) // Debug log
    
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify(preferences),
      })

      console.log('Search response status:', response.status) // Debug log
      console.log('Search response headers:', Object.fromEntries(response.headers.entries())) // Debug log

      if (!response.ok) {
        const error = await response.json()
        console.error('Search API error:', error) // Debug log
        throw new Error(error.message || 'Failed to search jobs')
      }

      const data = await response.json()
      console.log('Search response data:', data) // Debug log
      setJobs(data.jobs || [])
      setSearchMeta(data.meta || null)
      
      // Refresh quota info after search
      if (currentUser?.id) {
        fetchQuotaInfo(currentUser.id)
        // Also refresh user stats to update total jobs fetched
        fetchUserStats(currentUser.id)
      }
    } catch (error) {
      console.error('Job search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Failed to search jobs')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf' && !file.type.includes('text')) {
      setErrorMessage('Please upload a PDF or text file. Supported formats: .pdf, .txt')
      setShowErrorModal(true)
      return
    }

    setResumeUploading(true)

    try {
      let resumeText = ''
      
      if (file.type === 'application/pdf') {
        // Parse PDF using pdfjs-dist
        try {
          console.log('Starting PDF parsing for file:', file.name, 'Size:', file.size)
          const arrayBuffer = await file.arrayBuffer()
          console.log('ArrayBuffer created, size:', arrayBuffer.byteLength)
          
          const pdfjsLib = await import('pdfjs-dist')
          console.log('PDF.js loaded, version:', pdfjsLib.version)
          
          // Set worker path for PDF.js v5+
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
          
          console.log('Worker src set to:', pdfjsLib.GlobalWorkerOptions.workerSrc)
          
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0 // Reduce console noise
          })
          
          const pdf = await loadingTask.promise
          console.log('PDF loaded successfully, pages:', pdf.numPages)
          
          let text = ''
          
          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`Processing page ${i}/${pdf.numPages}`)
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .filter((item: any) => item.str && typeof item.str === 'string')
              .map((item: any) => item.str.trim())
              .filter((str: string) => str.length > 0)
              .join(' ')
            text += pageText + '\n'
            console.log(`Page ${i} text length:`, pageText.length)
          }
          
          console.log('Total extracted text length:', text.length)
          resumeText = text.trim()
          
          if (!resumeText) {
            throw new Error('No text content found in PDF - it may be an image-based PDF')
          }
        } catch (pdfError) {
          console.error('Detailed PDF parsing error:', pdfError)
          console.error('Error type:', typeof pdfError)
          console.error('Error message:', pdfError instanceof Error ? pdfError.message : String(pdfError))
          console.error('Error stack:', pdfError instanceof Error ? pdfError.stack : 'No stack trace')
          
          let errorMessage = 'Failed to parse PDF. '
          if (pdfError instanceof Error) {
            if (pdfError.message.includes('Invalid PDF')) {
              errorMessage += 'The file appears to be corrupted or not a valid PDF.'
            } else if (pdfError.message.includes('image-based')) {
              errorMessage += 'This PDF appears to contain only images. Please use a PDF with selectable text.'
            } else if (pdfError.message.includes('worker')) {
              errorMessage += 'PDF processing failed. Please try a different file or use text input.'
            } else {
              errorMessage += `Error: ${pdfError.message}`
            }
          } else {
            errorMessage += 'Unknown error occurred during PDF processing.'
          }
          
          errorMessage += '\n\nAlternatives:\n• Use a .txt file instead\n• Copy-paste your resume text directly\n• Use our Resume Builder to create a new resume'
          
          setErrorMessage(errorMessage)
          setShowErrorModal(true)
          setResumeUploading(false)
          return
        }
      } else {
        // Text file
        resumeText = await file.text()
      }

      if (!resumeText.trim()) {
        setErrorMessage('No text content found in the file. Please check your file and try again.')
        setShowErrorModal(true)
        setResumeUploading(false)
        return
      }

      // Analyze resume
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          resumeText,
          fileName: file.name
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResumeAnalysis(data)
      } else {
        throw new Error('Failed to analyze resume')
      }
    } catch (error) {
      console.error('Resume upload error:', error)
      setErrorMessage('Failed to analyze resume. Please try again or contact support if the problem persists.')
      setShowErrorModal(true)
    } finally {
      setResumeUploading(false)
      // Clear the file input
      if (event.target) {
        event.target.value = ''
      }
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
              {/* Quick Resume Access */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/dashboard/resume-builder')}
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-1"
                  title="Resume Builder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Builder
                </button>
                
                <label
                  htmlFor="resume-upload-header"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1 cursor-pointer"
                  title="Resume Analysis"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Analysis
                </label>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload-header"
                />
              </div>

              {/* Quota Status */}
              {quotaInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    quotaInfo.remaining_searches === 0 ? 'bg-red-400' : 
                    quotaInfo.remaining_searches === 1 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span className="text-gray-300">
                    {quotaInfo.remaining_searches} / {quotaInfo.max_searches} searches left
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  {user?.user_metadata?.avatar_url ? (
                    <>
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium absolute inset-0" style={{ display: 'none' }}>
                        {(user?.user_metadata?.full_name?.[0] || user?.user_metadata?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium">
                      {(user?.user_metadata?.full_name?.[0] || user?.user_metadata?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                </div>
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
            {searchLoading && hasSearched ? 
              "🔍 Finding your perfect job matches..." : 
              hasSearched && !searchLoading && jobs.length === 0 ?
              "Ready to search again? Click 'Search Again' above." :
              "Let's find you the perfect job opportunity."
            }
          </p>
        </div>

        {/* User Statistics Dashboard */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-red-300">{userStats.totalSearches}</span>
              </div>
              <div className="text-sm text-gray-300">Total Searches</div>
              <div className="text-xs text-gray-400 mt-1">All time</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-green-300">{userStats.totalJobsFetched}</span>
              </div>
              <div className="text-sm text-gray-300">Jobs Discovered</div>
              <div className="text-xs text-gray-400 mt-1">Total opportunities found</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-purple-300">{userStats.savedJobsCount}</span>
              </div>
              <div className="text-sm text-gray-300">Saved Jobs</div>
              <div className="text-xs text-gray-400 mt-1">Bookmarked opportunities</div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-red-300">{userStats.searchesRemaining}</span>
              </div>
              <div className="text-sm text-gray-300">Searches Left</div>
              <div className="text-xs text-gray-400 mt-1">This month</div>
            </div>
          </div>
        )}

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
                onClick={() => router.push('/dashboard/profile')}
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
              onClick={() => router.push('/dashboard/profile')}
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
                    <div className={`w-2 h-2 rounded-full ${searchMeta.from_user_collection ? 'bg-purple-400' : 'bg-red-400'}`}></div>
                    <span className="text-gray-300">
                      {searchMeta.from_user_collection ? 'Your Collection' : 'Fresh Search'}
                    </span>
                  </div>
                  
                  {searchMeta.remaining_searches !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        searchMeta.remaining_searches === 0 ? 'bg-red-400' : 
                        searchMeta.remaining_searches === 1 ? 'bg-yellow-400' : 'bg-purple-400'
                      }`}></div>
                      <span className="text-gray-300">
                        {searchMeta.remaining_searches} searches left this month
                      </span>
                    </div>
                  )}
                  
                  {searchMeta.quota_used && searchMeta.max_searches && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
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
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-200 text-sm">{searchMeta.message}</span>
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
                              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm">
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
                        <button className="text-gray-400 hover:text-red-400 transition-colors">
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

        {/* Resume Analysis Results */}
        {resumeAnalysis && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Resume Analysis Results</h3>
              <button
                onClick={() => setResumeAnalysis(null)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Score Display */}
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={resumeAnalysis.analysis.score >= 80 ? "rgb(34, 197, 94)" : 
                           resumeAnalysis.analysis.score >= 60 ? "rgb(234, 179, 8)" : "rgb(239, 68, 68)"}
                    strokeWidth="10"
                    strokeDasharray={`${resumeAnalysis.analysis.score * 3.14} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{resumeAnalysis.analysis.score}</div>
                    <div className="text-sm text-gray-400">Score</div>
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Resume: {resumeAnalysis.fileName}</h4>
              <p className="text-gray-400">{resumeAnalysis.analysis.wordCount} words</p>
            </div>

            {/* Feedback Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Strengths */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h5 className="font-semibold text-green-300 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Strengths
                </h5>
                <ul className="space-y-2">
                  {resumeAnalysis.analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-gray-300">{strength}</li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h5 className="font-semibold text-red-300 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Areas for Improvement
                </h5>
                <ul className="space-y-2">
                  {resumeAnalysis.analysis.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="text-sm text-gray-300">{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills Found */}
            {resumeAnalysis.analysis.skillsFound.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold mb-3">Technical Skills Detected</h5>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.analysis.skillsFound.map((skill: string, index: number) => (
                    <span key={index} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h5 className="font-semibold text-red-300 mb-3">💡 Recommendations</h5>
              <ul className="space-y-2">
                {resumeAnalysis.analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions - only show if no jobs searched yet */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              onClick={() => router.push('/dashboard/profile')}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-red-500/50 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Start Job Search</h3>
              <p className="text-gray-400 text-sm">Set your preferences and find relevant opportunities</p>
            </div>

            <div 
              onClick={() => router.push('/dashboard/resume-builder')}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Resume Builder</h3>
              <p className="text-gray-400 text-sm">Create a professional resume with our guided builder</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-red-500/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Resume Analysis</h3>
              <p className="text-gray-400 text-sm">Upload your resume for instant feedback and scoring</p>
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="mt-3 inline-flex items-center text-red-400 text-sm hover:text-red-300 cursor-pointer"
              >
                {resumeUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Resume
                  </>
                )}
              </label>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Career Analytics</h3>
              <p className="text-gray-400 text-sm">Track your job search progress and success metrics</p>
            </div>
          </div>
        )}

        {/* Resume Tools Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume Tools
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Builder */}
            <div 
              onClick={() => router.push('/dashboard/resume-builder')}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">Resume Builder</h4>
                  <p className="text-sm text-gray-400">Create a professional resume</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Build your resume with our guided tool. Add experience, education, skills, and export as PDF.
              </p>
              <div className="mt-4 inline-flex items-center text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
                Open Builder →
              </div>
            </div>

            {/* Resume Analysis */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-red-500/50 transition-colors group">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-500/30 transition-colors">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-red-300 transition-colors">Resume Analysis</h4>
                  <p className="text-sm text-gray-400">Get instant feedback & scoring</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Upload your resume (PDF or text) or paste your resume content below for detailed analysis and scoring.
              </p>
              
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload-main"
                />
                <label
                  htmlFor="resume-upload-main"
                  className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                >
                  {resumeUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Resume File
                    </>
                  )}
                </label>
                
                <div className="text-center text-gray-400 text-sm">or</div>
                
                <div>
                  <textarea
                    placeholder="Paste your resume text here..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                    rows={4}
                    id="resume-text-input"
                  />
                  <button
                    onClick={async () => {
                      const textarea = document.getElementById('resume-text-input') as HTMLTextAreaElement
                      const text = textarea.value.trim()
                      if (!text) {
                        setErrorMessage('Please paste your resume text in the textarea before analyzing.')
                        setShowErrorModal(true)
                        return
                      }
                      
                      setResumeUploading(true)
                      try {
                        const response = await fetch('/api/resume/analyze', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': user?.id || '',
                          },
                          body: JSON.stringify({
                            resumeText: text,
                            fileName: 'pasted-resume.txt'
                          }),
                        })

                        if (response.ok) {
                          const data = await response.json()
                          setResumeAnalysis(data)
                          textarea.value = '' // Clear the textarea
                        } else {
                          throw new Error('Failed to analyze resume')
                        }
                      } catch (error) {
                        console.error('Resume analysis error:', error)
                        setErrorMessage('Failed to analyze resume text. Please try again or contact support if the problem persists.')
                        setShowErrorModal(true)
                      } finally {
                        setResumeUploading(false)
                      }
                    }}
                    disabled={resumeUploading}
                    className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {resumeUploading ? 'Analyzing...' : 'Analyze Resume Text'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 More Features Coming Soon!</h3>
          <p className="text-gray-400 mb-6">
            We're working hard to bring you AI-powered job matching, interview preparation, salary insights, and much more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">AI Job Matching</span>
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">Interview Prep</span>
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">Salary Insights</span>
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">Company Reviews</span>
          </div>
        </div>
      </main>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Upload Error</h3>
                <p className="text-sm text-gray-400">There was an issue processing your file</p>
              </div>
            </div>
            <div className="text-gray-300 mb-6 whitespace-pre-line">{errorMessage}</div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowErrorModal(false)
                  router.push('/dashboard/resume-builder')
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Resume Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
