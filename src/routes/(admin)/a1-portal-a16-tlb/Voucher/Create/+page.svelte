<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import VoucherForm from '$lib/components/Admin/AdminForm/VoucherForm.svelte';
	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<VoucherForm
	{data}
	title="Create New Voucher"
	action="create"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
