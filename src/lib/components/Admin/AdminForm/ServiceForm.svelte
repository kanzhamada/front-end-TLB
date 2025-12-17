<script lang="ts">
	import SaveButton from '$lib/components/Global/Button/SaveButton.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { type ServiceSchema } from '$lib/zod/schema';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import EditButton from '$lib/components/Global/Button/EditButton.svelte';
	import DeleteButton from '$lib/components/Global/Button/DeleteButton.svelte';
	import CancelButton from '$lib/components/Global/Button/CancelButton.svelte';
	import type { Service } from '$lib/types/adminTypes';
	import { onMount } from 'svelte';

	// Define interfaces for better type safety
	interface ServiceDetail extends Service {}

	interface Props {
		data?: { form?: SuperValidated<any> };
		detailData?: ServiceDetail;
		action: 'create' | 'view' | 'edit';
		title: string;
		success?: boolean;
		message?: string;
	}

	let { data, detailData, action, title, success, message }: Props = $props();

	// Default form data with proper typing
	const defaultFormData: Infer<ServiceSchema> = {
		id: '',
		name: '',
		price: 0,
		description: '',
		attainableCoin: 0
	};

	// Initialize form with better error handling
	const form = superForm(data?.form ?? defaultFormData, {
		onUpdated: ({ form }) => {
			if (form.valid && success) {
				const toastMessage = getSuccessMessage(action);
				toast.success(toastMessage);
				goto('/admin/Service');
			} else if (!form.valid && message) {
				toast.error(message);
			}
		},
		onError: ({ result }) => {
			toast.error('An error occurred while processing your request');
		}
	});

	const { form: formData, enhance, delayed, message: formMessage, submitting } = form;

	// Helper function for toast messages
	function getSuccessMessage(action: string): string {
		switch (action) {
			case 'create':
				return 'Service has been created successfully';
			case 'edit':
				return 'Service has been updated successfully';
			default:
				return 'Operation completed successfully';
		}
	}

	// Extract ID for better readability
	const id = detailData?.id ?? '';
	const isReadonly = action === 'view';
	const isSubmitting = $submitting || $delayed;

	function handleSubmit() {}

	// Initialize form data if detail data exists
	if (detailData) {
		$formData.id = detailData.id ?? '';
		$formData.name = detailData.name;
		$formData.price = detailData.price;
		$formData.description = detailData.description;
		$formData.attainableCoin = detailData.attainableCoin ?? 0;
	}
</script>

<div class="flex-shrink-0 border-b border-gray-100 p-6">
	<div class="mb-8 text-left">
		<h1 class="text-2xl font-bold text-stone-700 sm:text-3xl">{title}</h1>
	</div>

	<SuperDebug data={$formData} />

	<form method="POST" use:enhance class="space-y-8">
		<Form.Field {form} name="id">
			<Form.Control>
				{#snippet children({ props })}
					<Input type="hidden" {...props} bind:value={$formData.id} />
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Name Field -->
		<Form.Field {form} name="name">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Service Name
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<Input
							required
							{...props}
							bind:value={$formData.name}
							readonly={isReadonly}
							disabled={isSubmitting}
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter service name..."
							autocomplete="name"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.name?.length || 0}/50 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please enter the name of the service.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Price Field -->
		<Form.Field {form} name="price">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Price
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<!-- <div class="relative"> -->
						<!-- <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center">
								<span
									class="flex h-full items-center justify-center rounded-l-md border-r border-gray-200 bg-[#2E6057] px-3  text-sm font-medium text-white"
								>
									Rp
								</span>
							</div> -->

						<Input
							{...props}
							bind:value={$formData.price}
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="100.000"
							required
							readonly={isReadonly}
							disabled={isSubmitting}
							type="number"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							Max Price: Rp 9.999.999
							<!-- </div> -->
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please enter the price of the service.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Description Field -->
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700">
							Description
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<Textarea
							required
							{...props}
							readonly={isReadonly}
							disabled={isSubmitting}
							bind:value={$formData.description}
							class="min-h-[100px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Brief description about the service..."
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.description?.length || 0}/255 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please enter a brief description about the service.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Attainable Coin Field -->
		<Form.Field {form} name="attainableCoin">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Attainable Coin
						</Form.Label>
						<!-- <div class="relative"> -->
						<!-- <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center">
								<span
									class="flex h-full items-center justify-center rounded-l-md border-r border-gray-200 bg-[#2E6057] px-3  text-sm font-medium text-white"
								>
									Rp
								</span>
							</div> -->

						<Input
							{...props}
							bind:value={$formData.attainableCoin}
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="e.g. 312"
							required
							readonly={isReadonly}
							disabled={isSubmitting}
							type="number"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							Max Attainable Coin: 9.999.999
							<!-- </div> -->
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				(Optional) Enter the attainable coin of the service.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3 border-t border-gray-100 pt-6">
			<CancelButton href="/a1-portal-a16-tlb/Service" disabled={isSubmitting} />

			{#if action === 'view'}
				<DeleteButton
					description="This action cannot be undone. This will permanently delete the service's information from the system."
					descriptionHighlight="Service Name: {detailData?.name}"
					disabled={isSubmitting}
				/>
				<EditButton {id} entityName="Service" disabled={isSubmitting} />
			{:else}
				<SaveButton disabled={isSubmitting} loading={isSubmitting} on:click={handleSubmit} />
			{/if}
		</div>
	</form>
</div>
