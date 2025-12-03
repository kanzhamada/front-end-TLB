<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center text-white">
	<h1 class="mb-4 text-6xl font-bold text-senary">{page.status}</h1>
	<p class="mb-8 text-xl text-secondary">{page.error?.message || 'Something went wrong'}</p>
	<a
		href="/"
		class="rounded-lg bg-senary px-6 py-3 font-medium text-primary transition-colors hover:bg-senary/90"
	>
		Go Home
	</a>
</div>
