import { type Handle, error, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
	// Security Headers
	event.setHeaders({
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
	});

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	// Get token from cookies
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	if (accessToken) {
		await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken || ''
		});
	}

	// Check for session
	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Admin Route Protection
	if (event.url.pathname.startsWith('/a1-portal-a16-tlb')) {
		const isLoginPage = event.url.pathname === '/a1-portal-a16-tlb/login';

		if (!session) {
			if (isLoginPage) {
				// Allow access to login page
			} else {
				// Unauthorized access to admin portal -> 404 to hide it
				error(404, 'Not Found');
			}
		} else {
			// Check role
			// Assuming role is in user_metadata or a separate table. 
            // For now, let's check user_metadata.role or app_metadata.role
			const role = session.user.user_metadata?.role || session.user.app_metadata?.role;

			if (role !== 'admin') {
				// Logged in but not admin -> 404
				error(404, 'Not Found');
			}

            // If logged in as admin and on login page, redirect to dashboard
            if (isLoginPage) {
                redirect(303, '/a1-portal-a16-tlb');
            }
		}
	}

	const response = await resolve(event);
	return response;
};
