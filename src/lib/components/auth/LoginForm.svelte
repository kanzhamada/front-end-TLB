<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let {
		actionUrl,
		showRegister = false,
		submitting = false,
		formError = null,
		enhanceHandler
	}: {
		actionUrl: string;
		showRegister?: boolean;
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
		<Label for="email" class="text-sm font-semibold text-[#032B24]">Email</Label>
		<Input
			id="email"
			name="email"
			type="email"
			placeholder="nama@email.com"
			bind:value={email}
			required
			autocomplete="email"
			disabled={submitting}
			class="bg-[#f5f1ea] text-[#032B24]"
		/>
	</div>

	<div class="space-y-2">
		<Label for="password" class="text-sm font-semibold text-[#032B24]">Kata Sandi</Label>
		<Input
			id="password"
			name="password"
			type="password"
			placeholder="Masukkan kata sandi"
			bind:value={password}
			required
			autocomplete="current-password"
			disabled={submitting}
			class="bg-[#f5f1ea] text-[#032B24]"
		/>
	</div>

	{#if formError}
		<p class="text-sm font-medium text-red-600">{formError}</p>
	{/if}

	<Button
		type="submit"
		class="w-full bg-[#fcb13f] text-[#032B24] hover:bg-[#fcb13f]/90"
		disabled={submitting}
	>
		{submitting ? 'Memproses...' : 'Masuk'}
	</Button>
</form>

{#if showRegister}
	<div class="mt-6 flex flex-col items-start gap-2 px-0 py-0">
		<p class="text-sm text-[#032B24]/70">
			Belum punya akun?
			<a class="text-[#fcb13f] hover:underline" href="/auth/register">Daftar sekarang</a>
		</p>
	</div>
{/if}
