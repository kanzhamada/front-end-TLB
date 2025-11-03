<script lang="ts">
	import Button from './../../ui/button/button.svelte';

	let { id, entityName, ...restProps }: { id: string; entityName: string; [key: string]: any } =
		$props();
</script>

<Button
	{...restProps}
	href="/admin/{entityName}/{id}/Edit"
	style="--primary: oklch(82.8% 0.111 230.318)"
	class="group border-black-900 relative overflow-hidden rounded-lg border-2 border-sky-500 bg-sky-200 px-8 py-3 font-semibold text-sky-500 "
>
	<span class="relative z-10 flex items-center space-x-2"> Edit </span>
</Button>
