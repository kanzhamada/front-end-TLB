<!-- <script lang="ts">
	import { goto } from '$app/navigation';
	import { register } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	let displayName = $state('');
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let submitting = $state(false);
	let formError = $state<string | null>(null);

	function handleError(message: string) {
		formError = message;
		toast.error(message);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;

		if (password !== confirmPassword) {
			handleError('Konfirmasi kata sandi tidak cocok.');
			return;
		}

		formError = null;
		submitting = true;

		try {
			const response = await register({
				displayName,
				email,
				password,
				phone: phone || undefined
			});

			const success = response.success ?? response.sucess ?? false;

			if (!success || !response.data?.session) {
				handleError(response.message ?? 'Gagal mendaftar. Coba lagi.');
				return;
			}

			authStore.setSession(response.data.session);
			toast.success('Pendaftaran berhasil!');
			await goto('/');
		} catch (error: unknown) {
			const customError = error as { response?: { message?: string } };
			const message = customError?.response?.message ?? 'Tidak dapat mendaftar. Coba lagi.';
			handleError(message);
		} finally {
			submitting = false;
		}
	}
</script> -->

<script lang="ts">
	import { goto } from '$app/navigation';
	import { register } from '$lib/api/auth';
	import { phoneSchema } from '$lib/zod/schema';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';
	import { Sparkles, Eye, EyeOff } from 'lucide-svelte';

	let displayName = $state('');
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

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

		if (password !== confirmPassword) {
			console.log('Passwords do not match.');
			handleError('Kata sandi tidak cocok.');
			return;
		}

		if (phone) {
			const phoneValidation = phoneSchema.safeParse(phone);
			if (!phoneValidation.success) {
				handleError(phoneValidation.error.errors[0].message);
				return;
			}
		}

		formError = null;
		submitting = true;

		try {
			const response = await register({
				displayName,
				email,
				password,
				phone: phone || undefined
			});

			const success = response.success ?? response.sucess ?? false;

			if (!success) {
				console.log('Registration failed 1:', response);
				handleError(response.message ?? 'Pendaftaran gagal. Silakan coba lagi.');
				return;
			}

			toast.success('Pendaftaran berhasil! Periksa email Anda untuk konfirmasi.');
			await goto('/auth/login');
		} catch (error: unknown) {
			console.log('Registration failed:', error);
			const customError = error as { response?: { message?: string } };
			const message = customError?.response?.message ?? 'Tidak dapat mendaftar. Silakan coba lagi.';
			handleError(message);
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Register | Three Lights Barbershop</title>
</svelte:head>
<div class="relative min-h-screen overflow-hidden text-secondary selection:bg-senary/30">
	<!-- Background -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
	></div>

	<div
		class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12"
		in:fade={{ duration: 1000 }}
	>
		<!-- Logo/Brand -->
		<div
			class="mb-8 flex flex-col items-center gap-4 text-center"
			in:fly={{ y: -20, duration: 800, delay: 200 }}
		>
			<div class="flex items-center gap-4">
				<div class="h-[1px] w-12 bg-senary"></div>
				<p class="text-lg font-medium tracking-[0.3em] text-senary uppercase">
					Three Lights Barbershop
				</p>
				<div class="h-[1px] w-12 bg-senary"></div>
			</div>
			<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-5xl">
				Bergabunglah <span class="text-gradient-gold">Bersama Kami</span>
			</h1>
		</div>

		<!-- Register Card -->
		<div
			class="w-full max-w-lg transform rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-senary/20 hover:bg-white/10"
			in:fly={{ y: 20, duration: 800, delay: 400 }}
		>
			<div class="mb-8 text-center">
				<img
					src="/three_lights_barbershop_logo.svg"
					alt="three lights barbershop logo"
					class="mx-auto mb-4"
				/>
				<p class="text-lg font-light text-secondary/80">Buat akun untuk memesan janji temu</p>
			</div>

			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="displayName" class="text-sm font-medium text-senary">Nama Lengkap</Label>
					<Input
						id="displayName"
						placeholder="Nama Anda"
						bind:value={displayName}
						required
						autocomplete="name"
						disabled={submitting}
						class="border-white/10 bg-black/20 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
					/>
				</div>

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
					<Label for="phone" class="text-sm font-medium text-senary">Nomor Telepon</Label>
					<Input
						id="phone"
						type="tel"
						placeholder="08xxxxxxxxxx"
						bind:value={phone}
						required
						autocomplete="tel"
						disabled={submitting}
						class="border-white/10 bg-black/20 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
					/>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="password" class="text-sm font-medium text-senary">Kata Sandi</Label>
						<div class="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Min 8 karakter"
								bind:value={password}
								required
								autocomplete="new-password"
								minlength={8}
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
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword" class="text-sm font-medium text-senary"
							>Konfirmasi Kata Sandi</Label
						>
						<div class="relative">
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="Ulangi kata sandi"
								bind:value={confirmPassword}
								required
								minlength={8}
								autocomplete="new-password"
								disabled={submitting}
								class="border-white/10 bg-black/20 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
							/>
							<button
								type="button"
								class="absolute top-1/2 right-3 -translate-y-1/2 text-secondary/50 hover:text-senary"
								onclick={() => (showConfirmPassword = !showConfirmPassword)}
							>
								{#if showConfirmPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
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
					{submitting ? 'Sedang Membuat Akun...' : 'Buat Akun'}
				</Button>
				<Button
					type="button"
					class=" w-full bg-white text-black hover:bg-gray-200"
					onclick={loginWithGoogle}
				>
					Daftar dengan Google <svg
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
				<Button
					type="button"
					class=" w-full bg-white text-black hover:bg-gray-200"
					onclick={loginWithGoogle}
				>
					Register with Google <svg
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
					Sudah punya akun?
					<a
						href="/auth/login"
						class="font-medium text-senary underline-offset-4 transition-colors hover:text-senary/80 hover:underline"
					>
						Masuk di sini
					</a>
				</p>
			</div>
		</div>
	</div>
</div>
