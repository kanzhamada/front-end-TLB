import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Redirect from /profile to /profile/reservation since the profile page was removed
	throw redirect(302, '/profile/reservation');
};