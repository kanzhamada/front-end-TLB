<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import CatalogueForm from '$lib/components/Admin/AdminForm/CatalogueForm.svelte';
	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<CatalogueForm
	{data}
	title="Create New Catalogue"
	action="create"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
