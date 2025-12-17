<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	let {
		description,
		descriptionHighlight,
		...restProps
	}: { description: string; descriptionHighlight?: string; [key: string]: any } = $props();
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		<Button
			{...restProps}
			style="--primary: oklch(81% 0.117 11.638) "
			class="group border-black-900 relative cursor-pointer overflow-hidden rounded-lg border-2 border-rose-500 bg-rose-200 px-8 py-3 font-semibold text-rose-500 "
		>
			<span class="relative z-10 flex items-center space-x-2"> Delete </span>
		</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Portal>
		<AlertDialog.Overlay />
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you sure want to delete this?</AlertDialog.Title>
				<AlertDialog.Description class="text-black-800 ">
					<p class="font-medium">{descriptionHighlight}</p>

					{description}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action style="background-color: #fa003f;">Delete</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
