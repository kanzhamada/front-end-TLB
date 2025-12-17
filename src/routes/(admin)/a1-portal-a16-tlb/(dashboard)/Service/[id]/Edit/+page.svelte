<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import ServiceForm from '$lib/components/Admin/AdminForm/ServiceForm.svelte';
	import { getServiceById, type Service } from '$lib/api/admin/service.js';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;
	let service = $state<Service | undefined>(undefined);

	onMount(async () => {
		const token = page.data.session?.access_token || '';
		const res = await getServiceById(fetch, id, token);
		if (res.success && res.data) {
			service = res.data;
		} else {
			toast.error(res.message || 'Failed to load service details');
		}
	});
</script>

<ServiceForm
	{data}
	detailData={service}
	action="edit"
	title="Edit Service"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
