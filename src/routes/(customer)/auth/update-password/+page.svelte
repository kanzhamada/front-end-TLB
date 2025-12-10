<script lang="ts">
	import { goto } from '$app/navigation';
	import { updatePassword } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';
	import { Sparkles, Eye, EyeOff } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let submitting = $state(false);
	let formError = $state<string | null>(null);

	let tokens = $state<{
		access_token: string;
		refresh_token: string;
		expires_in: string;
		expires_at: string;
		token_type: string;
		type: string;
	} | null>(null);

	onMount(() => {
		const hash = $page.url.hash;
		if (hash) {
			const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
			tokens = {
				access_token: params.get('access_token') || '',
				refresh_token: params.get('refresh_token') || '',
				expires_in: params.get('expires_in') || '',
				expires_at: params.get('expires_at') || '',
				token_type: params.get('token_type') || '',
				type: params.get('type') || ''
			};
			console.log('Extracted tokens:', tokens);
		} else {
			handleError('Token tidak valid atau kadaluarsa.');
		}
	});

	function handleError(message: string) {
		formError = message;
		toast.error(message);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;

		if (newPassword !== confirmPassword) {
			handleError('Password tidak sama.');
			return;
		}

		if (!tokens || !tokens.access_token) {
			handleError('Token tidak valid. Silakan request reset password ulang.');
			return;
		}

		formError = null;
		submitting = true;

		try {
			console.log('Attempting update password');

			const response = await updatePassword({
				...tokens,
				newPassword
			});
			console.log('Update password response:', response);

			const success = response.success ?? response.sucess ?? false;

			if (!success) {
				const errorMessage = response.message ?? 'Gagal mengubah password. Coba lagi.';
				handleError(errorMessage);
				console.log('Update password failed:', response);
				return;
			}

			toast.success('Password berhasil diubah! Silakan login.');
			await goto('/auth/login');
		} catch (error) {
			console.error('Update password error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message = customError?.response?.message ?? 'Gagal mengubah password. Coba lagi.';
				handleError(message);
			} else {
				handleError('Gagal mengubah password. Coba lagi.');
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Update Password | Three Lights Barbershop</title>
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
				Perbarui <span class="text-gradient-gold">Kata Sandi</span>
			</h1>
		</div>

		<!-- Update Password Card -->
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
				<p class="text-lg font-light text-secondary/80">Masukkan kata sandi baru Anda</p>
			</div>

			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="newPassword" class="text-sm font-medium text-senary">Kata Sandi Baru</Label>
					<div class="relative">
						<Input
							id="newPassword"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							bind:value={newPassword}
							required
							disabled={submitting}
							class="border-white/10 bg-black/20 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
						/>
						<button
							type="button"
							class="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-senary"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
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
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							bind:value={confirmPassword}
							required
							disabled={submitting}
							class="border-white/10 bg-black/20 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
						/>
						<button
							type="button"
							class="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-senary"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
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
					{submitting ? 'Sedang Memproses...' : 'Perbarui Kata Sandi'}
				</Button>
			</form>
		</div>
	</div>
</div>
