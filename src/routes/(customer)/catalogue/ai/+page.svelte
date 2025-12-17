<script lang="ts">
	import {
		X,
		Star,
		Upload,
		ImageIcon,
		AlertCircle,
		Sparkles,
		Gem,
		Camera,
		Aperture,
		User,
		Palette,
		Fingerprint,
		ScanFace,
		Scissors,
		Sun
	} from 'lucide-svelte';

	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getCatalogue, type Catalogue } from '$lib/api/shared/api';
	import * as Accordion from '$lib/components/ui/accordion';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel
	} from '@tanstack/table-core';
	import { catalogueColumns } from '$lib/columns/admin/catalogueColumns';
	import { createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import CatalogueCard from '$lib/components/ui/CatalogueCard.svelte';
	import ServiceDetailModal from '$lib/components/ui/ServiceDetailModal.svelte';
	import FilterGroup from '$lib/components/ui/FilterGroup.svelte';
	import ReservationSheet from '$lib/components/User/Reservation/ReservationSheet.svelte';
	import { onMount } from 'svelte';

	let avatar = $state(null);
	let isDragging = $state(false);
	let fileInput;
	let accordionValue = $state(['contoh-foto']); // Auto open on load
	let scanning = $state(false);
	let result = $state<any>(null);
	let showResults = $state(false);

	const ANALYSIS_OPTIONS = {
		faceShape: ['Oval', 'Bulat', 'Kotak'],
		hairType: ['Lurus', 'Bergelombang', 'Keriting'],
		skinTone: ['Putih', 'Sawo Matang', 'Coklat Tua']
	};

	let analysisData = $state({
		faceShape: '-',
		hairType: '-',
		skinTone: '-',
		faceAccuracy: '-',
		hairAccuracy: '-',
		skinAccuracy: '-'
	});

	// Camera State
	let showCamera = $state(false);
	let videoEl = $state<HTMLVideoElement | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let stream = $state<MediaStream | null>(null);

	const onFileSelected = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Check file size (6MB max)
		if (file.size > 6 * 1024 * 1024) {
			alert('Ukuran file terlalu besar. Maksimal 6 MB.');
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			avatar = event.target?.result;
			// Close accordion when photo is uploaded
			accordionValue = [];
			showResults = false;
			result = null;
		};
		reader.readAsDataURL(file);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file && file.type.startsWith('image/')) {
			const fakeEvent = { target: { files: [file] } };
			onFileSelected(fakeEvent);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		isDragging = true;
	};

	const handleDragLeave = () => {
		isDragging = false;
	};

	// Camera Functions
	async function startCamera() {
		if (!browser) return;
		showCamera = true;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ video: true });
			// Wait for DOM update to bind videoEl
			setTimeout(() => {
				if (videoEl) videoEl.srcObject = stream;
			}, 100);
		} catch (err) {
			alert('Unable to access camera. Please allow camera permissions.');
			console.error(err);
			showCamera = false;
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		showCamera = false;
	}

	function takePhoto() {
		if (!videoEl || !canvasEl) return;

		const width = videoEl.videoWidth;
		const height = videoEl.videoHeight;

		canvasEl.width = width;
		canvasEl.height = height;

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		// Draw video frame to canvas
		ctx.drawImage(videoEl, 0, 0, width, height);

		// Convert canvas to data URL
		avatar = canvasEl.toDataURL('image/png');

		stopCamera();
		accordionValue = []; // Close accordion
		showResults = false;
		result = null;
	}

	onDestroy(() => {
		stopCamera();
	});

	// Get catalogue data
	let allCatalogues = $state<Catalogue[]>([]);
	let catalogues = $state<Catalogue[]>([]);
	let showReservationSheet = $state(false);
	let selectedCatalogueNote = $state('');

	onMount(async () => {
		const response = await getCatalogue(fetch);
		if (response.success && response.data) {
			allCatalogues = response.data;
			catalogues = response.data;
		}
	});

	// Table state for pagination
	let tablePagination = $state({ pageIndex: 0, pageSize: 8 });
	let tableColumnFilters = $state<ColumnFiltersState>([]);
	let selectedFilterValue = $state<string>('');

	const dataCatalogue = createSvelteTable({
		get data() {
			return catalogues;
		},
		columns: catalogueColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			tablePagination = typeof updater === 'function' ? updater(tablePagination) : updater;
		},
		onColumnFiltersChange: (updater) => {
			tableColumnFilters = typeof updater === 'function' ? updater(tableColumnFilters) : updater;
		},
		state: {
			get pagination() {
				return tablePagination;
			},
			get columnFilters() {
				return tableColumnFilters;
			}
		}
	});

	const serviceOptions = [
		{
			value: '',
			label: 'Semua'
		},
		{
			value: 'Short',
			label: 'Short'
		},
		{
			value: 'Medium',
			label: 'Medium'
		},
		{
			value: 'Long',
			label: 'Long'
		}
	];

	// Responsive handling
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isDesktopView = $derived({ current: windowWidth >= 768 });

	if (typeof window !== 'undefined') {
		window.addEventListener('resize', () => {
			windowWidth = window.innerWidth;
		});
	}

	async function handleScan() {
		if (!avatar) return;
		scanning = true;
		showResults = false;
		result = null;

		try {
			// Convert base64/data URL to Blob
			const res = await fetch(avatar);
			const blob = await res.blob();

			const formData = new FormData();
			formData.append('image', blob);

			const response = await fetch('/api/ai/analyze', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (data.success) {
				result = data.data; // Array of { label: string, score: number }
				showResults = true;

				// Use the specific Result from the AI Model (Custom JSON)
				if (result) {
					analysisData = {
						faceShape: result.wajah || 'Unknown',
						hairType: result.rambut || 'Unknown',
						skinTone: result.skin || 'Unknown',
						faceAccuracy: result.c_wajah || '-',
						hairAccuracy: result.c_rambut || '-',
						skinAccuracy: result.c_skin || '-'
					};

					// Map specific 'katalog' recommendations if present
					if (result.katalog && Array.isArray(result.katalog)) {
						catalogues = result.katalog.map((item: any, index: number) => ({
							catalogueID: `ai-rec-${index}`,
							name: item.nama_gaya,
							type: item.tipe,
							description: item.deskripsi,
							catalogueImages: [{ imageUrl: item.gambar_url }]
						}));
					} else {
						// Fallback if no catalogue in response
						catalogues = allCatalogues.slice(0, 3);
					}
				}
			} else {
				alert('Failed to analyze image: ' + (data.error || 'Unknown error'));
			}
		} catch (e) {
			console.error(e);
			alert('An error occurred during analysis.');
		} finally {
			scanning = false;
		}
	}

	const itemsPerPage = $derived(8);
	const siblingCount = $derived(isDesktopView.current ? 1 : 0);
	const visibleRowCount = $derived(dataCatalogue.getFilteredRowModel().rows.length);
	let currentPageIndex = $derived(dataCatalogue.getState().pagination.pageIndex + 1);

	// State
	let selectedFilter = $state('Semua');
	let selectedService = $state<Catalogue | null>(null);

	function handleBook(catalogue: Catalogue) {
		selectedCatalogueNote = catalogue.name;
		showReservationSheet = true;
	}
</script>

<svelte:head>
	<title>Katalog - AI | Three Lights Barbershop</title>
</svelte:head>

<!-- Luxury Theme Wrapper -->
<div class="min-h-screen w-full text-secondary selection:bg-senary/30">
	<!-- Gradient Overlay for readability -->
	<div
		class="pointer-events-none fixed inset-0 -z-5 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
	></div>

	<div class="relative z-10 container mx-auto px-4 py-24">
		<!-- Header -->
		<div class="mb-16 text-center" in:fade={{ duration: 1000 }}>
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-senary/30 bg-primary/40 px-4 py-1.5 shadow-[0_0_15px_-5px_rgba(212,175,55,0.3)] backdrop-blur-md"
			>
				<Gem class="h-3.5 w-3.5 text-senary" />
				<span class="text-[10px] font-bold tracking-[0.2em] text-senary uppercase"
					>TLB AI Consultant</span
				>
			</div>
			<h2
				class="mb-4 font-serif text-5xl leading-tight font-medium tracking-tight text-secondary drop-shadow-xl md:text-7xl"
			>
				<span class="text-gradient-gold">Konsultan</span> Gaya AI
			</h2>
			<p class="mx-auto max-w-xl text-lg font-light text-secondary/80">
				Yuk, upload fotomu atau pakai kamera, biar AI canggih
				kami pilihin gaya rambut premium yang pas banget buat kamu!
			</p>
		</div>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Left Side - Upload Section -->
			<div class="lg:col-span-4" in:fly={{ x: -50, duration: 1000, delay: 200, easing: quintOut }}>
				<!-- Dropzone Card -->
				<div
					class="glass-panel glass-panel-hover group relative overflow-hidden rounded-[2rem] p-1"
				>
					<div class="relative rounded-[1.8rem] bg-white/5 p-8">
						<h3 class="mb-6 flex items-center gap-3 font-serif text-xl text-secondary">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-senary/10 ring-1 ring-senary/30"
							>
								<Sparkles class="h-4 w-4 text-senary" />
							</div>
							Unggah Potret
						</h3>

						{#if showCamera}
							<!-- Camera View -->
							<div
								class="relative mb-8 flex h-[28rem] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-senary/30 bg-black/40"
							>
								<video bind:this={videoEl} autoplay playsinline class="h-full w-full object-cover">
									<track kind="captions" />
								</video>

								<!-- Camera Controls -->
								<div class="absolute bottom-6 flex gap-4">
									<button
										onclick={takePhoto}
										class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-lg transition-transform hover:scale-110 active:scale-95"
									>
										<Aperture class="h-6 w-6 text-white" />
									</button>
									<button
										onclick={stopCamera}
										class="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md transition-colors hover:bg-white/20"
									>
										<X class="h-6 w-6 text-white" />
									</button>
								</div>
							</div>
						{:else}
							<!-- Drag & Drop View -->
							<button
								class="relative mb-6 flex h-[24rem] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/5 transition-all duration-500 hover:border-senary/40 hover:bg-senary/5"
								class:border-senary={isDragging}
								class:bg-senary_5={isDragging}
								ondragover={handleDragOver}
								ondragleave={handleDragLeave}
								ondrop={handleDrop}
								onclick={() => fileInput?.click()}
							>
								{#if avatar}
									<img
										src={avatar}
										alt="Uploaded preview"
										class="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
									/>
									<div
										class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-500 hover:opacity-100"
									>
										<div class="text-center">
											<div
												class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
											>
												<Upload class="h-5 w-5 text-white" />
											</div>
											<span class="text-sm font-medium tracking-wide text-white uppercase"
												>Ganti Foto</span
											>
										</div>
									</div>
								{:else}
									<div class="flex flex-col items-center gap-6 px-6 text-center">
										<div
											class="rounded-full bg-gradient-to-br from-white/10 to-transparent p-6 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110"
										>
											<ImageIcon class="h-10 w-10 text-senary/80" />
										</div>
										<div>
											<p class="mb-2 text-lg font-medium text-secondary">Seret & lepas potret</p>
											<p class="text-xs tracking-wider text-secondary/60 uppercase">
												atau klik untuk menelusuri
											</p>
										</div>
									</div>
								{/if}
							</button>

							<!-- Camera Button -->
							<button
								onclick={startCamera}
								class="mb-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold tracking-widest text-secondary uppercase transition-all hover:bg-white/10 hover:text-senary"
							>
								<Camera class="h-4 w-4" />
								<span>Gunakan Kamera</span>
							</button>
						{/if}

						<!-- Hidden file input -->
						<input
							type="file"
							accept="image/jpeg,image/png,image/jpg"
							style="display: none;"
							bind:this={fileInput}
							onchange={(e) => onFileSelected(e)}
						/>

						<!-- Hidden Canvas -->
						<canvas bind:this={canvasEl} class="hidden"></canvas>

						<!-- Photo Requirements -->
						<div class="mb-8 space-y-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/5">
							<div class="flex items-start gap-3 text-xs text-secondary/80">
								<div
									class="mt-1.5 h-1 w-1 rounded-full bg-senary shadow-[0_0_8px_rgba(212,175,55,0.8)]"
								></div>
								<span class="leading-relaxed">Resolusi tinggi (JPG, PNG) hingga 6MB</span>
							</div>
							<div class="flex items-start gap-3 text-xs text-secondary/80">
								<div
									class="mt-1.5 h-1 w-1 rounded-full bg-senary shadow-[0_0_8px_rgba(212,175,55,0.8)]"
								></div>
								<span class="leading-relaxed">Pastikan wajah terlihat jelas dan cukup cahaya</span>
							</div>
						</div>

						<!-- Submit Button -->
						<button
							class="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary px-6 py-4 text-sm font-bold tracking-widest text-primary uppercase shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] transition-all duration-500 hover:bg-white hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary disabled:hover:shadow-none"
							disabled={!avatar}
							onclick={() => {
								// Submit logic here
								console.log('Submitting photo...');
								handleScan();
							}}
						>
							<Upload
								class="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
							/>
							<span class="relative">Analisis Gaya</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Right Side - Results Section -->
			<div class="lg:col-span-8" in:fly={{ x: 50, duration: 1000, delay: 400, easing: quintOut }}>
				<div class="h-full rounded-[2rem] border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
					<div class="mb-8 flex items-center justify-between">
						<h3 class="font-serif text-2xl text-secondary">Rekomendasi Gaya</h3>
						<div class="ml-6 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
					</div>

					<!-- Examples Accordion -->
					<Accordion.Root type="multiple" bind:value={accordionValue} class="mb-10 w-full">
						<Accordion.Item
							value="contoh-foto"
							class="overflow-hidden rounded-xl border border-white/10 bg-white/5"
						>
							<Accordion.Trigger
								class="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-secondary/80 transition-all hover:bg-white/5 hover:text-secondary hover:no-underline data-[state=open]:bg-white/5 data-[state=open]:text-secondary"
							>
								<span class="text-sm font-medium tracking-wide uppercase">Lihat Panduan</span>
							</Accordion.Trigger>
							<Accordion.Content class="w-full border-t border-white/5 bg-white/5 px-6 py-8">
								<div
									class="mb-8 flex items-start gap-4 rounded-lg border border-senary/20 bg-senary/5 p-5"
								>
									<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-senary" />
									<p class="text-sm leading-relaxed text-secondary/80">
										AI kami menganalisis struktur dan fitur wajah. Foto berkualitas tinggi
										memastikan akurasi 90-100% dalam rekomendasi.
									</p>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-6">
									<!-- Good Example 1 -->
									<div class="group relative overflow-hidden rounded-lg border border-senary/30">
										<img
											src="/ai-example/good-1.svg"
											alt="Good example"
											class="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
										/>
										<div
											class="absolute right-0 bottom-0 left-0 bg-senary/90 py-1.5 text-center text-[10px] font-bold tracking-widest text-primary uppercase"
										>
											Bagus
										</div>
									</div>
									<!-- Good Example 2 -->
									<div class="group relative overflow-hidden rounded-lg border border-senary/30">
										<img
											src="/ai-example/good-2.svg"
											alt="Good example"
											class="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
										/>
										<div
											class="absolute right-0 bottom-0 left-0 bg-senary/90 py-1.5 text-center text-[10px] font-bold tracking-widest text-primary uppercase"
										>
											Bagus
										</div>
									</div>
									<!-- Bad Example 1 -->
									<div
										class="group relative overflow-hidden rounded-lg border border-red-500/30 opacity-60 transition-opacity hover:opacity-100"
									>
										<img
											src="/ai-example/bad-1.svg"
											alt="Bad example"
											class="h-48 w-full object-cover grayscale transition duration-500 group-hover:scale-110 group-hover:grayscale-0"
										/>
										<div
											class="absolute right-0 bottom-0 left-0 bg-red-900/90 py-1.5 text-center text-[10px] font-bold tracking-widest text-white uppercase"
										>
											Buruk
										</div>
									</div>
									<!-- Bad Example 2 -->
									<div
										class="group relative overflow-hidden rounded-lg border border-red-500/30 opacity-60 transition-opacity hover:opacity-100"
									>
										<img
											src="/ai-example/bad-2.svg"
											alt="Bad example"
											class="h-48 w-full object-cover grayscale transition duration-500 group-hover:scale-110 group-hover:grayscale-0"
										/>
										<div
											class="absolute right-0 bottom-0 left-0 bg-red-900/90 py-1.5 text-center text-[10px] font-bold tracking-widest text-white uppercase"
										>
											Buruk
										</div>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>

					{#if !avatar}
						<!-- Empty State -->
						<div class="flex flex-col items-center justify-center py-24 text-center">
							<div class="relative mb-8">
								<div
									class="absolute inset-0 animate-pulse rounded-full bg-senary/20 blur-2xl"
								></div>
								<div
									class="relative rounded-full border border-white/10 bg-white/5 p-8 backdrop-blur-md"
								>
									<Star class="h-12 w-12 text-senary" />
								</div>
							</div>
							<h4 class="mb-3 font-serif text-2xl text-secondary">Siap untuk Berubah?</h4>
							<p class="max-w-xs text-sm leading-relaxed text-secondary/70">
								Unggah foto Anda untuk membuka koleksi gaya rambut yang dikurasi sesuai dengan fitur
								unik Anda.
							</p>
						</div>
					{:else if scanning}
						<div class="flex flex-col items-center justify-center py-24">
							<div class="relative mb-8 h-24 w-24">
								<div class="absolute inset-0 animate-ping rounded-full bg-senary/20"></div>
								<div
									class="relative flex h-full w-full items-center justify-center rounded-full border border-senary/30 bg-black/40 backdrop-blur-md"
								>
									<Sparkles class="h-10 w-10 animate-pulse text-senary" />
								</div>
							</div>
							<h4 class="mb-2 font-serif text-2xl text-secondary">Menganalisis Fitur</h4>
							<p class="text-sm text-secondary/60">
								Mengidentifikasi bentuk wajah dan tekstur rambut...
							</p>
						</div>
					{:else if showResults}
						<!-- Analysis Results -->
						<div class="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
							<!-- Face Shape -->
							<div
								class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
							>
								<div class="mb-4 flex items-center gap-3">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full bg-senary/10 text-senary"
									>
										<ScanFace class="h-6 w-6" />
									</div>
									<h4 class="text-sm font-medium tracking-wide text-secondary/60 uppercase">
										Bentuk Wajah
									</h4>
								</div>
								<p class="font-serif text-2xl text-secondary">{analysisData.faceShape}</p>
								<p class="mt-1 font-mono text-xs text-senary/80">
									Akurasi: {analysisData.faceAccuracy}
								</p>
							</div>

							<!-- Hair Type -->
							<div
								class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
							>
								<div class="mb-4 flex items-center gap-3">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full bg-senary/10 text-senary"
									>
										<Scissors class="h-6 w-6" />
									</div>
									<h4 class="text-sm font-medium tracking-wide text-secondary/60 uppercase">
										Tipe Rambut
									</h4>
								</div>
								<p class="font-serif text-2xl text-secondary">{analysisData.hairType}</p>
								<p class="mt-1 font-mono text-xs text-senary/80">
									Akurasi: {analysisData.hairAccuracy}
								</p>
							</div>

							<!-- Skin Tone -->
							<div
								class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
							>
								<div class="mb-4 flex items-center gap-3">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full bg-senary/10 text-senary"
									>
										<Sun class="h-6 w-6" />
									</div>
									<h4 class="text-sm font-medium tracking-wide text-secondary/60 uppercase">
										Warna Kulit
									</h4>
								</div>
								<p class="font-serif text-2xl text-secondary">{analysisData.skinTone}</p>
								<p class="mt-1 font-mono text-xs text-senary/80">
									Akurasi: {analysisData.skinAccuracy}
								</p>
							</div>
						</div>

						<!-- Filter Section -->
						<div class="mb-10">
							<FilterGroup
								options={serviceOptions}
								{selectedFilter}
								onSelect={(value) => {
									selectedFilter = value || 'Semua';
									selectedFilterValue = value;
									dataCatalogue.getColumn('type')?.setFilterValue(value || undefined);
									dataCatalogue.setPageIndex(0);
								}}
							/>
						</div>

						<!-- Service Grid -->
						<div class="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
							{#each dataCatalogue.getRowModel().rows as row, i (row.id)}
								{@const catalogue = row.original}
								<CatalogueCard
									{catalogue}
									index={i}
									onSelect={(c) => (selectedService = c)}
									onBook={(c) => handleBook(c)}
								/>
							{/each}
						</div>

						<!-- Pagination -->
						<Pagination.Root
							count={visibleRowCount}
							perPage={itemsPerPage}
							{siblingCount}
							page={currentPageIndex}
							class="mx-auto flex w-full justify-center"
						>
							{#snippet children({ pages })}
								<Pagination.Content>
									<Pagination.Item>
										<Button
											disabled={!dataCatalogue.getCanPreviousPage()}
											onclick={() => dataCatalogue.previousPage()}
											size="sm"
											variant="ghost"
											class="cursor-pointer text-secondary/80 hover:bg-white/10 hover:text-white"
										>
											<ChevronLeftIcon class="size-4" />
										</Button>
									</Pagination.Item>
									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item>
												<Pagination.Ellipsis class="text-secondary/80" />
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link
													{page}
													isActive={currentPageIndex === page.value}
													onclick={() => {
														dataCatalogue.setPageIndex(page.value - 1);
													}}
													class={currentPageIndex === page.value
														? 'border-senary bg-senary text-primary hover:bg-senary/80'
														: 'cursor-pointer border-transparent bg-transparent text-secondary/80 hover:bg-white/10 hover:text-white'}
												>
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}
									<Pagination.Item>
										<Button
											disabled={!dataCatalogue.getCanNextPage()}
											onclick={() => {
												dataCatalogue.nextPage();
											}}
											size="sm"
											variant="ghost"
											class="cursor-pointer text-secondary/80 hover:bg-white/10 hover:text-white"
										>
											<ChevronRightIcon class="size-4" />
										</Button>
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					{:else}
						<!-- Photo Ready State (Uploaded but not analyzed) -->
						<div class="flex flex-col items-center justify-center py-24 text-center">
							<div class="relative mb-8">
								<div class="absolute inset-0 animate-pulse rounded-full bg-senary/10 blur-xl"></div>
								<div
									class="relative rounded-full border border-white/10 bg-white/5 p-6 backdrop-blur-md"
								>
									<Camera class="h-10 w-10 text-senary/80" />
								</div>
							</div>
							<h4 class="mb-3 font-serif text-2xl text-secondary">Foto Siap</h4>
							<p class="max-w-xs text-sm leading-relaxed text-secondary/70">
								Foto Anda telah dipilih. Klik <span class="font-bold text-senary"
									>ANALISIS GAYA</span
								> untuk memulai transformasi.
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Detail Modal -->
<ServiceDetailModal
	bind:selectedService
	onClose={() => (selectedService = null)}
	onBook={(c) => handleBook(c)}
/>

<ReservationSheet
	bind:open={showReservationSheet}
	initialNote={selectedCatalogueNote}
	triggerClass="hidden"
/>
