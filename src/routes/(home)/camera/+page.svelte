<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let videoEl: HTMLVideoElement | null = null;
	let canvasEl: HTMLCanvasElement | null = null;
	let stream: MediaStream | null = null;
	let photoUrl = '';

	async function startCamera() {
		if (!browser) return;

		try {
			stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoEl) videoEl.srcObject = stream;
		} catch (err) {
			alert('Unable to access camera');
			console.error(err);
		}
	}

	function takePhoto() {
		if (!videoEl || !canvasEl) return;

		const width = videoEl.videoWidth;
		const height = videoEl.videoHeight;

		canvasEl.width = width;
		canvasEl.height = height;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(videoEl, 0, 0, width, height);

		// Convert canvas to data URL
		photoUrl = canvasEl.toDataURL('image/png');
	}

	function downloadPhoto() {
		if (!photoUrl) return;
		const link = document.createElement('a');
		link.href = photoUrl;
		link.download = `photo-${Date.now()}.png`;
		link.click();
	}

	onMount(() => {
		startCamera();
	});
</script>

<div class="flex flex-col items-center gap-4">
	<video bind:this={videoEl} autoplay playsinline class="w-full max-w-sm rounded-md"></video>

	<div class="flex gap-2">
		<button on:click={takePhoto} class="rounded bg-blue-600 px-4 py-2 text-white"
			>📸 Take Photo</button
		>
		<button
			on:click={downloadPhoto}
			class="rounded bg-green-600 px-4 py-2 text-white"
			disabled={!photoUrl}
		>
			⬇️ Download
		</button>
	</div>

	<!-- Hidden canvas to draw capture frame -->
	<canvas bind:this={canvasEl} class="hidden"></canvas>

	{#if photoUrl}
		<p class="mt-4">Captured Photo:</p>
		<img src={photoUrl} alt="Captured" class="max-w-sm rounded-md shadow" />
	{/if}
</div>
