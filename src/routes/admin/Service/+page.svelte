<!-- routes/reservations/+page.svelte -->
<script lang="ts">
	import DataTable from '$lib/components/Admin/Table/DataTable.svelte';
import { serviceColumns as columns } from '$lib/columns/admin/serviceColumns';
	import { getService } from '$lib/api/admin/service';

	let response = getService();
</script>

<div class="px-6 py-6">
	<div class="mx-auto max-w-7xl">
		<div class="rounded-xl border border-gray-200/60 bg-white shadow-sm">
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
		</div>
	</div>
</div>
