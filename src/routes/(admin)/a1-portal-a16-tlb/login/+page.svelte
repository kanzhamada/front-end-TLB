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

<div class="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden selection:bg-senary/30">
	<!-- Background Effects -->
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-senary/5 via-slate-950 to-slate-950"></div>
	<div class="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
	
	<!-- Decorative Orbs -->
	<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-senary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
	<div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

	<Card class="w-full max-w-md shadow-2xl border-white/10 bg-black/40 backdrop-blur-xl text-secondary relative z-10 overflow-hidden">
		<!-- Card Top Highlight -->
		<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-senary/50 to-transparent"></div>
		
		<CardHeader class="space-y-2 text-center pb-8 pt-10">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-inner">
				<img src="/three_lights_barbershop_logo.svg" alt="Logo" class="h-12 w-12 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
			</div>
			<CardTitle class="text-3xl font-light tracking-[0.2em] text-white uppercase">Admin Portal</CardTitle>
			<CardDescription class="text-secondary/50 font-light tracking-wide">
				Secure Access Required
			</CardDescription>
		</CardHeader>
		<CardContent class="pb-10 px-8">
			<AdminLoginForm 
				actionUrl="?/login" 
				formError={form?.message}
			/>
		</CardContent>
	</Card>
	
	<div class="absolute bottom-8 text-center text-xs text-white/20 tracking-widest uppercase">
		&copy; {new Date().getFullYear()} Three Lights Barbershop
	</div>
</div>
