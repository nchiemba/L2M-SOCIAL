
import { createClient } from '@supabase/supabase-js';

// Detection strategy for multiple common environment variable names
const getEnv = (name: string) => {
  const env = (typeof process !== 'undefined' ? process.env : {}) as any;
  return env[name] || env[`VITE_${name}`] || env[`REACT_APP_${name}`] || '';
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'placeholder';

// Check if we are using real keys
export const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder' &&
  supabaseUrl.startsWith('https://');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
