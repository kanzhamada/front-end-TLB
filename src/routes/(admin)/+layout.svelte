<script lang="ts">
	let { children } = $props();
	import { Toaster } from '$lib/components/ui/sonner/index.js';
</script>

<Toaster position="bottom-left" richColors />
{@render children?.()}
