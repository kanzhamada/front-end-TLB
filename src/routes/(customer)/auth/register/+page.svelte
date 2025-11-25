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
	import { authStore } from '$lib/stores/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';
	import { Sparkles } from 'lucide-svelte';

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
			handleError('Passwords do not match.');
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
				handleError(response.message ?? 'Registration failed. Please try again.');
				return;
			}

			authStore.setSession(response.data.session);
			toast.success('Registration successful!');
			await goto('/');
		} catch (error: unknown) {
			const customError = error as { response?: { message?: string } };
			const message = customError?.response?.message ?? 'Unable to register. Please try again.';
			handleError(message);
		} finally {
			submitting = false;
		}
	}
</script>

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
				Join the <span class="text-gradient-gold">Elite</span>
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
				<p class="text-lg font-light text-secondary/80">Create your account to book appointments</p>
			</div>

			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="displayName" class="text-sm font-medium text-senary">Full Name</Label>
					<Input
						id="displayName"
						placeholder="Your Name"
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
					<Label for="phone" class="text-sm font-medium text-senary">Phone Number (Optional)</Label>
					<Input
						id="phone"
						type="tel"
						placeholder="08xxxxxxxxxx"
						bind:value={phone}
						autocomplete="tel"
						disabled={submitting}
						class="border-white/10 bg-black/20 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
					/>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="password" class="text-sm font-medium text-senary">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Min 8 chars"
							bind:value={password}
							required
							autocomplete="new-password"
							minlength={8}
							disabled={submitting}
							class="border-white/10 bg-black/20 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
						/>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword" class="text-sm font-medium text-senary"
							>Confirm Password</Label
						>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Repeat password"
							bind:value={confirmPassword}
							required
							minlength={8}
							autocomplete="new-password"
							disabled={submitting}
							class="border-white/10 bg-black/20 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/20"
						/>
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
					{submitting ? 'Creating Account...' : 'Create Account'}
				</Button>
			</form>

			<div class="mt-8 text-center">
				<p class="text-sm text-secondary/60">
					Already have an account?
					<a
						href="/auth/login"
						class="font-medium text-senary underline-offset-4 transition-colors hover:text-senary/80 hover:underline"
					>
						Sign in here
					</a>
				</p>
			</div>
		</div>
	</div>
</div>
