<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import OperationalTimeForm from '$lib/components/Admin/AdminForm/OperationalTimeForm.svelte';
	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<OperationalTimeForm
	{data}
	title="Create New Operational Time"
	action="create"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
