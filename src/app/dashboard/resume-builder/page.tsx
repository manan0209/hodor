'use client'

import { supabase, type AuthUser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
    website: string
  }
  summary: string
  experience: Array<{
    id: string
    company: string
    position: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    current: boolean
    gpa: string
  }>
  skills: string[]
  projects: Array<{
    id: string
    name: string
    description: string
    technologies: string
    link: string
  }>
}

export default function ResumeBuilder() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  })
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeSection, setActiveSection] = useState('personal')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setUser(user as AuthUser)
      
      // Pre-fill with user data
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || ''
        }
      }))
      
      setLoading(false)
    }

    getUser()
  }, [router])

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }))
  }

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: ''
    }
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }))
  }

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      link: ''
    }
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }))
  }

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }))
  }

  const addSkill = () => {
    const skill = prompt('Enter a skill:')
    if (skill && skill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }))
    }
  }

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const exportToPDF = async () => {
    try {
      // Validate that user has filled in basic information
      if (!resumeData.personalInfo.fullName.trim()) {
        setErrorMessage('Please enter your full name before exporting.')
        setShowErrorModal(true)
        return
      }

      if (!resumeData.personalInfo.email.trim()) {
        setErrorMessage('Please enter your email address before exporting.')
        setShowErrorModal(true)
        return
      }

      // Create a new window with the resume
      const resumeWindow = window.open('', '_blank')
      if (!resumeWindow) {
        setErrorMessage('Pop-up blocked. Please allow pop-ups for this site and try again.')
        setShowErrorModal(true)
        return
      }

      // Write the HTML content
      resumeWindow.document.write(generateResumeHTML())
      resumeWindow.document.close()

      // Wait for the content to load, then trigger print dialog
      resumeWindow.onload = () => {
        setTimeout(() => {
          resumeWindow.focus()
          resumeWindow.print()
        }, 500)
      }

      // For older browsers, trigger print immediately
      setTimeout(() => {
        resumeWindow.focus()
        resumeWindow.print()
      }, 1000)

      // Show success message with instructions
      setSuccessMessage('Resume opened in new window! In the print dialog:\n\n1. Select "Save as PDF" as destination\n2. Choose appropriate paper size (A4 recommended)\n3. Make sure all content fits on the page\n4. Click Save to download your resume')
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Export error:', error)
      setErrorMessage('Failed to export resume. Please try again or use the preview option to manually print.')
      setShowErrorModal(true)
    }
  }

  const generateResumeHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resumeData.personalInfo.fullName} - Resume</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Source Sans Pro', 'Times New Roman', serif; 
            line-height: 1.5; 
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 0.75in;
            font-size: 11pt;
          }
          
          .resume-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 0.3in;
            padding-bottom: 0.15in;
            border-bottom: 1.5pt solid #000000;
          }
          
          .name {
            font-family: 'Crimson Text', 'Times New Roman', serif;
            font-size: 24pt;
            font-weight: 600;
            margin-bottom: 0.1in;
            letter-spacing: 0.5pt;
            color: #000000;
          }
          
          .contact-info {
            font-size: 10pt;
            line-height: 1.4;
            color: #333333;
          }
          
          .contact-item {
            display: inline;
            margin: 0 0.15in;
          }
          
          .contact-item:first-child {
            margin-left: 0;
          }
          
          .contact-item:last-child {
            margin-right: 0;
          }
          
          .content {
            margin-top: 0.2in;
          }
          
          .section {
            margin-bottom: 0.25in;
          }
          
          .section:last-child {
            margin-bottom: 0;
          }
          
          .section-title {
            font-family: 'Crimson Text', 'Times New Roman', serif;
            font-size: 14pt;
            font-weight: 600;
            color: #000000;
            margin-bottom: 0.1in;
            text-transform: uppercase;
            letter-spacing: 1pt;
            border-bottom: 0.5pt solid #000000;
            padding-bottom: 0.05in;
          }
          
          .summary {
            font-size: 11pt;
            line-height: 1.5;
            color: #000000;
            text-align: justify;
            margin-bottom: 0.15in;
          }
          
          .item {
            margin-bottom: 0.2in;
          }
          
          .item:last-child {
            margin-bottom: 0;
          }
          
          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.05in;
          }
          
          .item-title {
            font-weight: 600;
            color: #000000;
            font-size: 11pt;
          }
          
          .item-company {
            font-weight: 400;
            font-style: italic;
            color: #000000;
            margin-top: 0.02in;
          }
          
          .item-details {
            color: #333333;
            font-size: 10pt;
            margin-bottom: 0.08in;
            font-style: italic;
          }
          
          .item-date {
            color: #333333;
            font-size: 10pt;
            font-weight: 400;
            white-space: nowrap;
            font-style: italic;
          }
          
          .item-description {
            color: #000000;
            line-height: 1.4;
            text-align: justify;
            font-size: 10pt;
          }
          
          .item-description ul {
            margin: 0.05in 0 0.05in 0.2in;
            padding: 0;
          }
          
          .item-description li {
            margin-bottom: 0.03in;
          }
          
          .skills-container {
            display: block;
            line-height: 1.4;
          }
          
          .skill {
            display: inline;
            margin-right: 0.1in;
            font-size: 10pt;
          }
          
          .skill:after {
            content: '•';
            margin-left: 0.1in;
            color: #666666;
          }
          
          .skill:last-child:after {
            content: '';
            margin-left: 0;
          }
          
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.3in;
            margin-top: 0.1in;
          }
          
          .gpa {
            font-style: italic;
            color: #333333;
          }
          
          .project-link {
            color: #000000;
            text-decoration: underline;
            font-size: 10pt;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0.75in; 
              font-size: 11pt;
            }
            .resume-container {
              max-width: none;
            }
            .section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .item {
              page-break-inside: avoid;
              break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <div class="name">${resumeData.personalInfo.fullName}</div>
            <div class="contact-info">
              ${[
                resumeData.personalInfo.email,
                resumeData.personalInfo.phone,
                resumeData.personalInfo.location,
                resumeData.personalInfo.linkedin,
                resumeData.personalInfo.website
              ].filter(Boolean).map(item => `<span class="contact-item">${item}</span>`).join('')}
            </div>
          </div>
          
          <div class="content">
            ${resumeData.summary ? `
            <div class="section">
              <div class="section-title">Summary</div>
              <div class="summary">${resumeData.summary}</div>
            </div>
            ` : ''}
            
            ${resumeData.experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${resumeData.experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${exp.position}</div>
                      <div class="item-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                    </div>
                    <div class="item-date">${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  ${exp.description ? `<div class="item-description">${exp.description.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.education.length > 0 ? `
            <div class="section">
              <div class="section-title">Education</div>
              ${resumeData.education.map(edu => `
                <div class="item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                      <div class="item-company">${edu.institution}</div>
                    </div>
                    <div class="item-date">${edu.startDate} – ${edu.current ? 'Present' : edu.endDate}</div>
                  </div>
                  ${edu.gpa ? `<div class="item-details">GPA: <span class="gpa">${edu.gpa}</span></div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Technical Skills</div>
              <div class="skills-container">
                ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
              </div>
            </div>
            ` : ''}
            
            ${resumeData.projects.length > 0 ? `
            <div class="section">
              <div class="section-title">Projects</div>
              ${resumeData.projects.map(proj => `
                <div class="item">
                  <div class="item-header">
                    <div class="item-title">${proj.name}</div>
                    ${proj.link ? `<div><a href="${proj.link}" class="project-link">${proj.link}</a></div>` : ''}
                  </div>
                  ${proj.technologies ? `<div class="item-details">Technologies: ${proj.technologies}</div>` : ''}
                  ${proj.description ? `<div class="item-description">${proj.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-500 border-t-transparent"></div>
      </div>
    )
  }

  const sections = [
    { id: 'personal', name: 'Personal Information', icon: 'user' },
    { id: 'summary', name: 'Professional Summary', icon: 'document' },
    { id: 'experience', name: 'Work Experience', icon: 'briefcase' },
    { id: 'education', name: 'Education', icon: 'academic' },
    { id: 'skills', name: 'Technical Skills', icon: 'cog' },
    { id: 'projects', name: 'Projects', icon: 'folder' }
  ]

  const getIconSVG = (iconType: string) => {
    const iconMap = {
      user: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      document: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      briefcase: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V8" />
        </svg>
      ),
      academic: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      cog: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      folder: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }
    return iconMap[iconType as keyof typeof iconMap] || iconMap.document
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-700"></div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-red-500">Hodor</span> Resume Builder
                </h1>
                <p className="text-sm text-gray-400">Create a polished, ATS-friendly resume</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const resumeWindow = window.open('', '_blank')
                  if (resumeWindow) {
                    resumeWindow.document.write(generateResumeHTML())
                    resumeWindow.document.close()
                  }
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 sticky top-8">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Resume Sections</h3>
                <p className="text-sm text-gray-400">Complete each section to build your professional resume</p>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center group ${
                      activeSection === section.id
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                    }`}
                  >
                    <span className={`mr-3 transition-colors ${
                      activeSection === section.id ? 'text-red-200' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {getIconSVG(section.icon)}
                    </span>
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-medium text-sm mb-2">Tips for Success</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Use action verbs to start bullet points</li>
                  <li>• Quantify achievements with numbers</li>
                  <li>• Keep descriptions concise and relevant</li>
                  <li>• Tailor content to your target role</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl">
              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Personal Information</h3>
                    <p className="text-gray-400">Enter your contact details and professional information</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Full Name *</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Email Address *</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number</label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Location</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, location: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="City, State or City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Website/Portfolio</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, website: e.target.value }
                        }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Summary Section */}
              {activeSection === 'summary' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Professional Summary</h3>
                    <p className="text-gray-400">Write a compelling overview of your professional background and key qualifications</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">Professional Summary</label>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      rows={8}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
                      placeholder="Experienced [Your Role] with [X] years of experience in [Industry/Field]. Proven track record of [Key Achievement]. Skilled in [Key Skills] with expertise in [Specific Areas]. Seeking to leverage [Your Strengths] to drive [Business Impact] at [Target Company Type]."
                    />
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                      <h4 className="text-sm font-medium text-red-300 mb-2">Writing Tips</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Keep it 3-4 sentences (50-100 words)</li>
                        <li>• Start with your job title and years of experience</li>
                        <li>• Highlight 2-3 key achievements or skills</li>
                        <li>• Mention your career goals or target role</li>
                        <li>• Use action words and quantify results where possible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSection === 'experience' && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Work Experience</h3>
                      <p className="text-gray-400">Add your professional work history and achievements</p>
                    </div>
                    <button
                      onClick={addExperience}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Position
                    </button>
                  </div>
                  
                  {resumeData.experience.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V8" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-300 mb-2">No work experience added yet</h4>
                      <p className="text-gray-500 mb-4">Start by adding your most recent position</p>
                      <button
                        onClick={addExperience}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Add Your First Position
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">Experience #{resumeData.experience.indexOf(exp) + 1}</h4>
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Job Title</label>
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="Software Engineer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Company</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="Tech Company Inc."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Location</label>
                              <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="San Francisco, CA"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Start Date</label>
                              <input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">End Date</label>
                              <input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`current-${exp.id}`}
                                checked={exp.current}
                                onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                className="mr-2"
                              />
                              <label htmlFor={`current-${exp.id}`} className="text-sm">Currently working here</label>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Job Description</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              rows={4}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              placeholder="• Developed and maintained web applications using React and Node.js&#10;• Collaborated with cross-functional teams to deliver features&#10;• Improved application performance by 30%"
                            />
                            <div className="text-sm text-gray-400 mt-2">
                              Use bullet points and quantify achievements when possible
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Education Section */}
              {activeSection === 'education' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Education</h3>
                    <button
                      onClick={addEducation}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add Education
                    </button>
                  </div>
                  
                  {resumeData.education.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">🎓</div>
                      <p>No education added yet. Click "Add Education" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">Education #{resumeData.education.indexOf(edu) + 1}</h4>
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Institution</label>
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="University of California"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Degree</label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="Bachelor of Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Field of Study</label>
                              <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="Computer Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">GPA (Optional)</label>
                              <input
                                type="text"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="3.8/4.0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Start Date</label>
                              <input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">End Date</label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                disabled={edu.current}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
                              />
                            </div>
                            <div className="flex items-center md:col-span-2">
                              <input
                                type="checkbox"
                                id={`current-edu-${edu.id}`}
                                checked={edu.current}
                                onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                                className="mr-2"
                              />
                              <label htmlFor={`current-edu-${edu.id}`} className="text-sm">Currently enrolled</label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Technical Skills</h3>
                    <p className="text-gray-400">Add your relevant technical and professional skills</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter a skill (e.g., JavaScript, Project Management, Adobe Photoshop)"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            const skill = input.value.trim()
                            if (skill && !resumeData.skills.includes(skill)) {
                              setResumeData(prev => ({
                                ...prev,
                                skills: [...prev.skills, skill]
                              }))
                              input.value = ''
                            }
                          }
                        }}
                        id="skill-input"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('skill-input') as HTMLInputElement
                          const skill = input.value.trim()
                          if (skill && !resumeData.skills.includes(skill)) {
                            setResumeData(prev => ({
                              ...prev,
                              skills: [...prev.skills, skill]
                            }))
                            input.value = ''
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Press Enter or click Add to include the skill</p>
                  </div>
                  
                  {resumeData.skills.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-300 mb-2">No skills added yet</h4>
                      <p className="text-gray-500">Add technical skills, programming languages, tools, and frameworks</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {resumeData.skills.map((skill, index) => (
                          <div key={index} className="bg-red-600/20 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 group">
                            <span className="font-medium">{skill}</span>
                            <button
                              onClick={() => removeSkill(index)}
                              className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-gray-400">
                        {resumeData.skills.length} skills added • Click the × to remove a skill
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Section */}
              {activeSection === 'projects' && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">Projects</h3>
                      <p className="text-gray-400">Showcase your professional and personal projects</p>
                    </div>
                    <button
                      onClick={addProject}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Project
                    </button>
                  </div>
                  
                  {resumeData.projects.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-300 mb-2">No projects added yet</h4>
                      <p className="text-gray-500 mb-4">Add projects to demonstrate your skills and experience</p>
                      <button
                        onClick={addProject}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Add Your First Project
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {resumeData.projects.map((project) => (
                        <div key={project.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">Project #{resumeData.projects.indexOf(project) + 1}</h4>
                            <button
                              onClick={() => removeProject(project.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Project Name</label>
                              <input
                                type="text"
                                value={project.name}
                                onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="Awesome Web App"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Technologies Used</label>
                              <input
                                type="text"
                                value={project.technologies}
                                onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="React, Node.js, MongoDB"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-2">Project Link (Optional)</label>
                              <input
                                type="url"
                                value={project.link}
                                onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                placeholder="https://github.com/username/project"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Project Description</label>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                              rows={3}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              placeholder="A web application that helps users manage their tasks with real-time collaboration features..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Error</h3>
                <p className="text-sm text-gray-400">Something went wrong</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">{errorMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Export Started</h3>
                <p className="text-sm text-gray-400">Follow the steps to save as PDF</p>
              </div>
            </div>
            <div className="text-gray-300 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-white mb-2">How to save as PDF:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Select "Save as PDF" or "Microsoft Print to PDF"</li>
                  <li>Choose A4 paper size for best results</li>
                  <li>Ensure all content fits on the page</li>
                  <li>Click "Save" to download your resume</li>
                </ol>
              </div>
              <p className="text-sm text-gray-400">
                If the print dialog didn't open, click "Preview" to open the resume in a new tab.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  const resumeWindow = window.open('', '_blank')
                  if (resumeWindow) {
                    resumeWindow.document.write(generateResumeHTML())
                    resumeWindow.document.close()
                  }
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Open Preview
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
