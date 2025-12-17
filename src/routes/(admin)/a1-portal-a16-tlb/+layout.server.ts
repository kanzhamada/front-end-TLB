import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If user is not authenticated and not on the login page, redirect to login
	// Note: hooks.server.ts already handles 404s for unauthorized access,
	// but this ensures a friendly redirect for users who might have lost their session
	// while navigating.
	const allowedUnauthenticatedPaths = ['/a1-portal-a16-tlb/login', '/a1-portal-a16-tlb/login/forget-password', '/a1-portal-a16-tlb/login/update-password'];
	if (!locals.session && !allowedUnauthenticatedPaths.includes(url.pathname)) {
		throw redirect(303, '/a1-portal-a16-tlb/login');
	}

	return {
		session: locals.session,
		user: locals.session?.user
	};
};
