<script lang="ts">
	import * as Form from '$lib/components/ui/form';

	let { ...restProps }: { [key: string]: any } = $props();
</script>

<Form.Button
	{...restProps}
	class="group border-black-900 relative cursor-pointer overflow-hidden rounded-lg px-8 py-3 font-semibold"
>
	<span class="relative z-10 flex items-center space-x-2"> Save </span>
</Form.Button>
