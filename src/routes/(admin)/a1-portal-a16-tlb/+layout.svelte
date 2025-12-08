<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';

	let { children, data } = $props();

	// Sync server session to client store
	$effect(() => {
		if (data.session) {
			authStore.setSession({
				access_token: data.session.access_token,
				refresh_token: data.session.refresh_token,
				user: {
					id: data.session.user.id,
					email: data.session.user.email || '',
					display_name: data.session.user.user_metadata.full_name || '',
					coin: 0 // Default or fetch if needed
				}
			});
		} else {
			// If no session on server (e.g. logout), clear client store
			// But be careful not to clear if we are on login page and just haven't logged in yet?
			// Actually, if data.session is null, we are not logged in, so store should be null.
			authStore.clear();
		}
	});
</script>

<CustomCursor />
{@render children?.()}
