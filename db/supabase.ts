import * as dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.SB_SUPABASE_URL || '',
  process.env.SB_NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)
