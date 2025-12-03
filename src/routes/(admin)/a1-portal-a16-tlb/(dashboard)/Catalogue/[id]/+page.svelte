<script lang="ts">
	import { page } from '$app/state';
	import { getCatalogueById } from '$lib/api/admin/catalogue';
	import CatalogueForm from '$lib/components/Admin/AdminForm/CatalogueForm.svelte';

	const { id } = page.params;

	const response = getCatalogueById(id);
</script>

<CatalogueForm detailData={response.data} action="view" title="Catalogue Detail" />
