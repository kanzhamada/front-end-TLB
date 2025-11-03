<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import ServiceForm from '$lib/components/Admin/AdminForm/ServiceForm.svelte';
	import { getServiceById } from '$lib/api/admin/service.js';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;

	const response = getServiceById(id);
</script>

<ServiceForm
	{data}
	detailData={response.data}
	action="edit"
	title="Edit Service"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
