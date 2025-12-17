<script lang="ts">
	import { page } from '$app/state';
	import { getServiceById } from '$lib/api/admin/service';
	import ServiceForm from '$lib/components/Admin/AdminForm/ServiceForm.svelte';

	const { id } = page.params;

	const response = getServiceById(id);
</script>

<ServiceForm detailData={response.data} action="view" title="Service Detail" />
