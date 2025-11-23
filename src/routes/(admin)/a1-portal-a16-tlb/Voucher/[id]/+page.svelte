<script lang="ts">
	import { page } from '$app/state';
	import { getVoucherById } from '$lib/api/admin/voucher';
	import VoucherForm from '$lib/components/Admin/AdminForm/VoucherForm.svelte';

	const { id } = page.params;

	const response = getVoucherById(id);
</script>

<VoucherForm detailData={response.data} action="view" title="Voucher Detail" />
