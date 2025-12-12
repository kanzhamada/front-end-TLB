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
	console.log('createAuthStore called');
	const initialState: AuthState = {
		session: null,
		loading: true
	};
	console.log('initialState:', initialState);

	const { subscribe, set, update } = writable<AuthState>(initialState);
	console.log('writable store created');

	function persist(session: Session | null) {
		console.log('persist called with session:', session);
		if (!browser) {
			console.log('Not in browser, returning from persist');
			return;
		}
		if (session) {
			console.log('Session exists, persisting...');
			const { user, ...sessionWithoutUser } = session;
			console.log('sessionWithoutUser:', sessionWithoutUser);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionWithoutUser));
			console.log('Session stored in localStorage');
		} else {
			console.log('No session, removing from localStorage');
			localStorage.removeItem(STORAGE_KEY);
			console.log('Session removed from localStorage');
		}
	}

	function restore(): Session | null {
		console.log('restore called');
		if (!browser) {
			console.log('Not in browser, returning null from restore');
			return null;
		}
		const raw = localStorage.getItem(STORAGE_KEY);
		console.log('raw stored session:', raw);
		if (!raw) {
			console.log('No raw session found, returning null');
			return null;
		}
		try {
			const parsed = JSON.parse(raw) as Session;
			console.log('Parsed session:', parsed);
			return parsed;
		} catch (error) {
			console.warn('Failed to parse stored session', error);
			localStorage.removeItem(STORAGE_KEY);
			console.log('Removed invalid session from localStorage');
			return null;
		}
	}

	// Immediately restore on store creation
	const cached = restore();
	console.log('Cached session after restore:', cached);
	set({
		session: cached,
		loading: false
	});
	console.log('Store initialized with cached session and loading set to false');

	return {
		subscribe,
		setSession(session: Session | null) {
			console.log('setSession called with session:', session);
			persist(session);
			update((state) => {
				console.log('Updating state with new session:', { ...state, session });
				return { ...state, session };
			});
			console.log('Session updated in store');
		},
		startLoading() {
			console.log('startLoading called');
			update((state) => {
				console.log('Updating state to loading: true');
				return { ...state, loading: true };
			});
			console.log('Loading started');
		},
		stopLoading() {
			console.log('stopLoading called');
			update((state) => {
				console.log('Updating state to loading: false');
				return { ...state, loading: false };
			});
			console.log('Loading stopped');
		},
		clear() {
			console.log('clear called');
			persist(null);
			set({ session: null, loading: false });
			console.log('Store cleared: session null, loading false');
		}
	};
};

export const authStore = createAuthStore();
export type { Session, UserProfile, AuthState };
