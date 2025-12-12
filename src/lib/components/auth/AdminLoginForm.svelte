<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2 } from 'lucide-svelte';

	let {
		actionUrl,
		submitting = false,
		formError = null,
		enhanceHandler
	}: {
		actionUrl: string;
		submitting?: boolean;
		formError?: string | null;
		enhanceHandler?: SubmitFunction;
	} = $props();

	let email = $state('');
	let password = $state('');
</script>

<form
	method="POST"
	action={actionUrl}
	class="space-y-6"
	use:enhance={enhanceHandler ||
		(() => {
			return async ({ update }) => {
				await update();
			};
		})}
>
	<div class="space-y-2">
		<Label for="email" class="text-sm font-medium text-senary">Email Address</Label>
		<Input
			id="email"
			name="email"
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
			name="password"
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
