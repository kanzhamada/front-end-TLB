<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';
	import { Sparkles, Eye, EyeOff } from 'lucide-svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	import { onMount } from 'svelte';

	const recaptchaSiteKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;

	declare global {
		interface Window {
			grecaptcha: any;
		}
	}

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let submitting = $state(false);
	let formError = $state<string | null>(null);

	function handleError(message: string) {
		formError = message;
		toast.error(message);
	}

	async function loginWithGoogle() {
		const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/google`);
		const json = await res.json();

		if (json?.data?.url) {
			window.location.href = json.data.url;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;

		formError = null;
		submitting = true;

		try {
			console.log('Attempting login with:', { email, password });

			let recaptchaToken = '';
			try {
				if (window.grecaptcha) {
					recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'login' });
				}
			} catch (e) {
				console.error('Recaptcha execution failed:', e);
			}

			const response = await login({ email, password, recaptchaToken });
			console.log('Login response:', response);

			const success = response.success ?? response.sucess ?? false;

			if (!success || !response.data?.session) {
				const errorMessage = response.message ?? 'Gagal masuk. Coba lagi.';
				handleError(errorMessage);
				console.log('Login failed:', response);
				return;
			}

			authStore.setSession(response.data.session);
			toast.success('Berhasil masuk!');
			await goto('/');
		} catch (error) {
			console.error('Login error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message = customError?.response?.message ?? 'Tidak dapat masuk. Coba lagi.';
				handleError(message);
			} else {
				handleError('Tidak dapat masuk. Coba lagi.');
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
	<title>Login | Three Lights Barbershop</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden text-secondary selection:bg-senary/30">
	<!-- Background -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
	>
		<!-- <img
			src="https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
			alt=""
			class="h-full w-full object-cover opacity-25"
		/> -->
	</div>

	<div
		class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12"
		in:fade={{ duration: 1000 }}
	>
		<!-- Logo/Brand -->
		<div
			class="mb-8 flex flex-col items-center gap-4 text-center"
			in:fly={{ y: -20, duration: 800, delay: 200 }}
		>
			<div class="flex items-center gap-4">
				<div class="h-[1px] w-8 bg-senary md:w-12"></div>
				<p
					class="text-sm font-medium tracking-[0.2em] text-senary uppercase md:text-lg md:tracking-[0.3em]"
				>
					Three Lights Barbershop
				</p>
				<div class="h-[1px] w-8 bg-senary md:w-12"></div>
			</div>
			<h1 class="text-3xl font-bold tracking-tighter text-secondary md:text-5xl">
				Selamat Datang <span class="text-gradient-gold">Kembali</span>
			</h1>
		</div>

		<!-- Login Card -->
		<div
			class="w-full max-w-md transform rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-senary/20 hover:bg-white/10 md:p-8"
			in:fly={{ y: 20, duration: 800, delay: 400 }}
		>
			<div class="mb-8 text-center">
				<img
					src="/three_lights_barbershop_logo.svg"
					alt="three lights barbershop logo"
					class="mx-auto mb-4"
				/>
				<p class="text-lg font-light text-secondary/80">Masuk untuk mengelola reservasi Anda</p>
			</div>

			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="email" class="text-sm font-medium text-senary">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						bind:value={email}
						required
						autocomplete="email"
						disabled={submitting}
						class="border-white/10 bg-black/20 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
					/>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="password" class="text-sm font-medium text-senary">Kata Sandi</Label>
					</div>
					<div class="relative">
						<Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="Masukkan kata sandi Anda"
							bind:value={password}
							required
							autocomplete="current-password"
							disabled={submitting}
							class="border-white/10 bg-black/20 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
						/>
						<button
							type="button"
							class="absolute top-1/2 right-3 -translate-y-1/2 text-secondary/50 hover:text-senary"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff class="size-4" />
							{:else}
								<Eye class="size-4" />
							{/if}
						</button>
					</div>
					<div class="flex items-center justify-end">
						<a href="/auth/forget-password" class="text-senary hover:underline">
							Lupa Kata Sandi?
						</a>
					</div>
				</div>

				{#if formError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center" in:fade>
						<p class="text-sm font-medium text-red-400">{formError}</p>
					</div>
				{/if}

				<Button
					type="submit"
					class="w-full bg-senary font-medium tracking-wide text-primary transition-all duration-300 hover:bg-senary/90 hover:text-primary"
					disabled={submitting}
				>
					{submitting ? 'Sedang Masuk...' : 'Masuk'}
				</Button>

				<Button
					type="button"
					class=" w-full bg-white text-black hover:bg-gray-200"
					onclick={loginWithGoogle}
				>
					Masuk dengan Google <svg
						xmlns="http://www.w3.org/2000/svg"
						x="0px"
						y="0px"
						width="100"
						height="100"
						viewBox="0 0 48 48"
					>
						<path
							fill="#FFC107"
							d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
						></path><path
							fill="#FF3D00"
							d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
						></path><path
							fill="#4CAF50"
							d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
						></path><path
							fill="#1976D2"
							d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
						></path>
					</svg>
				</Button>
			</form>

			<div class="mt-8 text-center">
				<p class="text-sm text-secondary/60">
					Belum punya akun?
					<a
						href="/auth/register"
						class="font-medium text-senary underline-offset-4 transition-colors hover:text-senary/80 hover:underline"
					>
						Daftar di sini
					</a>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	/* Gunakan !important untuk memastikan aturan ini menang */
	:global(.grecaptcha-badge) {
		visibility: hidden;
	}
</style>
