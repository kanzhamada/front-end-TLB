<script lang="ts">
	import { goto } from '$app/navigation';
	import { forgotPassword } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';
	import { Sparkles } from 'lucide-svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let email = $state('');
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
			console.log('Attempting forgot password with:', { email });

			const response = await forgotPassword({ email });
			console.log('Forgot password response:', response);

			const success = response.success ?? response.sucess ?? false;

			if (!success) {
				const errorMessage = response.message ?? 'Gagal mengirim email. Coba lagi.';
				handleError(errorMessage);
				console.log('Forgot password failed:', response);
				return;
			}

			toast.success('Email reset password telah dikirim!');
			// Optional: redirect to login or show a success state
			// await goto('/auth/login');
		} catch (error) {
			console.error('Forgot password error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message = customError?.response?.message ?? 'Gagal mengirim email. Coba lagi.';
				handleError(message);
			} else {
				handleError('Gagal mengirim email. Coba lagi.');
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Forget Password | Three Lights Barbershop</title>
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
				Lupa <span class="text-gradient-gold">Kata Sandi?</span>
			</h1>
		</div>

		<!-- Login Card -->
		<div
			class="w-full max-w-md transform rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-senary/20 hover:bg-white/10"
			in:fly={{ y: 20, duration: 800, delay: 400 }}
		>
			<div class="mb-8 text-center">
				<img
					src="/three_lights_barbershop_logo.svg"
					alt="three lights barbershop logo"
					class="mx-auto mb-4"
				/>
				<p class="text-lg font-light text-secondary/80">
					Masukkan Email Anda untuk mengatur ulang kata sandi
				</p>
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

				{#if formError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center" in:fade>
						<p class="text-sm font-medium text-red-400">{formError}</p>
					</div>
				{/if}

				<Button
					type="submit"
					class="w-full bg-senary font-medium tracking-wide text-primary uppercase transition-all duration-300 hover:bg-senary/90 hover:text-primary"
					disabled={submitting}
				>
					{submitting ? 'Sedang Mengirim...' : 'Kirim'}
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
					atau
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
