<script lang="ts">
	import { goto } from '$app/navigation';
	import { updatePassword } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { Loader2, Eye, EyeOff } from 'lucide-svelte';
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
			handleError('Invalid or expired token.');
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
			handleError('Passwords do not match.');
			return;
		}

		if (!tokens || !tokens.access_token) {
			handleError('Invalid token. Please request a new password reset.');
			return;
		}

		formError = null;
		submitting = true;

		try {
			console.log('Attempting admin update password');

			const response = await updatePassword({
				...tokens,
				newPassword
			});
			console.log('Update password response:', response);

			const success = response.success ?? response.sucess ?? false;

			if (!success) {
				const errorMessage = response.message ?? 'Failed to update password. Please try again.';
				handleError(errorMessage);
				return;
			}

			toast.success('Password updated successfully! Please login.');
			await goto('/a1-portal-a16-tlb/login');
		} catch (error) {
			console.error('Update password error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message =
					customError?.response?.message ?? 'Failed to update password. Please try again.';
				handleError(message);
			} else {
				handleError('Failed to update password. Please try again.');
			}
		} finally {
			submitting = false;
		}
	}
</script>

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
				>New Password</CardTitle
			>
			<CardDescription class="font-light tracking-wide text-secondary/50">
				Set your new secure password
			</CardDescription>
		</CardHeader>
		<CardContent class="px-8 pb-10">
			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="newPassword" class="text-sm font-medium text-senary">New Password</Label>
					<div class="relative">
						<Input
							id="newPassword"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							bind:value={newPassword}
							required
							disabled={submitting}
							class="h-12 border-white/10 bg-white/5 pr-10 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
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
						>Confirm Password</Label
					>
					<div class="relative">
						<Input
							id="confirmPassword"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							bind:value={confirmPassword}
							required
							disabled={submitting}
							class="h-12 border-white/10 bg-white/5 pr-10 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
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
						Updating...
					{:else}
						Update Password
					{/if}
				</Button>
			</form>
		</CardContent>
	</Card>

	<div class="absolute bottom-8 text-center text-xs tracking-widest text-white/20 uppercase">
		&copy; {new Date().getFullYear()} Three Lights Barbershop
	</div>
</div>
