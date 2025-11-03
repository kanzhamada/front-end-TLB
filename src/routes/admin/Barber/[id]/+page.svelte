<script lang="ts">
	import BarberForm from '$lib/components/Admin/AdminForm/BarberForm.svelte';
	import { page } from '$app/state';
	import { getBarberById } from '$lib/api/admin/barber.js';

	const { id } = page.params;

	const response = getBarberById(id);
</script>

<BarberForm detailData={response.data} action="view" title="Barber Detail" />
