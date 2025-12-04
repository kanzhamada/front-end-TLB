<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import BarberForm from '$lib/components/Admin/AdminForm/BarberForm.svelte';
	import { page } from '$app/state';
	import { getBarberById, type Barber } from '$lib/api/admin/barber.js';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;
	let barber = $state<Barber | undefined>(undefined);

	onMount(async () => {
		const token = page.data.session?.access_token || '';
		const res = await getBarberById(fetch, id, token);
		if (res.success && res.data) {
			barber = res.data;
		} else {
			toast.error(res.message || 'Failed to load barber details');
		}
	});
</script>

<BarberForm
	{data}
	detailData={barber}
	action="edit"
	title="Edit Barber"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
