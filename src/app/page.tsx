'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Form state for structured job search
  const [jobType, setJobType] = useState("full time job")
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("2+ years")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  
  // Dropdown states
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(-1)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1)
  
  const roleInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const roleSuggestionsRef = useRef<HTMLDivElement>(null)
  const locationSuggestionsRef = useRef<HTMLDivElement>(null)

  // Options for dropdowns
  const jobTypes = ["full time job", "part time job", "internship"]
  const experienceLevels = ["0 years", "1+ years","2+ years", "3+ years", "5+ years", "9+ years"]
  
  const roleOptions = [
    "software engineer", "frontend developer", "backend developer", "full stack developer",
    "product manager", "data scientist", "ux designer", "ui designer", "product designer",
    "devops engineer", "machine learning engineer", "data analyst", "business analyst",
    "marketing manager", "content writer", "sales representative", "customer success manager",
    "project manager", "scrum master", "qa engineer", "mobile developer", "react developer",
    "python developer", "java developer", "nodejs developer", "ios developer", "android developer",
    "technical lead", "engineering manager", "software architect", "cybersecurity specialist"
  ]
  
  const locationOptions = [
    "remote", "hybrid", "in Delhi NCR", "in Mumbai", "in Bangalore", "in Pune", 
    "in Hyderabad", "in Chennai", "in Kolkata", "in Ahmedabad", "in Gurgaon",
    "in Noida", "in Faridabad", "in Ghaziabad", "anywhere in India", "onsite",
    "in San Francisco", "in New York", "in London", "in Berlin", "in Toronto"
  ]

  // Filter suggestions based on input
  const getFilteredRoles = () => {
    if (!role.trim()) return roleOptions.slice(0, 8)
    return roleOptions
      .filter(option => option.toLowerCase().includes(role.toLowerCase()))
      .slice(0, 8)
  }

  const getFilteredLocations = () => {
    if (!location.trim()) return locationOptions.slice(0, 8)
    return locationOptions
      .filter(option => option.toLowerCase().includes(location.toLowerCase()))
      .slice(0, 8)
  }

  const toggleJobType = () => {
    const currentIndex = jobTypes.indexOf(jobType)
    const nextIndex = (currentIndex + 1) % jobTypes.length
    setJobType(jobTypes[nextIndex])
  }

  const toggleExperience = () => {
    const currentIndex = experienceLevels.indexOf(experience)
    const nextIndex = (currentIndex + 1) % experienceLevels.length
    setExperience(experienceLevels[nextIndex])
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) return
    
    setIsAnalyzing(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsAnalyzing(false)
      // TODO: Redirect to dashboard/results with structured data
      console.log('Job Search Parameters:', {
        jobType,
        role,
        experience,
        location,
        salary
      })
    }, 2000)
  }

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleSuggestionsRef.current &&
        !roleSuggestionsRef.current.contains(event.target as Node) &&
        !roleInputRef.current?.contains(event.target as Node)
      ) {
        setShowRoleSuggestions(false)
        setSelectedRoleIndex(-1)
      }
      
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false)
        setSelectedLocationIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation for role suggestions
  const handleRoleKeyDown = (e: React.KeyboardEvent) => {
    const filteredRoles = getFilteredRoles()
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!showRoleSuggestions) {
        setShowRoleSuggestions(true)
        setSelectedRoleIndex(0)
      } else {
        setSelectedRoleIndex(prev => 
          prev < filteredRoles.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showRoleSuggestions) {
        setSelectedRoleIndex(prev => 
          prev > 0 ? prev - 1 : filteredRoles.length - 1
        )
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showRoleSuggestions && selectedRoleIndex >= 0) {
        setRole(filteredRoles[selectedRoleIndex])
        setShowRoleSuggestions(false)
        setSelectedRoleIndex(-1)
      }
    } else if (e.key === 'Escape') {
      setShowRoleSuggestions(false)
      setSelectedRoleIndex(-1)
    }
  }

  // Keyboard navigation for location suggestions
  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    const filteredLocations = getFilteredLocations()
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!showLocationSuggestions) {
        setShowLocationSuggestions(true)
        setSelectedLocationIndex(0)
      } else {
        setSelectedLocationIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showLocationSuggestions) {
        setSelectedLocationIndex(prev => 
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        )
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showLocationSuggestions && selectedLocationIndex >= 0) {
        setLocation(filteredLocations[selectedLocationIndex])
        setShowLocationSuggestions(false)
        setSelectedLocationIndex(-1)
      }
    } else if (e.key === 'Escape') {
      setShowLocationSuggestions(false)
      setSelectedLocationIndex(-1)
    }
  }



  const testimonials = [
    {
      name: "Manan",
      role: "Software Engineer",
      company: "TechCorp",
      content: "Hodor helped me land my dream job in just 2 weeks. The AI matching was incredibly accurate!",
      rating: 5
    },
    {
      name: "Aditi", 
      role: "Product Manager",
      company: "Innovation Labs", 
      content: "The automated applications saved me hours. I got 3x more interviews than before.",
      rating: 5
    },
    {
      name: "Dhruv",
      role: "Data Scientist", 
      company: "AI Dynamics",
      content: "Resume optimization was a game-changer. My response rate increased by 400%.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <span className="text-2xl font-bold text-white">Hodor</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-red-400 transition-colors">
            Log in
          </button>
          <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 border border-red-400/30 mb-8">
              <div className="flex gap-1 mr-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-300"></div>
              </div>
              <span className="text-red-200 font-medium">AI Powered Job Search Engine</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              Find your dream job with{' '}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-4xl mx-auto leading-relaxed">
              Tell us what you're looking for and AI will find perfect matches, 
              optimize your applications, and help you land interviews faster.
            </p>
          </div>

          {/* Main Interactive Prompt Interface */}
          <div className="relative max-w-5xl mx-auto mb-16">
            {/* Floating background elements for magic */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-red-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Main Prompt Modal */}
            <div className="relative z-10 bg-gray-900/90 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-10 md:p-12 shadow-2xl shadow-red-500/10">

              {/* Natural Language Prompt */}
              <form onSubmit={handleFormSubmit}>
                <div className="text-center mb-8">
                  <div className="text-3xl md:text-4xl font-light leading-relaxed text-white max-w-4xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                      <span className="text-gray-300">I'm looking for a</span>
                      <button
                        type="button"
                        onClick={toggleJobType}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform cursor-pointer shadow-lg">
                          {jobType}
                        </div>
                      </button>
                      <span className="text-gray-300">as a</span>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-xl min-w-[12rem] max-w-[16rem]">
                          <input
                            ref={roleInputRef}
                            type="text"
                            value={role}
                            onChange={(e) => {
                              setRole(e.target.value)
                              setShowRoleSuggestions(true)
                              setSelectedRoleIndex(-1)
                            }}
                            onFocus={() => setShowRoleSuggestions(true)}
                            onKeyDown={handleRoleKeyDown}
                            className="bg-transparent text-white font-semibold outline-none border-none placeholder:text-white/70 text-center min-w-0 w-full truncate"
                            placeholder="your dream role"
                            required
                          />
                        </div>
                        {showRoleSuggestions && (
                          <div
                            ref={roleSuggestionsRef}
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-gray-800/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl z-50 min-w-max max-w-sm overflow-hidden"
                          >
                            <div className="p-2">
                              {getFilteredRoles().map((suggestion, index) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => {
                                    setRole(suggestion)
                                    setShowRoleSuggestions(false)
                                    setSelectedRoleIndex(-1)
                                  }}
                                  className={`block w-full text-left px-4 py-3 text-sm transition-all rounded-xl ${
                                    index === selectedRoleIndex
                                      ? 'bg-red-500/30 text-red-200 transform scale-105'
                                      : 'text-gray-300 hover:bg-red-500/20 hover:text-white hover:scale-102'
                                  }`}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-4">
                      <span className="text-gray-300">with</span>
                      <button
                        type="button"
                        onClick={toggleExperience}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform cursor-pointer shadow-lg">
                          {experience}
                        </div>
                      </button>
                      <span className="text-gray-300">experience, preferably</span>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-red-700 to-red-800 px-4 py-2 rounded-xl min-w-[10rem] max-w-[14rem]">
                          <input
                            ref={locationInputRef}
                            type="text"
                            value={location}
                            onChange={(e) => {
                              setLocation(e.target.value)
                              setShowLocationSuggestions(true)
                              setSelectedLocationIndex(-1)
                            }}
                            onFocus={() => setShowLocationSuggestions(true)}
                            onKeyDown={handleLocationKeyDown}
                            className="bg-transparent text-white font-semibold outline-none border-none placeholder:text-white/70 text-center min-w-0 w-full truncate"
                            placeholder="location"
                          />
                        </div>
                        {showLocationSuggestions && (
                          <div
                            ref={locationSuggestionsRef}
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-gray-800/95 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl z-50 min-w-max max-w-sm overflow-hidden"
                          >
                            <div className="p-2">
                              {getFilteredLocations().map((suggestion, index) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => {
                                    setLocation(suggestion)
                                    setShowLocationSuggestions(false)
                                    setSelectedLocationIndex(-1)
                                  }}
                                  className={`block w-full text-left px-4 py-3 text-sm transition-all rounded-xl ${
                                    index === selectedLocationIndex
                                      ? 'bg-red-500/30 text-red-200 transform scale-105'
                                      : 'text-gray-300 hover:bg-red-500/20 hover:text-white hover:scale-102'
                                  }`}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {salary && (
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-4">
                        <span className="text-gray-300">with salary around</span>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-900 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          <div className="relative bg-gradient-to-r from-red-800 to-red-900 px-4 py-2 rounded-xl min-w-[8rem] max-w-[12rem]">
                            <input
                              type="text"
                              value={salary}
                              onChange={(e) => setSalary(e.target.value)}
                              className="bg-transparent text-white font-semibold outline-none border-none placeholder:text-white/70 text-center min-w-0 w-full truncate"
                              placeholder="amount"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Salary Input Trigger */}
                {!salary && (
                  <div className="text-center mb-6">
                    <button
                      type="button"
                      onClick={() => setSalary("₹")}
                      className="text-gray-400 hover:text-red-400 transition-colors text-sm underline"
                    >
                      + Add salary expectations
                    </button>
                  </div>
                )}

                {/* CTA Button */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur-lg opacity-50"></div>
                  <button
                    type="submit"
                    disabled={isAnalyzing || !role.trim()}
                    className="relative w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-5 rounded-2xl font-semibold text-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-4 shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        Analyzing Your Perfect Match...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start My AI Job Hunt
                        <svg
                          className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 hover:border-red-400/50 transition-all group">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Discovery</h3>
              <p className="text-gray-400">AI finds jobs that perfectly match your skills and preferences</p>
            </div>
            
            <div className="bg-gray-900/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 hover:border-red-400/50 transition-all group">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Auto Applications</h3>
              <p className="text-gray-400">Apply to hundreds of jobs with personalized cover letters</p>
            </div>
            
            <div className="bg-gray-900/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 hover:border-red-400/50 transition-all group">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Tracking</h3>
              <p className="text-gray-400">Monitor all applications and responses in one dashboard</p>
            </div>
          </div>
        </div>
      </main>

      {/* Testimonials */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by job seekers
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands who've transformed their careers with Hodor
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 hover:border-red-400/50 transition-all group">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to revolutionize your job search?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've accelerated their careers with AI
          </p>
          <button
            onClick={() => roleInputRef.current?.focus()}
            className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/30"
          >
            Get Started Now
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}
