<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import ServiceForm from '$lib/components/Admin/AdminForm/ServiceForm.svelte';
	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<ServiceForm
	{data}
	title="Create New Service"
	action="create"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>


