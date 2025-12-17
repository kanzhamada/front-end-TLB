<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import VoucherForm from '$lib/components/Admin/AdminForm/VoucherForm.svelte';
	import { getVoucherById, type Voucher } from '$lib/api/admin/voucher.js';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;
	let voucher = $state<Voucher | undefined>(undefined);

	onMount(async () => {
		const token = page.data.session?.access_token || '';
		const res = await getVoucherById(fetch, id, token);
		if (res.success && res.data) {
			voucher = res.data;
		} else {
			toast.error(res.message || 'Failed to load voucher details');
		}
	});
</script>

<VoucherForm
	{data}
	detailData={voucher}
	action="edit"
	title="Edit Voucher"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
