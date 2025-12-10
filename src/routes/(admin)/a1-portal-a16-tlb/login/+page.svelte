<script lang="ts">
	import AdminLoginForm from '$lib/components/auth/AdminLoginForm.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	let { form } = $props();
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
				>Admin Portal</CardTitle
			>
			<CardDescription class="font-light tracking-wide text-secondary/50">
				Secure Access Required
			</CardDescription>
		</CardHeader>
		<CardContent class="px-8 pb-10">
			<AdminLoginForm actionUrl="?/login" formError={form?.message} />
		</CardContent>
	</Card>

	<div class="absolute bottom-8 text-center text-xs tracking-widest text-white/20 uppercase">
		&copy; {new Date().getFullYear()} Three Lights Barbershop
	</div>
</div>
