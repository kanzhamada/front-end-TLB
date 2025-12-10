import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type UserProfile = {
	id: string;
	email: string;
	display_name: string;
	phone?: string | null;
	coin: number;
};

type Session = {
	access_token: string;
	token_type?: string;
	expires_at?: number;
	refresh_token?: string;
	user: UserProfile;
};

type AuthState = {
	session: Session | null;
	loading: boolean;
};

const STORAGE_KEY = 'tlb.auth.session';

const createAuthStore = () => {
	const initialState: AuthState = {
		session: null,
		loading: true
	};

	const { subscribe, set, update } = writable<AuthState>(initialState);

	function persist(session: Session | null) {
		if (!browser) return;
		if (session) {
			const { user, ...sessionWithoutUser } = session;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWithoutUser));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	function restore(): Session | null {
		if (!browser) return null;
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw) as Session;
			return parsed;
		} catch (error) {
			console.warn('Failed to parse stored session', error);
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}

	// Immediately restore on store creation
	const cached = restore();
	set({
		session: cached,
		loading: false
	});

	return {
		subscribe,
		setSession(session: Session | null) {
			persist(session);
			update((state) => ({ ...state, session }));
		},
		startLoading() {
			update((state) => ({ ...state, loading: true }));
		},
		stopLoading() {
			update((state) => ({ ...state, loading: false }));
		},
		clear() {
			persist(null);
			set({ session: null, loading: false });
		}
	};
};

export const authStore = createAuthStore();
export type { Session, UserProfile, AuthState };
