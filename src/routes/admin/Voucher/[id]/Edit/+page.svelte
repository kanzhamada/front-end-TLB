<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import VoucherForm from '$lib/components/Admin/AdminForm/VoucherForm.svelte';
	import { getVoucherById } from '$lib/api/admin/voucher.js';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;

	const response = getVoucherById(id);
</script>

<VoucherForm
	{data}
	detailData={response.data}
	action="edit"
	title="Edit Voucher"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
