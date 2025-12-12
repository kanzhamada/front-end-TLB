<script lang="ts">
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
	import { forgotPassword } from '$lib/api/auth';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from 'lucide-svelte';
	import { browser } from '$app/environment';

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
			console.log('Attempting admin forgot password with:', { email });

			const response = await forgotPassword({ email, isAdmin: true });
			console.log('Forgot password response:', response);

			const success = response.success ?? response.sucess ?? false;

			console.log('1');
			if (!success) {
				console.log('2');
				const errorMessage = response.message ?? 'Failed to send email. Please try again.';
				handleError(errorMessage);
				return;
			}
			console.log('3');

			toast.success('Password reset email sent!');
		} catch (error) {
			console.error('Forgot password error:', error);

			if (browser) {
				const customError = error as { response?: { message?: string } };
				const message = customError?.response?.message ?? 'Failed to send email. Please try again.';
				handleError(message);
			} else {
				handleError('Failed to send email. Please try again.');
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
				>Recovery</CardTitle
			>
			<CardDescription class="font-light tracking-wide text-secondary/50">
				Enter your email to reset password
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
						Sending...
					{:else}
						Send Reset Link
					{/if}
				</Button>

				<div class="text-center">
					<a
						href="/a1-portal-a16-tlb/login"
						class="text-xs tracking-widest text-white/40 uppercase transition-colors hover:text-senary"
					>
						Back to Login
					</a>
				</div>
			</form>
		</CardContent>
	</Card>

	<div class="absolute bottom-8 text-center text-xs tracking-widest text-white/20 uppercase">
		&copy; {new Date().getFullYear()} Three Lights Barbershop
	</div>
</div>
