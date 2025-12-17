<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-svelte';

	let { 
		open = $bindable(false),
		title,
		description,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'default',
		loading = false,
		onConfirm
	} = $props<{
		open: boolean;
		title: string;
		description: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'destructive' | 'success';
		loading?: boolean;
		onConfirm: () => void | Promise<void>;
	}>();

	async function handleConfirm() {
		if (onConfirm) {
			await onConfirm();
		}
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content class="border border-white/10 bg-black/90 text-secondary backdrop-blur-md sm:max-w-[425px]">
		<div class="flex flex-col items-center text-center">
			<div class="mb-4 rounded-full p-4 
				{variant === 'destructive' ? 'bg-red-500/10 text-red-500' : 
				 variant === 'success' ? 'bg-green-500/10 text-green-500' : 
				 'bg-senary/10 text-senary'}">
				{#if variant === 'destructive'}
					<AlertTriangle class="h-8 w-8" />
				{:else if variant === 'success'}
					<CheckCircle class="h-8 w-8" />
				{:else}
					<Info class="h-8 w-8" />
				{/if}
			</div>

			<AlertDialog.Header>
				<AlertDialog.Title class="text-xl font-bold tracking-tight text-white mb-2">
					{title}
				</AlertDialog.Title>
				<AlertDialog.Description class="text-secondary/70">
					{description}
				</AlertDialog.Description>
			</AlertDialog.Header>
		</div>

		<AlertDialog.Footer class="mt-6 gap-2 sm:gap-0">
			<AlertDialog.Cancel 
				class="border-white/10 bg-transparent text-secondary hover:bg-white/10 hover:text-white"
				disabled={loading}
			>
				{cancelText}
			</AlertDialog.Cancel>
			<Button
				onclick={handleConfirm}
				disabled={loading}
				class="{variant === 'destructive' ? 'bg-red-500 hover:bg-red-600' : 
					   variant === 'success' ? 'bg-green-500 hover:bg-green-600' : 
					   'bg-senary hover:bg-senary/90 text-primary font-bold'} min-w-[100px]"
			>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				{confirmText}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
