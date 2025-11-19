<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import BarberForm from '$lib/components/Admin/AdminForm/BarberForm.svelte';
	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<BarberForm
	{data}
	title="Create New Barber"
	action="create"
	success={form?.success ?? false}
	message={form?.message ?? ''}
/>
