<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import CatalogueForm from '$lib/components/Admin/AdminForm/CatalogueForm.svelte';
	import { getCatalogueById } from '$lib/api/admin/catalogue.js';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;

	const response = getCatalogueById(id);
</script>

<CatalogueForm
	{data}
	detailData={response.data}
	action="edit"
	title="Edit Catalogue"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
