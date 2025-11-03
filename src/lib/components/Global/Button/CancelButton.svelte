<script lang="ts">
	import Button from './../../ui/button/button.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { goto } from '$app/navigation';

	// Define explicit props and rest props
	let { ...restProps }: { [key: string]: any } = $props();
</script>

<!-- <AlertDialog.Root>
	<AlertDialog.Trigger> -->
<Button
	{...restProps}
	style="--primary: rgba(0, 0, 0, 0.15)"
	class="group border-black-900 relative overflow-hidden rounded-lg border-2 bg-white px-8 py-3 font-semibold text-black"
>
	<span class="relative z-10 flex items-center space-x-2">Cancel</span>
</Button>
<!-- </AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you sure want to leave?</AlertDialog.Title>
				<AlertDialog.Description class="text-black-800 ">
					You have unsaved changes. Are you sure you want to leave without saving?
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Stay</AlertDialog.Cancel>
				<AlertDialog.Action>Yes, Leave</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root> -->
