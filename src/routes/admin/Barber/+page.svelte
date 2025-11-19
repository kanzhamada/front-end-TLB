<script lang="ts">
	import { getBarber } from '$lib/api/admin/barber';
	import DataTable from '$lib/components/Admin/Table/DataTable.svelte';
	import { barberColumns as columns } from '$lib/columns/admin/barberColumns';

	let response = getBarber();
</script>

<DataTable
	tableData={response.barbers}
	tableColumns={columns}
	entityName="barber"
	searchConfig={{ enabled: true, column: 'name', placeholder: 'Barber Name' }}
	enableAddNew={true}
/>
