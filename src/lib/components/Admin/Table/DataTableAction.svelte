<script lang="ts">
	// import { Barber } from './columns.ts';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { ComponentType, SvelteComponent } from 'svelte';

	let {
		data,
		href,
		alertDialog
	}: {
		data?: any;
		href?: { url: string; itemText: string; icon: ComponentType<SvelteComponent> }[];
		alertDialog?: {
			title: string;
			description: string;
			descriptionHighlight?: string;
			buttonText: string;
			icon: ComponentType<SvelteComponent>;
			itemText: string;
			buttonColor: string;
		}[];
	} = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				class="relative size-8 p-0 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
			>
				<span class="sr-only">Open menu</span>
				<EllipsisIcon class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-56 p-0">
		<DropdownMenu.Group>
			<DropdownMenu.Label class="px-2 py-1.5 text-xs font-medium text-gray-500"
				>Actions</DropdownMenu.Label
			>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />

		{#if href}
			{#each href as menuItem}
				<a href={menuItem.url}>
					<DropdownMenu.Item class="m-0 cursor-pointer">
						<svelte:component this={menuItem.icon} class="mr-2 h-4 w-4" />{menuItem.itemText}
					</DropdownMenu.Item>
				</a>
			{/each}
		{/if}

		{#if alertDialog}
			{#each alertDialog as menuItem}
				<AlertDialog.Root>
					<AlertDialog.Trigger>
						{#snippet child({ props })}
							<DropdownMenu.Item
								{...props}
								class="m-0 cursor-pointer"
								onSelect={(e) => e.preventDefault()}
							>
								<svelte:component this={menuItem.icon} class="mr-2 h-4 w-4" />
								{menuItem.itemText}
							</DropdownMenu.Item>
						{/snippet}
					</AlertDialog.Trigger>
					<AlertDialog.Portal>
						<AlertDialog.Overlay />
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>{menuItem.title}</AlertDialog.Title>
								<AlertDialog.Description class="text-black-800 ">
									{#if menuItem.descriptionHighlight}
										<p class="font-medium">
											{menuItem.descriptionHighlight}
										</p>
									{/if}
									{menuItem.description}
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action style="background-color: {menuItem.buttonColor}"
									>{menuItem.buttonText}</AlertDialog.Action
								>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Portal>
				</AlertDialog.Root>
			{/each}
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
	:global(.dropdown-menu-content) {
		padding: 0 !important;
	}
</style>
