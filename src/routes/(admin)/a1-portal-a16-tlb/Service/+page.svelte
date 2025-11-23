<!-- routes/reservations/+page.svelte -->
<script lang="ts">
	import DataTable from '$lib/components/Admin/Table/DataTable.svelte';
	import { serviceColumns as columns } from '$lib/columns/admin/serviceColumns';
	import { getService } from '$lib/api/admin/service';

	let response = getService();
</script>

<DataTable
	tableData={response.services}
	tableColumns={columns}
	entityName="service"
	searchConfig={{
		enabled: true,
		column: 'combined',
		placeholder: 'Service Name or Description'
	}}
	enableAddNew={true}
/>
