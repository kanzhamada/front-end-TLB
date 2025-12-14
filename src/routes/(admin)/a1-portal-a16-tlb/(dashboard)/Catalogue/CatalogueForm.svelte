<script lang="ts">
	import { createCatalogue, editCatalogue, type Catalogue } from '$lib/api/admin/catalogue';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { X, Upload, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import * as Select from '$lib/components/ui/select';
	import * as Carousel from '$lib/components/ui/carousel';
	import ImageCropper from '$lib/components/ui/ImageCropper.svelte';

	let { mode, catalogue, token, onClose, onUpdate } = $props<{
		mode: 'add' | 'edit' | 'view';
		catalogue: Catalogue | null;
		token: string;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let loading = $state(false);
	let name = $state(catalogue?.name || '');
	let type = $state(catalogue?.type || 'medium');

	let description = $state(catalogue?.description || '');
	let hairTypes = $state(catalogue?.hairTypes || '');
	let faceShapes = $state(catalogue?.faceShapes || '');
	let skinTones = $state(catalogue?.skinTones || '');

	// Image State
	type ImageItem = {
		id: string;
		file?: File;
		blob?: Blob;
		preview: string;
		isExisting?: boolean; // For edit mode
	};
	let images = $state<ImageItem[]>([]);

	// Cropper State
	let showCropper = $state(false);
	let croppingFile = $state<File | null>(null);

	// Update state when catalogue changes (e.g. switching from add to edit)
	$effect(() => {
		if (catalogue) {
			name = catalogue.name;
			type = catalogue.type.toLowerCase(); // Ensure lowercase match

			description = catalogue.description;
			hairTypes = catalogue.hairTypes || '';
			faceShapes = catalogue.faceShapes || '';
			skinTones = catalogue.skinTones || '';

			// Load existing images
			if (catalogue.catalogueImages && catalogue.catalogueImages.length > 0) {
				images = catalogue.catalogueImages.map((img) => ({
					id: img.imageID || crypto.randomUUID(),
					preview: img.imageUrl,
					isExisting: true
				}));
			} else if (catalogue.image) {
				images = [
					{
						id: crypto.randomUUID(),
						preview: catalogue.image,
						isExisting: true
					}
				];
			} else {
				images = [];
			}
		} else {
			name = '';
			type = 'medium';

			description = '';
			hairTypes = '';
			faceShapes = '';
			skinTones = '';
			images = [];
		}
	});

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];

			// Validation
			const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
			if (!validTypes.includes(file.type)) {
				toast.error('Invalid file type. Please upload JPG or PNG.');
				input.value = ''; // Reset input
				return;
			}

			if (file.size > 6 * 1024 * 1024) {
				// 6MB
				toast.error('File size exceeds 6MB limit.');
				input.value = ''; // Reset input
				return;
			}

			croppingFile = file;
			showCropper = true;
			input.value = ''; // Reset input so same file can be selected again if needed
		}
	}

	function handleCrop(blob: Blob) {
		const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
		const newItem: ImageItem = {
			id: crypto.randomUUID(),
			file: file,
			blob: blob,
			preview: URL.createObjectURL(blob)
		};

		images = [...images, newItem];
		showCropper = false;
		croppingFile = null;
	}

	function removeImage(id: string) {
		images = images.filter((img) => img.id !== id);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		const formData = new FormData();
		formData.append('name', name);

		formData.append('type', type);
		formData.append('description', description);
		formData.append('hairTypes', hairTypes);
		formData.append('faceShapes', faceShapes);
		formData.append('skinTones', skinTones);

		// Append new files
		const existingImages = images
			.filter(img => img.isExisting)
			.map(img => img.preview);

		formData.append('existingImages', JSON.stringify(existingImages));

		let hasFile = false;
		images.forEach((img) => {
			if (!img.isExisting && img.file) {
				formData.append('file', img.file);
				hasFile = true;
			}
		});

		// // FIX: Some backends panic if 'file' is missing in multipart/form-data update
		if (!hasFile) {
			// Append an empty file to ensure the key exists
			formData.append('file', new File([], 'empty.txt', { type: 'text/plain' }));
		}

		// Debug: Log FormData entries
		console.log('Submitting FormData:');
		for (const pair of formData.entries()) {
			console.log(pair[0], pair[1]);
		}

		let res;
		if (mode === 'add') {
			res = await createCatalogue(fetch, formData, token);
		} else if (mode === 'edit' && catalogue) {
			res = await editCatalogue(fetch, catalogue.id, formData, token);
		}

		if (res?.success) {
			toast.success(`Catalogue ${mode === 'add' ? 'created' : 'updated'} successfully`);
			onUpdate();
			onClose();
		} else {
			toast.error(res.error.message || res?.message || `Failed to ${mode} catalogue`);
		}
		loading = false;
	}

	const typeOptions = [
		{ value: 'long', label: 'Long' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'short', label: 'Short' }
	];

	const hairTypeOptions = [
		{ value: 'Lurus', label: 'Lurus' },
		{ value: 'Bergelombang', label: 'Bergelombang' },
		{ value: 'Keriting', label: 'Keriting' }
	];

	const faceShapeOptions = [
		{ value: 'Oval', label: 'Oval' },
		{ value: 'Bulat', label: 'Bulat' },
		{ value: 'Kotak', label: 'Kotak' }
	];

	const skinToneOptions = [
		{ value: 'Sawo Matang', label: 'Sawo Matang' },
		{ value: 'Coklat Tua', label: 'Coklat Tua' },
		{ value: 'Putih', label: 'Putih' }
	];
</script>

{#if showCropper && croppingFile}
	<ImageCropper
		imageFile={croppingFile}
		aspect={16 / 9}
		onCrop={handleCrop}
		onCancel={() => {
			showCropper = false;
			croppingFile = null;
		}}
	/>
{/if}

<div
	class="fixed inset-0 z-50 flex h-full w-full cursor-default items-center justify-center border-0 bg-black/80 p-4 backdrop-blur-md"
	transition:fade={{ duration: 200 }}
	onclick={onClose}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<div
		class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl"
		onclick={(e) => e.stopPropagation()}
		role="document"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		in:scale={{ start: 0.95, duration: 200, easing: quintOut }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
			<div>
				<h2 class="text-2xl font-bold tracking-tight text-secondary">
					{#if mode === 'add'}
						Add New <span class="text-senary">Catalogue</span>
					{:else if mode === 'edit'}
						Edit <span class="text-senary">Catalogue</span>
					{:else}
						Catalogue <span class="text-senary">Details</span>
					{/if}
				</h2>
				<p class="mt-1 text-xs font-light tracking-widest text-secondary/60 uppercase">
					{#if mode === 'add'}
						Create a new style entry
					{:else if mode === 'edit'}
						Update existing style information
					{:else}
						View style specifications
					{/if}
				</p>
			</div>
			<button
				onclick={onClose}
				class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<div class="no-scrollbar max-h-[75vh] overflow-y-auto px-8 py-8">
			{#if mode === 'view' && catalogue}
				<!-- View Mode -->
				<div class="space-y-8">
					{#if catalogue.catalogueImages && catalogue.catalogueImages.length > 0}
						<Carousel.Root class="w-full">
							<Carousel.Content>
								{#each catalogue.catalogueImages as img}
									<Carousel.Item>
										<div
											class="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner"
										>
											<img
												src={img.imageUrl}
												alt={catalogue.name}
												class="h-full w-full object-cover"
											/>
										</div>
									</Carousel.Item>
								{/each}
							</Carousel.Content>
							<Carousel.Previous
								class="left-2 border-white/10 bg-black/50 text-white hover:border-senary hover:bg-senary hover:text-primary"
							/>
							<Carousel.Next
								class="right-2 border-white/10 bg-black/50 text-white hover:border-senary hover:bg-senary hover:text-primary"
							/>
						</Carousel.Root>
					{:else if catalogue.image}
						<div
							class="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner"
						>
							<img src={catalogue.image} alt={catalogue.name} class="h-full w-full object-cover" />
						</div>
					{:else}
						<div
							class="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-secondary/30"
						>
							<ImageIcon class="h-16 w-16 opacity-50" />
						</div>
					{/if}

					<div class="grid gap-6 sm:grid-cols-2">
						<div class="rounded-2xl border border-white/5 bg-white/5 p-5">
							<Label
								class="mb-2 block text-xs font-bold tracking-widest text-secondary/50 uppercase"
								>Name</Label
							>
							<p class="text-xl font-medium text-secondary">{catalogue.name}</p>
						</div>
						<div class="rounded-2xl border border-white/5 bg-white/5 p-5">
							<Label
								class="mb-2 block text-xs font-bold tracking-widest text-secondary/50 uppercase"
								>Type</Label
							>
							<p class="text-xl font-medium text-senary capitalize">{catalogue.type}</p>
						</div>
					</div>
					<div class="grid gap-6 sm:grid-cols-3">
						<div class="rounded-2xl border border-white/5 bg-white/5 p-5">
							<Label
								class="mb-2 block text-xs font-bold tracking-widest text-secondary/50 uppercase"
								>Hair Types</Label
							>
							<p class="text-base font-medium text-secondary">{catalogue.hairTypes || '-'}</p>
						</div>
						<div class="rounded-2xl border border-white/5 bg-white/5 p-5">
							<Label
								class="mb-2 block text-xs font-bold tracking-widest text-secondary/50 uppercase"
								>Face Shapes</Label
							>
							<p class="text-base font-medium text-secondary">{catalogue.faceShapes || '-'}</p>
						</div>
						<div class="rounded-2xl border border-white/5 bg-white/5 p-5">
							<Label
								class="mb-2 block text-xs font-bold tracking-widest text-secondary/50 uppercase"
								>Skin Tones</Label
							>
							<p class="text-base font-medium text-secondary">{catalogue.skinTones || '-'}</p>
						</div>
					</div>
					<div class="rounded-2xl border border-white/5 bg-white/5 p-6">
						<Label class="mb-2 block text-xs font-bold tracking-widest text-secondary/50 uppercase"
							>Description</Label
						>
						<p class="leading-relaxed text-secondary">{catalogue.description}</p>
					</div>
				</div>
			{:else}
				<!-- Add/Edit Mode -->
				<form onsubmit={handleSubmit} class="space-y-6">
					<div class="space-y-2">
						<Label for="name" class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
							>Name</Label
						>
						<Input
							id="name"
							bind:value={name}
							placeholder="e.g. Classic Fade"
							class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="type" class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
							>Type</Label
						>
						<Select.Root type="single" bind:value={type}>
							<Select.Trigger
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary focus:border-senary/50 focus:ring-senary/20"
							>
								{typeOptions.find((o) => o.value === type)?.label || type}
							</Select.Trigger>
							<Select.Content class="border-white/10 bg-slate-900 text-secondary">
								{#each typeOptions as option}
									<Select.Item
										value={option.value}
										label={option.label}
										class="cursor-pointer focus:bg-white/10 focus:text-senary"
									>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="space-y-2">
						<Label
							for="description"
							class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
							>Description</Label
						>
						<Textarea
							id="description"
							bind:value={description}
							placeholder="Describe the style details..."
							class="min-h-[120px] rounded-xl border-white/10 bg-white/5 p-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
							required
						/>
					</div>

					<div class="grid gap-6 sm:grid-cols-3">
						<div class="space-y-2">
							<Label
								for="hairTypes"
								class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
								>Hair Types</Label
							>
							<Select.Root type="single" bind:value={hairTypes} required>
								<Select.Trigger
									class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary focus:border-senary/50 focus:ring-senary/20"
								>
									{hairTypes || 'Select Hair Type'}
								</Select.Trigger>
								<Select.Content class="border-white/10 bg-slate-900 text-secondary">
									{#each hairTypeOptions as option}
										<Select.Item
											value={option.value}
											label={option.label}
											class="cursor-pointer focus:bg-white/10 focus:text-senary"
										>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-2">
							<Label
								for="faceShapes"
								class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
								>Face Shapes</Label
							>
							<Select.Root type="single" bind:value={faceShapes} required>
								<Select.Trigger
									class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary focus:border-senary/50 focus:ring-senary/20"
								>
									{faceShapes || 'Select Face Shape'}
								</Select.Trigger>
								<Select.Content class="border-white/10 bg-slate-900 text-secondary">
									{#each faceShapeOptions as option}
										<Select.Item
											value={option.value}
											label={option.label}
											class="cursor-pointer focus:bg-white/10 focus:text-senary"
										>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-2">
							<Label
								for="skinTones"
								class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
								>Skin Tones</Label
							>
							<Select.Root type="single" bind:value={skinTones} required>
								<Select.Trigger
									class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary focus:border-senary/50 focus:ring-senary/20"
								>
									{skinTones || 'Select Skin Tone'}
								</Select.Trigger>
								<Select.Content class="border-white/10 bg-slate-900 text-secondary">
									{#each skinToneOptions as option}
										<Select.Item
										
											value={option.value}
											label={option.label}
											class="cursor-pointer focus:bg-white/10 focus:text-senary"
										>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="space-y-3">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
							>Images</Label
						>

						<!-- Image List -->
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
							{#each images as img (img.id)}
								<div
									class="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg transition-all hover:border-senary/30"
								>
									<img
										src={img.preview}
										alt="Preview"
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
									/>
									<div
										class="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
									></div>
									<button
										type="button"
										onclick={() => removeImage(img.id)}
										class="absolute top-2 right-2 rounded-full bg-red-500/20 p-2 text-red-400 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-red-500 hover:text-white"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							{/each}

							<!-- Add Button -->
							<label
								class="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-secondary/40 transition-all hover:border-senary/50 hover:bg-white/10 hover:text-senary hover:shadow-[0_0_15px_-5px_rgba(212,175,55,0.1)]"
							>
								<div
									class="mb-2 rounded-full bg-white/5 p-3 transition-colors group-hover:bg-senary/10"
								>
									<Plus class="h-6 w-6" />
								</div>
								<span class="text-xs font-medium tracking-wide uppercase">Add Image</span>
								<input type="file" accept="image/*" onchange={handleFileChange} class="hidden" />
							</label>
						</div>
						<p class="text-[10px] tracking-wider text-secondary/40 uppercase">
							Upload multiple images (JPG/PNG, max 6MB each).
						</p>
					</div>

					<div class="flex justify-end gap-3 border-t border-white/10 pt-6">
						<Button
							type="button"
							variant="outline"
							onclick={onClose}
							disabled={loading}
							class="border-white/10 bg-transparent text-secondary hover:bg-white/5 hover:text-white"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							class="min-w-[120px] bg-senary font-bold tracking-wide text-primary hover:bg-senary/90"
							disabled={loading}
						>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							{mode === 'add' ? 'Create' : 'Save Changes'}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>
