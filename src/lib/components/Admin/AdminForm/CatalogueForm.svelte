<script lang="ts">
	import SaveButton from '$lib/components/Global/Button/SaveButton.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import Button from './../../ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { type CatalogueSchema } from '$lib/zod/schema';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { onDestroy } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import EditButton from '$lib/components/Global/Button/EditButton.svelte';
	import DeleteButton from '$lib/components/Global/Button/DeleteButton.svelte';
	import CancelButton from '$lib/components/Global/Button/CancelButton.svelte';
	import type { Catalogue } from '$lib/types/adminTypes';
	import { Progress } from '$lib/components/ui/progress';

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	import {
		displaySize,
		FileDropZone,
		MEGABYTE,
		type FileDropZoneProps
	} from '$lib/components/ui/file-drop-zone';
	import XIcon from '@lucide/svelte/icons/x';

	// Define interfaces for better type safety
	interface CatalogueDetail extends Catalogue {}

	interface Props {
		data?: { form?: SuperValidated<Infer<CatalogueSchema>> };
		detailData?: CatalogueDetail;
		action: 'create' | 'view' | 'edit';
		title: string;
		success?: boolean;
		message?: string;
	}

	let { data, detailData, action, title, success, message }: Props = $props();

	// Default form data with proper typing
	const defaultFormData: Infer<CatalogueSchema> = {
		id: '',
		name: '',
		type: 'Long',
		description: '',
		image: ''
	};

	// Initialize form with better error handling
	const form = superForm(data?.form ?? defaultFormData, {
		onUpdated: ({ form }) => {
			if (form.valid && success) {
				const toastMessage = getSuccessMessage(action);
				toast.success(toastMessage);
				goto('/admin/Catalogue');
			} else if (!form.valid && message) {
				toast.error(message);
			}
		},
		onError: ({ result }) => {
			toast.error('An error occurred while processing your request');
		}
	});

	const { form: formData, enhance, delayed, message: formMessage, submitting } = form;

	// File upload related state
	type UploadedFile = {
		name: string;
		type: string;
		size: number;
		uploadedAt: number;
		url: Promise<string>;
	};

	let files: UploadedFile[] = $state([]);
	let date = new SvelteDate();
	let fileInput: HTMLInputElement;
	let imageFieldRef: HTMLElement;

	// File upload handlers
	const onUpload: FileDropZoneProps['onUpload'] = async (uploadedFiles) => {
		await Promise.allSettled(uploadedFiles.map((file) => uploadFile(file)));
	};

	const onFileRejected: FileDropZoneProps['onFileRejected'] = async ({ reason, file }) => {
		toast.error(`${file.name} failed to upload!`, { description: reason });
	};

	const uploadFile = async (file: File) => {
		// Don't upload duplicate files
		if (files.find((f) => f.name === file.name)) {
			toast.error(`${file.name} is already uploaded`);
			return;
		}

		const urlPromise = new Promise<string>((resolve, reject) => {
			// Simulate upload with some fake loading time
			sleep(1000)
				.then(() => {
					const url = URL.createObjectURL(file);
					resolve(url);
				})
				.catch(reject);
		});

		const uploadedFile: UploadedFile = {
			name: file.name,
			type: file.type,
			size: file.size,
			uploadedAt: Date.now(),
			url: urlPromise
		};

		files = [...files, uploadedFile];

		try {
			await urlPromise;
			// Update form data with uploaded file info
			updateFormImageData();
		} catch (error) {
			toast.error(`Failed to upload ${file.name}`);
			// Remove failed file from list
			files = files.filter((f) => f !== uploadedFile);
		}
	};

	const removeFile = async (index: number) => {
		const file = files[index];
		if (file) {
			try {
				const url = await file.url;
				URL.revokeObjectURL(url);
			} catch (error) {
				console.error('Error revoking URL:', error);
			}
			files = files.filter((_, i) => i !== index);
			updateFormImageData();
		}
	};

	const updateFormImageData = () => {
		// Update the form data with file names or URLs
		if (files.length > 0) {
			$formData.image = files.map((f) => f.name).join(',');
		} else {
			$formData.image = '';
		}
	};

	// Progress calculation effect
	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 100);
		return () => {
			clearInterval(interval);
		};
	});

	// Cleanup on destroy
	onDestroy(async () => {
		for (const file of files) {
			try {
				const url = await file.url;
				URL.revokeObjectURL(url);
			} catch (error) {
				console.error('Error cleaning up file URL:', error);
			}
		}
	});

	// Helper function for toast messages
	function getSuccessMessage(action: string): string {
		switch (action) {
			case 'create':
				return 'Catalogue has been created successfully';
			case 'edit':
				return 'Catalogue has been updated successfully';
			default:
				return 'Operation completed successfully';
		}
	}

	// Extract ID for better readability
	const id = detailData?.id ?? '';
	const isReadonly = action === 'view';
	const isSubmitting = $submitting || $delayed;

	// Initialize form data if detail data exists
	if (detailData) {
		$formData.id = detailData.id ?? '';
		$formData.name = detailData.name;
		$formData.type = detailData.type ?? defaultFormData.type;
		$formData.description = detailData.description ?? '';
		$formData.image = detailData.image ?? '';

		// If there's existing image data, you might want to populate the files array
		// This depends on how your existing data is structured
	}

	// Handle form messages
	$effect(() => {
		if ($formMessage) {
			toast.success($formMessage.text, {
				description: 'Your images were uploaded successfully.'
			});
		}
	});

	// Parse existing images for display - FIX FOR DUPLICATE KEY ERROR
	const existingImages = $derived(() =>
		detailData?.image
			? typeof detailData.image === 'string'
				? detailData.image.split(',').filter((img) => img.trim() !== '')
				: Array.isArray(detailData.image)
					? detailData.image
					: [detailData.image]
			: []
	);
</script>

<div class="flex-shrink-0 border-b border-gray-100 p-6">
	<div class="mb-8 text-left">
		<h1 class="text-2xl font-bold text-stone-700 sm:text-3xl">{title}</h1>
	</div>

	<SuperDebug data={$formData} />

	<form method="POST" use:enhance class="space-y-8" enctype="multipart/form-data">
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
							placeholder="Enter the name of the catalogue"
							autocomplete="name"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.name?.length || 0}/50 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">The catalogue's name.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Type Field -->
		<Form.Field {form} name="type">
			<Form.Legend class="mb-2 flex items-center text-sm font-semibold text-gray-700">
				Type
				<span class="ml-1 text-red-500" aria-label="Required">*</span>
			</Form.Legend>

			<RadioGroup.Root
				bind:value={$formData.type}
				class="grid grid-cols-3 gap-4"
				name="type"
				required
			>
				{#each ['Long', 'Medium', 'Short'] as option}
					<div class="flex items-center space-x-2">
						<Form.Control>
							{#snippet children({ props })}
								<RadioGroup.Item
									value={option}
									{...props}
									disabled={isReadonly}
									class="hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
								/>
								<Form.Label class="font-normal">{option}</Form.Label>
							{/snippet}
						</Form.Control>
					</div>
				{/each}
			</RadioGroup.Root>

			<Form.Description class="mt-2 text-sm text-gray-500">
				Please select the type of the catalogue.
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
							{...props}
							required
							readonly={isReadonly}
							disabled={isSubmitting}
							bind:value={$formData.description}
							class="min-h-[100px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter the description of the catalogue"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.description?.length || 0}/255 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				The catalogue's description.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Image Upload Field -->
		<Form.Field {form} name="image">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group" bind:this={imageFieldRef}>
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700">
							Images
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>

						<FileDropZone
							{onUpload}
							{onFileRejected}
							maxFileSize={5 * MEGABYTE}
							accept="image/*"
							maxFiles={5}
							fileCount={files.length}
							disabled={isReadonly || isSubmitting}
							class={files.length === 0 ? 'border-red-200 bg-red-50' : ''}
						/>

						<!-- Hidden input for form submission -->
						<input
							bind:this={fileInput}
							type="hidden"
							name={props.name}
							bind:value={$formData.image}
							aria-describedby="image-validation"
						/>

						<!-- Custom validation message -->
						{#if files.length === 0 && existingImages().length === 0}
							<div id="image-validation" class="mt-2 text-sm text-red-600">
								Please upload at least one image
							</div>
						{/if}

						<!-- File Preview List -->
						{#if files.length > 0}
							<div class="mt-4 space-y-3">
								{#each files as file, i (file.name)}
									<div
										class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
									>
										<div class="flex items-center gap-3">
											{#await file.url then src}
												<div class="relative h-12 w-12 overflow-hidden rounded-lg">
													<img {src} alt={file.name} class="h-full w-full object-cover" />
												</div>
											{:catch error}
												<div
													class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100"
												>
													<span class="text-xs text-gray-500">Error</span>
												</div>
											{/await}
											<div class="flex flex-col">
												<span class="text-sm font-medium text-gray-900">{file.name}</span>
												<span class="text-xs text-gray-500">{displaySize(file.size)}</span>
											</div>
										</div>

										<div class="flex items-center gap-2">
											{#await file.url}
												<Progress
													class="h-2 w-24"
													value={Math.min(((date.getTime() - file.uploadedAt) / 1000) * 100, 100)}
													max={100}
												/>
											{:then url}
												{#if !isReadonly}
													<Button
														variant="outline"
														size="sm"
														onclick={() => removeFile(i)}
														disabled={isSubmitting}
													>
														<XIcon class="h-4 w-4" />
													</Button>
												{/if}
											{/await}
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Existing Images Display - FIXED -->
						{#if existingImages().length > 0}
							<div class="mt-4 space-y-3">
								{#each existingImages() as imageUrl, i (imageUrl)}
									<div
										class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
									>
										<div class="flex items-center gap-3">
											<div class="relative h-12 w-12 overflow-hidden rounded-lg">
												<img
													src={imageUrl}
													alt="Existing image {i + 1}"
													class="h-full w-full object-cover"
												/>
											</div>

											<div class="flex flex-col">
												<span class="text-sm font-medium text-gray-900">
													{typeof imageUrl === 'string'
														? `Image ${i + 1}`
														: `Existing Image ${i + 1}`}
												</span>
												<span class="text-xs text-gray-500">Existing image</span>
											</div>
										</div>

										<div class="flex items-center gap-2">
											{#if !isReadonly}
												<Button
													variant="outline"
													size="sm"
													onclick={() => {
														// Create a new array without the removed image
														const updatedImages = [...existingImages()];
														updatedImages.splice(i, 1);
														// Update the form data
														$formData.image = updatedImages.join(',');
														removeFile(i);
													}}
													disabled={isSubmitting}
												>
													<XIcon class="h-4 w-4" />
												</Button>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please upload the images of the catalogue. You can upload up to 5 images, each up to 5MB.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3 border-t border-gray-100 pt-6">
			<CancelButton href="/a1-portal-a16-tlb/Catalogue" disabled={isSubmitting} />

			{#if action === 'view'}
				<DeleteButton
					description="This action cannot be undone. This will permanently delete the catalogue's information from the system."
					descriptionHighlight="Catalogue Name: {detailData?.name}"
					disabled={isSubmitting}
				/>
				<EditButton {id} entityName="Catalogue" disabled={isSubmitting} />
			{:else}
				<SaveButton
					disabled={isSubmitting || (files.length === 0 && existingImages.length === 0)}
					loading={isSubmitting}
				/>
			{/if}
		</div>
	</form>
</div>
