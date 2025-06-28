// This is a test file to verify imports work correctly
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

// If this file compiles without errors, the path alias is working
console.log('Supabase client loaded:', !!supabase)

export default function testImports() {
  return 'Imports working correctly!'
}
