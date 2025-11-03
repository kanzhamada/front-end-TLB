<script lang="ts">
	import SaveButton from '$lib/components/Global/Button/SaveButton.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { type BarberSchema } from '$lib/zod/schema';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import EditButton from '$lib/components/Global/Button/EditButton.svelte';
	import DeleteButton from '$lib/components/Global/Button/DeleteButton.svelte';
	import CancelButton from '$lib/components/Global/Button/CancelButton.svelte';
	import type { Barber } from '$lib/types/adminTypes';

	// Define interfaces for better type safety
	interface BarberDetail extends Barber {}

	interface Props {
		data?: { form?: SuperValidated<Infer<BarberSchema>> };
		detailData?: BarberDetail;
		action: 'create' | 'view' | 'edit';
		title: string;
		success?: boolean;
		message?: string;
	}

	let { data, detailData, action, title, success, message }: Props = $props();

	// Default form data with proper typing
	const defaultFormData: Infer<BarberSchema> = {
		id: '',
		name: '',
		phoneNumber: '',
		description: '',
		skills: '',
		experience: ''
	};

	// Initialize form with better error handling
	const form = superForm(data?.form ?? defaultFormData, {
		onUpdated: ({ form }) => {
			if (form.valid && success) {
				const toastMessage = getSuccessMessage(action);
				toast.success(toastMessage);
				goto('/admin/Barber');
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
				return 'Barber has been created successfully';
			case 'edit':
				return 'Barber has been updated successfully';
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
		$formData.phoneNumber = detailData.phoneNumber;
		$formData.description = detailData.description ?? '';
		$formData.skills = detailData.skills ?? '';
		$formData.experience = detailData.experience ?? '';
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
							Name
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<Input
							required
							{...props}
							bind:value={$formData.name}
							readonly={isReadonly}
							disabled={isSubmitting}
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter barber's full name"
							autocomplete="name"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.name?.length || 0}/50 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				The barber's public display name.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Phone Number Field -->
		<Form.Field {form} name="phoneNumber">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Phone Number
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<Input
							{...props}
							bind:value={$formData.phoneNumber}
							type="tel"
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter phone number (e.g., 081234567890)"
							required
							readonly={isReadonly}
							disabled={isSubmitting}
							autocomplete="tel"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.phoneNumber?.length || 0}/10-14 digits
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				The barber's contact number for appointments.
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
						</Form.Label>
						<Textarea
							{...props}
							readonly={isReadonly}
							disabled={isSubmitting}
							bind:value={$formData.description}
							class="min-h-[100px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Brief description about the barber..."
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.description?.length || 0}/255 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				A brief description about the barber's background.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Skills Field -->
		<Form.Field {form} name="skills">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700">Skills</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.skills}
							readonly={isReadonly}
							disabled={isSubmitting}
							class="min-h-[100px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="List key skills (e.g., Hair cutting, Beard styling, Hair coloring...)"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.skills?.length || 0}/255 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				The barber's main skills and areas of expertise.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Experience Field -->
		<Form.Field {form} name="experience">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700">
							Experience
						</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.experience}
							readonly={isReadonly}
							disabled={isSubmitting}
							class="min-h-[120px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Describe professional experience and achievements..."
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.experience?.length || 0}/255 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				The barber's professional background, years of experience, and notable achievements.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3 border-t border-gray-100 pt-6">
			<CancelButton href="/admin/Barber" disabled={isSubmitting} />

			{#if action === 'view'}
				<DeleteButton
					description="This action cannot be undone. This will permanently delete the barber's information from the system."
					descriptionHighlight="Barber Name: {detailData?.name}"
					disabled={isSubmitting}
				/>
				<EditButton {id} entityName="Barber" disabled={isSubmitting} />
			{:else}
				<SaveButton disabled={isSubmitting} loading={isSubmitting} on:click={handleSubmit} />
			{/if}
		</div>
	</form>
</div>
