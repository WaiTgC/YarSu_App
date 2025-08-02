import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to set JWT token for authenticated requests
export const setSupabaseAuthToken = async (token) => {
  await supabase.auth.setSession({ access_token: token, refresh_token: '' });
};