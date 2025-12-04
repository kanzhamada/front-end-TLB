<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import CatalogueForm from '$lib/components/Admin/AdminForm/CatalogueForm.svelte';
	import { getCatalogueById, type Catalogue } from '$lib/api/admin/catalogue.js';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;
	let catalogue = $state<Catalogue | undefined>(undefined);

	onMount(async () => {
		const token = page.data.session?.access_token || '';
		const res = await getCatalogueById(fetch, id, token);
		if (res.success && res.data) {
			catalogue = res.data;
		} else {
			toast.error(res.message || 'Failed to load catalogue details');
		}
	});
</script>

<CatalogueForm
	{data}
	detailData={catalogue}
	action="edit"
	title="Edit Catalogue"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
