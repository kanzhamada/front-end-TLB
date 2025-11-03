<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import BarberForm from '$lib/components/Admin/AdminForm/BarberForm.svelte';
	import { page } from '$app/state';
	import { getBarberById } from '$lib/api/admin/barber.js';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const { id } = page.params;

	const response = getBarberById(id);
	console.log(id);
	console.log(response);
</script>

<BarberForm
	{data}
	detailData={response.data}
	action="edit"
	title="Edit Barber"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
