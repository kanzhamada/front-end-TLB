<script lang="ts">
	import { page } from '$app/stores';
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';
</script>

<CustomCursor />

<div
	class="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center"
>
	<div
		class="glass-panel relative flex max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl p-5 p-10"
	>
		<!-- Background Glow Effect -->
		<div class="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-senary/20 blur-3xl"></div>
		<div class="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>

		<h1 class="text-gradient-gold mb-2 text-6xl font-bold tracking-tighter">
			{$page.status}
		</h1>

		<h2 class="mb-6 text-2xl font-medium text-foreground">
			{$page.error?.message || 'Page Not Found'}
		</h2>

		<p class="mb-8 text-muted-foreground">
			The page you are looking for might have been removed, had its name changed, or is temporarily
			unavailable.
		</p>

		<a
			href="/"
			class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-senary/10 hover:shadow-lg hover:shadow-primary/20"
		>
			Go Home
		</a>
	</div>
</div>
