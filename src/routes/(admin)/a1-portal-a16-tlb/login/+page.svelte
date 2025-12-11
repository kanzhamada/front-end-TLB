<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { Loader2 } from 'lucide-svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	const recaptchaSiteKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;

	declare global {
		interface Window {
			grecaptcha: any;
		}
	}

	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let formError = $state<string | null>(null);

	function handleError(message: string) {
		formError = message;
		toast.error(message);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;

		formError = null;
		submitting = true;

		try {
			console.log('Attempting admin login with:', { email });

			let recaptchaToken = '';
			try {
				if (window.grecaptcha) {
					recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
						action: 'admin_login'
					});
				}
			} catch (e) {
				console.error('Recaptcha execution failed:', e);
			}

			const response = await login({ email, password, recaptchaToken });
			console.log('Login response:', response);

			const success = response.success ?? response.sucess ?? false;

			if (!success || !response.data?.session) {
				const errorMessage = response.message ?? 'Login failed. Please try again.';
				handleError(errorMessage);
				console.log('Login failed:', response);
				return;
			}

			authStore.setSession(response.data.session);

			// Set cookies for server-side auth (hooks.server.ts)
			const { access_token, refresh_token, expires_at } = response.data.session;
			// expires_at is usually a timestamp in seconds. Calculate max-age.
			// If expires_at is missing, default to 7 days.
			let maxAge = 60 * 60 * 24 * 7;
			if (expires_at) {
				const nowInSeconds = Math.floor(Date.now() / 1000);
				maxAge = expires_at - nowInSeconds;
			}

			document.cookie = `sb-access-token=${access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
			document.cookie = `sb-refresh-token=${refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax; Secure`; // 30 days

			toast.success('Login successful!');
			await goto('/a1-portal-a16-tlb');
		} catch (error) {
			console.error('Login error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message = customError?.response?.message ?? 'Login failed. Please try again.';
				handleError(message);
			} else {
				handleError('Login failed. Please try again.');
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<script
		src="https://www.google.com/recaptcha/api.js?render={recaptchaSiteKey}"
		async
		defer
	></script>
	<title>Admin Login | Three Lights Barbershop</title>
</svelte:head>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 selection:bg-senary/30"
>
	<!-- Background Effects -->
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-senary/5 via-slate-950 to-slate-950"
	></div>
	<div
		class="pointer-events-none absolute top-0 left-0 h-full w-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay"
	></div>

	<!-- Decorative Orbs -->
	<div
		class="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-senary/5 blur-3xl"
	></div>
	<div
		class="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
	></div>

	<Card
		class="relative z-10 w-full max-w-md overflow-hidden border-white/10 bg-black/40 text-secondary shadow-2xl backdrop-blur-xl"
	>
		<!-- Card Top Highlight -->
		<div
			class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-senary/50 to-transparent"
		></div>

		<CardHeader class="space-y-2 pt-10 pb-8 text-center">
			<div
				class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-white/10 to-transparent shadow-inner"
			>
				<img
					src="/three_lights_barbershop_logo.svg"
					alt="Logo"
					class="h-12 w-12 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
				/>
			</div>
			<CardTitle class="text-3xl font-light tracking-[0.2em] text-white uppercase"
				>Admin Portal</CardTitle
			>
			<CardDescription class="font-light tracking-wide text-secondary/50">
				Secure Access Required
			</CardDescription>
		</CardHeader>
		<CardContent class="px-8 pb-10">
			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="email" class="text-sm font-medium text-senary">Email Address</Label>
					<Input
						id="email"
						type="email"
						placeholder="admin@example.com"
						bind:value={email}
						required
						autocomplete="email"
						disabled={submitting}
						class="h-12 border-white/10 bg-white/5 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
					/>
				</div>

				<div class="space-y-2">
					<Label for="password" class="text-sm font-medium text-senary">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						required
						autocomplete="current-password"
						disabled={submitting}
						class="h-12 border-white/10 bg-white/5 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
					/>
					<div class="text-right text-sm">
						<a
							href="/a1-portal-a16-tlb/login/forget-password"
							class="font-medium text-senary transition-colors hover:text-senary/80"
						>
							Forget password?
						</a>
					</div>
				</div>

				{#if formError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
						{formError}
					</div>
				{/if}

				<Button
					type="submit"
					class="h-12 w-full bg-senary font-bold tracking-wide text-primary shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] transition-all hover:bg-senary/90 hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.5)]"
					disabled={submitting}
				>
					{#if submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Authenticating...
					{:else}
						Access Dashboard
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>

	<div class="absolute bottom-8 text-center text-xs tracking-widest text-white/20 uppercase">
		&copy; {new Date().getFullYear()} Three Lights Barbershop
	</div>
</div>

<style>
	/* Gunakan !important untuk memastikan aturan ini menang */
	:global(.grecaptcha-badge) {
		visibility: hidden;
	}
</style>
