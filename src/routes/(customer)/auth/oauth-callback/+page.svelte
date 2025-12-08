<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	onMount(async () => {
		console.log('OAuth callback page mounted');

		const hash = new URLSearchParams(window.location.hash.substring(1));

		const access_token = hash.get('access_token');
		const refresh_token = hash.get('refresh_token');

		console.log('OAuth tokens:', { access_token, refresh_token });

		if (!access_token || !refresh_token) {
			console.log('Missing OAuth tokens');
			await goto('/auth/login');
			return;
		}

		const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/oauth-callback`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ access_token, refresh_token })
		});

		console.log('BE response status:', res.status);

		const json = await res.json();
		console.log('OAuth BE response:', json);

		if (!json.success || !json.data?.session) {
			await goto('/auth/login');
			return;
		}

		// ✅ INI KUNCI
		authStore.setSession(json.data.session);

		await goto('/');
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-primary text-secondary">
	<div class="text-center">
		<h1 class="text-2xl font-bold">Authenticating...</h1>
		<p class="mt-2 text-secondary/60">Please wait while we log you in.</p>
	</div>
</div>
