import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from Authorization header
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { resumeText, fileName } = body

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    // Simple resume analysis (no external APIs needed)
    const analysis = analyzeResume(resumeText)

    return NextResponse.json({
      success: true,
      analysis,
      fileName
    })

  } catch (error) {
    console.error('Resume analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze resume', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

// Simple resume analysis function (free-tier friendly)
function analyzeResume(resumeText: string) {
  const text = resumeText.toLowerCase()
  
  // Basic scoring criteria
  let score = 0
  const feedback = []
  const strengths = []
  const improvements = []

  // Contact information (10 points)
  if (text.includes('@') && (text.includes('.com') || text.includes('.org'))) {
    score += 10
    strengths.push('✅ Email address found')
  } else {
    improvements.push('❌ Add a professional email address')
  }

  if (text.includes('phone') || /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) {
    score += 5
    strengths.push('✅ Phone number included')
  } else {
    improvements.push('❌ Add phone number')
  }

  // Skills section (20 points)
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css',
    'typescript', 'angular', 'vue', 'php', 'c++', 'c#', 'ruby', 'go',
    'docker', 'kubernetes', 'aws', 'azure', 'git', 'mongodb', 'postgresql'
  ]
  
  const foundSkills = commonSkills.filter(skill => text.includes(skill))
  if (foundSkills.length > 0) {
    score += Math.min(20, foundSkills.length * 2)
    strengths.push(`✅ Technical skills found: ${foundSkills.slice(0, 5).join(', ')}${foundSkills.length > 5 ? '...' : ''}`)
  } else {
    improvements.push('❌ Add a skills section with relevant technologies')
  }

  // Experience section (25 points)
  if (text.includes('experience') || text.includes('work') || text.includes('employment')) {
    score += 15
    strengths.push('✅ Work experience section found')
    
    // Check for quantifiable achievements
    if (/\d+%|\d+\+|increased|improved|reduced|achieved/.test(text)) {
      score += 10
      strengths.push('✅ Quantifiable achievements mentioned')
    } else {
      improvements.push('❌ Add quantifiable achievements (e.g., "Increased efficiency by 30%")')
    }
  } else {
    improvements.push('❌ Add work experience section')
  }

  // Education (15 points)
  if (text.includes('education') || text.includes('degree') || text.includes('university') || text.includes('college')) {
    score += 15
    strengths.push('✅ Education section found')
  } else {
    improvements.push('❌ Add education section')
  }

  // Projects (15 points)
  if (text.includes('project') || text.includes('github') || text.includes('portfolio')) {
    score += 15
    strengths.push('✅ Projects/Portfolio mentioned')
  } else {
    improvements.push('❌ Add projects or portfolio section')
  }

  // Length check (10 points)
  const wordCount = resumeText.split(/\s+/).length
  if (wordCount >= 200 && wordCount <= 800) {
    score += 10
    strengths.push('✅ Good resume length')
  } else if (wordCount < 200) {
    improvements.push('❌ Resume seems too short - add more detail')
  } else {
    improvements.push('❌ Resume might be too long - consider condensing')
  }

  // Final score calculation
  const finalScore = Math.min(100, score)
  
  // Overall feedback
  if (finalScore >= 80) {
    feedback.push('🎉 Excellent resume! You have most key elements covered.')
  } else if (finalScore >= 60) {
    feedback.push('👍 Good resume with room for improvement.')
  } else if (finalScore >= 40) {
    feedback.push('📝 Decent start, but several areas need attention.')
  } else {
    feedback.push('🔧 Resume needs significant improvements to be competitive.')
  }

  return {
    score: finalScore,
    feedback,
    strengths,
    improvements,
    wordCount,
    skillsFound: commonSkills.filter(skill => text.includes(skill)),
    recommendations: [
      'Use action verbs (achieved, led, developed, implemented)',
      'Include keywords from job descriptions',
      'Keep formatting clean and professional',
      'Proofread for typos and grammar errors',
      'Tailor resume for each job application'
    ]
  }
}
