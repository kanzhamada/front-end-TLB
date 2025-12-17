<script lang="ts">
	import Cropper from 'svelte-easy-crop';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Loader2, Check, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let {
		imageFile,
		aspect = 16 / 9,
		onCrop,
		onCancel
	} = $props<{
		imageFile: File;
		aspect?: number;
		onCrop: (blob: Blob) => void;
		onCancel: () => void;
	}>();

	let imageSrc = $state<string | null>(null);
	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let croppedAreaPixels = $state<any>(null);
	let loading = $state(true);

	onMount(() => {
		if (imageFile) {
			loading = true;
			imageSrc = URL.createObjectURL(imageFile);
			loading = false;
		}
	});

	function onCropComplete(e: any) {
		console.log('onCropComplete fired. Event object:', e);

		// Check if e is the custom event with detail
		if (e && e.detail && e.detail.pixels) {
			console.log('Found pixels in e.detail');
			croppedAreaPixels = e.detail.pixels;
		}
		// Check if e is the detail object directly (Svelte 5 compat?)
		else if (e && e.pixels) {
			console.log('Found pixels in e directly');
			croppedAreaPixels = e.pixels;
		} else {
			console.warn('Could not find pixels in event object', e);
		}
	}

	async function handleSave() {
		console.log('handleSave clicked');
		console.log('Current state:', { imageSrc: !!imageSrc, croppedAreaPixels });

		if (!imageSrc || !croppedAreaPixels) {
			console.error('Cannot save: Missing imageSrc or croppedAreaPixels');
			return;
		}

		loading = true;
		try {
			console.log('Calling getCroppedImg...');
			const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
			console.log('getCroppedImg result:', croppedBlob);

			if (croppedBlob) {
				console.log('Calling onCrop callback...');
				onCrop(croppedBlob);
				console.log('onCrop callback finished');
			} else {
				console.error('Failed to create blob (result was null)');
			}
		} catch (e) {
			console.error('Error cropping image:', e);
		}
		loading = false;
	}

	async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob | null> {
		const image = new Image();
		image.src = imageSrc;
		image.crossOrigin = 'anonymous';

		await new Promise((resolve, reject) => {
			image.onload = resolve;
			image.onerror = reject;
		});

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) return null;

		// Set canvas size to the cropped size
		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		// Draw the cropped image onto the canvas
		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			0,
			0,
			pixelCrop.width,
			pixelCrop.height
		);

		return new Promise((resolve) => {
			canvas.toBlob(
				(blob) => {
					resolve(blob);
				},
				'image/jpeg',
				0.9
			);
		});
	}
</script>

<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
	<div
		class="relative flex h-full max-h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
	>
		<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
			<h2 class="text-lg font-medium text-secondary">Crop Image</h2>
			<button
				onclick={onCancel}
				class="rounded-full p-1 text-secondary/50 hover:bg-white/10 hover:text-white"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<div class="relative flex-1 bg-black/50">
			{#if loading}
				<div class="absolute inset-0 flex items-center justify-center">
					<Loader2 class="h-8 w-8 animate-spin text-senary" />
				</div>
			{:else if imageSrc}
				<div class="relative h-full w-full">
					<Cropper
						image={imageSrc}
						{crop}
						{zoom}
						{aspect}
						on:cropcomplete={onCropComplete}
						oncropcomplete={onCropComplete}
						on:cropchange={(e) => {
							console.log('cropchange', e.detail);
							crop = e.detail;
						}}
						on:zoomchange={(e) => (zoom = e.detail)}
					/>
				</div>
			{/if}
		</div>

		<div class="border-t border-white/10 bg-white/5 px-6 py-4 space-y-4">
			<div class="flex items-center gap-4">
				<span class="text-xs font-medium text-secondary/70 w-12">Zoom</span>
				<Slider
					value={[zoom]}
					min={1}
					max={3}
					step={0.1}
					onValueChange={(v) => (zoom = v[0])}
					class="flex-1"
				/>
			</div>

			<div class="flex justify-end gap-3 pt-2">
				<Button variant="outline" onclick={onCancel}>Cancel</Button>
				<Button
					class="bg-senary text-primary hover:bg-senary/90"
					onclick={handleSave}
					disabled={loading}
				>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					<Check class="mr-2 h-4 w-4" /> Apply Crop
				</Button>
			</div>
		</div>
	</div>
</div>
