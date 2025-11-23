<!-- routes/reservations/+page.svelte -->
<script lang="ts">
	import DataTable from '$lib/components/Admin/Table/DataTable.svelte';
	import { voucherColumns as columns } from '$lib/columns/admin/voucherColumns';
	import { getVoucher } from '$lib/api/admin/voucher';

	let response = getVoucher();

	const serviceOptions = [
		{
			value: '',
			label: 'All Services'
		},
		{
			value: 'Premium Haircut',
			label: 'Premium Haircut'
		},
		{
			value: 'Classic Haircut',
			label: 'Classic Haircut'
		},
		{
			value: 'Shave Bread',
			label: 'Shave Bread'
		}
	];
</script>

<DataTable
	tableData={response.vouchers}
	tableColumns={columns}
	entityName="voucher"
	searchConfig={{ enabled: true, column: 'title', placeholder: 'Title' }}
	filterConfig={{
		enabled: true,
		options: serviceOptions,
		defaultColumn: 'service'
	}}
	enableAddNew={true}
/>
