import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear Supabase Auth Cookies
	cookies.delete('sb-access-token', { path: '/' });
	cookies.delete('sb-refresh-token', { path: '/' });
    
    // Clear Custom Session Cookie (if any)
    cookies.delete('tlb.auth.session', { path: '/' });

	return json({ success: true, message: 'Logged out successfully' });
};