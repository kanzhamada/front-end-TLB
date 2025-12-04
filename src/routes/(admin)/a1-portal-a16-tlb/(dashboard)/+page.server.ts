import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const actions = {
	logout: async ({ cookies }) => {
		const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});

		await supabase.auth.signOut();

		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });

		throw redirect(303, '/a1-portal-a16-tlb/login');
	}
};
