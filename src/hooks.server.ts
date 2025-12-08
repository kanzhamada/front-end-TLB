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

	let session = null;

	if (accessToken) {
		await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken || ''
		});

		// Only call getSession if we have a token to validate
		const { data } = await supabase.auth.getSession();
		session = data.session;
	}

	event.locals.session = session;

	// Admin Route Protection
	if (event.url.pathname.startsWith('/a1-portal-a16-tlb')) {
		const allowedUnauthenticatedPaths = [
			'/a1-portal-a16-tlb/login',
			'/a1-portal-a16-tlb/login/forget-password',
			'/a1-portal-a16-tlb/login/update-password'
		];
		const isAllowedPath = allowedUnauthenticatedPaths.includes(event.url.pathname);

		if (!session) {
			if (!isAllowedPath) {
				// Unauthorized access to admin portal -> 404 to hide it
				// This effectively hides the admin routes from public view
				error(404, 'Not Found');
			}
			// Allow access to login page for unauthenticated users
		} else {
			// Check role
			const role = session.user.user_metadata?.role || session.user.app_metadata?.role;

			if (role !== 'admin') {
				// User is logged in but NOT an admin
				// If they try to access any admin page (except login), return 404
				// This ensures that even logged-in customers cannot see admin routes
				if (!isAllowedPath) {
					error(404, 'Not Found');
				}
				// If they are on login page, we allow it (publicly accessible)
				// They might want to logout and login as admin
			} else {
				// User IS an admin
				// If they are on the login page, redirect them to the dashboard
				if (isAllowedPath) {
					redirect(303, '/a1-portal-a16-tlb');
				}
				// Otherwise allow access to admin pages
			}
		}
	}

	const response = await resolve(event);
	return response;
};
