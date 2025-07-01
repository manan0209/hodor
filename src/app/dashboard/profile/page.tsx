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

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<JobPreferences>({
    jobType: '',
    role: '',
    experience: '',
    location: '',
    salary: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
  const salaryRanges = [
    'Not specified',
    '$40,000 - $60,000',
    '$60,000 - $80,000', 
    '$80,000 - $100,000',
    '$100,000 - $120,000',
    '$120,000 - $150,000',
    '$150,000+'
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setUser(user as AuthUser)
      
      // Load existing preferences from localStorage
      const savedPreferences = {
        jobType: localStorage.getItem('jobType') || '',
        role: localStorage.getItem('role') || '',
        experience: localStorage.getItem('experience') || '',
        location: localStorage.getItem('location') || '',
        salary: localStorage.getItem('salary') || ''
      }
      
      setPreferences(savedPreferences)
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      // Save to localStorage
      localStorage.setItem('jobType', preferences.jobType)
      localStorage.setItem('role', preferences.role)
      localStorage.setItem('experience', preferences.experience)
      localStorage.setItem('location', preferences.location)
      localStorage.setItem('salary', preferences.salary)
      
      setMessage({ type: 'success', text: 'Preferences saved successfully!' })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' })
    } finally {
      setSaving(false)
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
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold">
                <span className="text-red-500">Hodor</span> Profile
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium">
                    {(user?.user_metadata?.full_name?.[0] || user?.user_metadata?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                  </div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Job Preferences</h2>
          <p className="text-gray-400">
            Update your job search preferences to find better matches.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-900/50 border-green-700 text-green-200' 
              : 'bg-red-900/50 border-red-700 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Preferences Form */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Type
              </label>
              <select
                value={preferences.jobType}
                onChange={(e) => setPreferences(prev => ({ ...prev, jobType: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select job type</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role / Position *
              </label>
              <input
                type="text"
                value={preferences.role}
                onChange={(e) => setPreferences(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Software Engineer, Data Scientist"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={preferences.experience}
                onChange={(e) => setPreferences(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select experience level</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={preferences.location}
                onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco, Remote, New York"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Salary Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Salary Range
              </label>
              <select
                value={preferences.salary}
                onChange={(e) => setPreferences(prev => ({ ...prev, salary: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {salaryRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !preferences.role.trim()}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gray-900/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">💡 Tips for Better Results</h3>
          <ul className="text-gray-400 space-y-1">
            <li>• Be specific with your role (e.g., "Frontend Developer" vs "Developer")</li>
            <li>• Include relevant technologies or skills in your role description</li>
            <li>• Use common location formats (city, state or "Remote")</li>
            <li>• Setting salary range helps filter relevant positions</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
