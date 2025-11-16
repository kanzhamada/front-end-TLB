import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: browser
	}
});
