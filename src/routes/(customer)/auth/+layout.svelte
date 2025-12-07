<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen bg-slate-950">
	<main class="">
		{@render children()}
	</main>
</div>
