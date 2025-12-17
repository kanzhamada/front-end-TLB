<script lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';

	let { open = $bindable(false), onConfirm } = $props();
</script>

<AlertDialog bind:open>
	<AlertDialogContent class="border border-white/10 bg-primary text-secondary">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-white">Keluar</AlertDialogTitle>
			<AlertDialogDescription class="text-secondary/70">
				Apakah anda yakin ingin keluar?
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel
				class="border-white/10 bg-transparent text-secondary hover:bg-white/10 hover:text-white"
				onclick={() => (open = false)}
			>
				Batal
			</AlertDialogCancel>
			<AlertDialogAction class="bg-senary text-primary hover:bg-senary/90" onclick={onConfirm}>
				Keluar
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
