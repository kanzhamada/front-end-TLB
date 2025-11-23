<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	// Assuming data structure based on the image and previous context
	let { data } = $props();

	let date = data.dateTime.split(' ')[0];
	let time = data.dateTime.split(' ')[1];
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

		{#if data.status === 'waiting-approve'}
			<AlertDialog.Root>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<DropdownMenu.Item
							{...props}
							class="m-0 cursor-pointer"
							onSelect={(e) => e.preventDefault()}
						>
							<CheckIcon class="mr-2 h-4 w-4" />
							Accept Reservation
						</DropdownMenu.Item>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Portal>
					<AlertDialog.Overlay />
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will accept the reservation and trigger the next
								steps.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action>Accept</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		{/if}

		{#if data.status === 'waiting-approve' || data.status === 'on-going'}
			<AlertDialog.Root>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<DropdownMenu.Item
							{...props}
							class="m-0 cursor-pointer"
							onSelect={(e) => e.preventDefault()}
						>
							<XIcon class="mr-2 h-4 w-4" />
							Reject Reservation
						</DropdownMenu.Item>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Portal>
					<AlertDialog.Overlay />
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will reject the reservation and notify the
								customer.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action style="background-color: #fa003f;">Reject</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
			<DropdownMenu.Separator />
		{/if}

		<a href="/a1-portal-a16-tlb/Reservation/chat/{data.id}">
			<DropdownMenu.Item class="m-0 cursor-pointer">
				<MessageCircleIcon class="mr-2 h-4 w-4" />
				Chat with Customer
			</DropdownMenu.Item>
		</a>

		<AlertDialog.Root>
			<AlertDialog.Trigger>
				{#snippet child({ props })}
					<DropdownMenu.Item
						{...props}
						class="m-0 cursor-pointer"
						onSelect={(e) => e.preventDefault()}
					>
						<EyeIcon class="mr-2 h-4 w-4" />
						View Details
					</DropdownMenu.Item>
				{/snippet}
			</AlertDialog.Trigger>

			<AlertDialog.Portal>
				<AlertDialog.Overlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

				<AlertDialog.Content
					class="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-0 shadow-lg"
				>
					<AlertDialog.Header class="border-b p-6">
						<AlertDialog.Title class="text-2xl font-bold text-gray-900">
							{data.invoice}
						</AlertDialog.Title>
					</AlertDialog.Header>

					<AlertDialog.Description class="p-6">
						<!-- Appointment Summary Section -->
						<div class="mb-6">
							<h2 class="mb-4 text-xl font-bold text-gray-900">Reservation Summary</h2>
							<div
								class="flex-col space-y-3 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-500 p-4 text-white"
							>
								<div class="flex justify-between">
									<span>Customer Name:</span>
									<span class="font-medium">{data.customer}</span>
								</div>
								<div class="flex justify-between">
									<span>Date:</span>
									<span class="font-medium">{date}</span>
								</div>
								<div class="flex justify-between">
									<span>Time:</span>
									<span class="font-medium">{time}</span>
								</div>
								<div class="flex justify-between">
									<span>Barber:</span>
									<span class="font-medium">Wildan Hermawanti</span>
								</div>
								<div class="flex justify-between">
									<span>Service:</span>
									<span class="font-medium">Shaving</span>
								</div>
							</div>
						</div>

						<!-- Coupon Section -->
						<div class="mb-6">
							<h2 class="mb-3 text-xl font-bold text-gray-900">Applied Voucher</h2>
							<div class="rounded-lg border-2 border-[#2E6057] p-3 font-bold text-[#2E6057]">
								Voucher - 20% Discount
							</div>
						</div>

						<!-- Pricing Breakdown -->
						<div>
							<div class="space-y-2">
								<div class="flex justify-between text-black">
									<span>Premium Haircut</span>
									<span>Rp 40.000</span>
								</div>
								<div class="flex justify-between text-[#2E6057]">
									<span>Voucher - 20% Discount</span>
									<span>-Rp 8.000</span>
								</div>
								<div class="flex justify-between text-rose-500">
									<span>Admin Fee</span>
									<span>+Rp 5.000</span>
								</div>
								<div class="mt-4 flex justify-between border-t pt-3 font-bold text-black">
									<span>Total Amount</span>
									<span>Rp 33.000</span>
								</div>
							</div>
						</div>
					</AlertDialog.Description>

					<AlertDialog.Footer class="flex justify-end border-t p-6">
						{#if data.status === 'waiting-approve' || data.status === 'on-going'}
							<AlertDialog.Action style="background-color: #fa003f;">Reject</AlertDialog.Action>
							{#if data.status === 'waiting-approve'}
								<AlertDialog.Action>Accept</AlertDialog.Action>
							{/if}
						{/if}
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
	/* Override default padding and enable resizing */
	:global(.alert-dialog-content) {
		padding: 0 !important;
		resize: vertical !important;
		max-height: 80vh !important;
		overflow-y: auto !important;
	}

	/* Ensure the content respects the max-height and allows scrolling */
	:global(.alert-dialog-description) {
		max-height: calc(80vh - 100px); /* Adjust based on header/footer height */
		overflow-y: auto;
	}
</style>
