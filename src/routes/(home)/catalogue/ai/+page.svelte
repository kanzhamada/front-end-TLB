<script lang="ts">
	import {
		Scissors,
		X,
		Star,
		Expand,
		Upload,
		ImageIcon,
		AlertCircle,
		Sparkles,
		Gem,
		Camera,
		Aperture
	} from 'lucide-svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getCatalogue } from '$lib/api/shared/catalogue';
	import * as Accordion from '$lib/components/ui/accordion';
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel
	} from '@tanstack/table-core';
	import { catalogueColumns } from '$lib/columns/admin/catalogueColumns';
	import { createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let avatar = $state(null);
	let isDragging = $state(false);
	let fileInput;
	let accordionValue = $state(['contoh-foto']); // Auto open on load
	let scanning = $state(false);
	let result = $state<string | null>(null);
	let hairType = $state('');
	let faceShape = $state('');
	let vibe = $state('');

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
	}

	onDestroy(() => {
		stopCamera();
	});

	// Get catalogue data
	let response = getCatalogue();
	let catalogues = response.catalogues;

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
			label: 'All'
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

	function handleScan() {
		scanning = true;
		result = null;
		setTimeout(() => {
			scanning = false;
			result = "The 'Modern Pompadour' with a high fade.";
		}, 3000);
	}

	const itemsPerPage = $derived(8);
	const siblingCount = $derived(isDesktopView.current ? 1 : 0);
	const visibleRowCount = $derived(dataCatalogue.getFilteredRowModel().rows.length);
	let currentPageIndex = $derived(dataCatalogue.getState().pagination.pageIndex + 1);

	// State
	let selectedFilter = $state('All');
	let selectedService = $state<(typeof catalogues)[0] | null>(null);
</script>

<CustomCursor />

<!-- Luxury Theme Wrapper -->
<div class="min-h-screen w-full font-sans text-secondary selection:bg-senary/30">
	<!-- Gradient Overlay for readability -->
	<div
		class="pointer-events-none fixed inset-0 -z-5 bg-gradient-to-b from-primary/30 via-transparent to-primary/80"
	></div>

	<div class="relative z-10 container mx-auto px-4 py-24">
		<!-- Header -->
		<div class="mb-16 text-center" in:fade={{ duration: 1000 }}>
			<div
				class="mb-6 inline-flex items-center gap-2 rounded-full border border-senary/30 bg-primary/40 px-4 py-1.5 shadow-[0_0_15px_-5px_rgba(212,175,55,0.3)] backdrop-blur-md"
			>
				<Gem class="h-3.5 w-3.5 text-senary" />
				<span class="text-[10px] font-bold tracking-[0.2em] text-senary uppercase"
					>Premium AI Analysis</span
				>
			</div>
			<h2
				class="mb-4 font-serif text-5xl leading-tight font-medium tracking-tight text-secondary drop-shadow-xl md:text-7xl"
			>
				AI Style <span class="text-gradient-gold">Consultant</span>
			</h2>
			<p class="mx-auto max-w-xl text-lg font-light text-secondary/80">
				Experience the future of style. Upload your photo or use your camera, and let our advanced
				AI curate a personalized selection of premium hairstyles just for you.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Left Side - Upload Section -->
			<div class="lg:col-span-4" in:fly={{ x: -50, duration: 1000, delay: 200, easing: quintOut }}>
				<!-- Dropzone Card -->
				<div
					class="glass-panel glass-panel-hover group relative overflow-hidden rounded-[2rem] p-1"
				>
					<div class="relative rounded-[1.8rem] bg-black/20 p-8">
						<h3 class="mb-6 flex items-center gap-3 font-serif text-xl text-secondary">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-senary/10 ring-1 ring-senary/30"
							>
								<Sparkles class="h-4 w-4 text-senary" />
							</div>
							Upload Portrait
						</h3>

						{#if showCamera}
							<!-- Camera View -->
							<div
								class="relative mb-8 flex h-[28rem] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-senary/30 bg-black/40"
							>
								<video bind:this={videoEl} autoplay playsinline class="h-full w-full object-cover"
								></video>

								<!-- Camera Controls -->
								<div class="absolute bottom-6 flex gap-4">
									<button
										on:click={takePhoto}
										class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-lg transition-transform hover:scale-110 active:scale-95"
									>
										<Aperture class="h-6 w-6 text-white" />
									</button>
									<button
										on:click={stopCamera}
										class="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md transition-colors hover:bg-white/20"
									>
										<X class="h-6 w-6 text-white" />
									</button>
								</div>
							</div>
						{:else}
							<!-- Drag & Drop View -->
							<div
								class="relative mb-6 flex h-[24rem] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-black/20 transition-all duration-500 hover:border-senary/40 hover:bg-senary/5"
								class:border-senary={isDragging}
								class:bg-senary_5={isDragging}
								on:dragover={handleDragOver}
								on:dragleave={handleDragLeave}
								on:drop={handleDrop}
								on:click={() => fileInput?.click()}
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
												>Change Photo</span
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
											<p class="mb-2 text-lg font-medium text-secondary">Drag & drop portrait</p>
											<p class="text-xs tracking-wider text-secondary/60 uppercase">
												or click to browse
											</p>
										</div>
									</div>
								{/if}
							</div>

							<!-- Camera Button -->
							<button
								on:click={startCamera}
								class="mb-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold tracking-widest text-secondary uppercase transition-all hover:bg-white/10 hover:text-senary"
							>
								<Camera class="h-4 w-4" />
								<span>Use Camera</span>
							</button>
						{/if}

						<!-- Hidden file input -->
						<input
							type="file"
							accept="image/jpeg,image/png,image/jpg"
							style="display: none;"
							bind:this={fileInput}
							on:change={(e) => onFileSelected(e)}
						/>

						<!-- Hidden Canvas -->
						<canvas bind:this={canvasEl} class="hidden"></canvas>

						<!-- Photo Requirements -->
						<div class="mb-8 space-y-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/5">
							<div class="flex items-start gap-3 text-xs text-secondary/80">
								<div
									class="mt-1.5 h-1 w-1 rounded-full bg-senary shadow-[0_0_8px_rgba(212,175,55,0.8)]"
								></div>
								<span class="leading-relaxed">High resolution (JPG, PNG) up to 6MB</span>
							</div>
							<div class="flex items-start gap-3 text-xs text-secondary/80">
								<div
									class="mt-1.5 h-1 w-1 rounded-full bg-senary shadow-[0_0_8px_rgba(212,175,55,0.8)]"
								></div>
								<span class="leading-relaxed">Ensure face is clearly visible and well-lit</span>
							</div>
						</div>

						<!-- Submit Button -->
						<button
							class="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl bg-senary px-6 py-4 text-sm font-bold tracking-widest text-primary uppercase shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] transition-all duration-500 hover:bg-white hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-senary disabled:hover:shadow-none"
							disabled={!avatar}
							on:click={() => {
								// Submit logic here
								console.log('Submitting photo...');
								handleScan();
							}}
						>
							<Upload
								class="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
							/>
							<span class="relative">Analyze Style</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Right Side - Results Section -->
			<div class="lg:col-span-8" in:fly={{ x: 50, duration: 1000, delay: 400, easing: quintOut }}>
				<div class="h-full rounded-[2rem] border border-white/5 bg-white/5 p-8 backdrop-blur-xl">
					<div class="mb-8 flex items-center justify-between">
						<h3 class="font-serif text-2xl text-secondary">Style Recommendations</h3>
						<div class="ml-6 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
					</div>

					<!-- Examples Accordion -->
					<Accordion.Root type="multiple" bind:value={accordionValue} class="mb-10 w-full">
						<Accordion.Item
							value="contoh-foto"
							class="overflow-hidden rounded-xl border border-white/10 bg-black/20"
						>
							<Accordion.Trigger
								class="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-secondary/80 transition-all hover:bg-white/5 hover:text-secondary hover:no-underline data-[state=open]:bg-white/5 data-[state=open]:text-secondary"
							>
								<span class="text-sm font-medium tracking-wide uppercase">View Guidelines</span>
							</Accordion.Trigger>
							<Accordion.Content class="w-full border-t border-white/5 bg-black/20 px-6 py-8">
								<div
									class="mb-8 flex items-start gap-4 rounded-lg border border-senary/20 bg-senary/5 p-5"
								>
									<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0 text-senary" />
									<p class="text-sm leading-relaxed text-secondary/80">
										Our AI analyzes facial structure and features. High-quality photos ensure
										90-100% accuracy in recommendations.
									</p>
								</div>
								<div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
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
											Good
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
											Good
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
											Bad
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
											Bad
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
							<h4 class="mb-3 font-serif text-2xl text-secondary">Ready to Transform?</h4>
							<p class="max-w-xs text-sm leading-relaxed text-secondary/70">
								Upload your photo to unlock a curated collection of hairstyles tailored to your
								unique features.
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
							<h4 class="mb-2 font-serif text-2xl text-secondary">Analyzing Features</h4>
							<p class="text-sm text-secondary/60">Identifying face shape and hair texture...</p>
						</div>
					{:else}
						<!-- Filter Section -->
						<div class="mb-10">
							<div class="flex flex-wrap items-center gap-4">
								<span class="text-xs font-bold tracking-widest text-secondary/80 uppercase"
									>Filter By:</span
								>
								<button
									on:click={() => {
										selectedFilter = 'All';
										selectedFilterValue = '';
										dataCatalogue.getColumn('type')?.setFilterValue(undefined);
										dataCatalogue.setPageIndex(0);
									}}
									class={`rounded-full px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
										selectedFilter === 'All'
											? 'bg-senary text-primary shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]'
											: 'border border-white/10 bg-transparent text-secondary/80 hover:border-senary/50 hover:text-senary'
									}`}
								>
									ALL
								</button>
								{#each serviceOptions.slice(1) as option}
									<button
										on:click={() => {
											selectedFilter = option.value;
											selectedFilterValue = option.value;
											dataCatalogue.getColumn('type')?.setFilterValue(option.value || undefined);
											dataCatalogue.setPageIndex(0);
										}}
										class={`rounded-full px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
											selectedFilter === option.value
												? 'bg-senary text-primary shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]'
												: 'border border-white/10 bg-transparent text-secondary/80 hover:border-senary/50 hover:text-senary'
										}`}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- Service Grid -->
						<div class="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
							{#each dataCatalogue.getRowModel().rows as row, i (row.id)}
								{@const catalogue = row.original}
								<div
									in:scale={{ duration: 600, delay: i * 50, start: 0.9, easing: quintOut }}
									class="group relative overflow-hidden rounded-xl border border-white/5 bg-black/40 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-senary/30 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.1)]"
								>
									<div class="relative aspect-[3/4] overflow-hidden">
										<img
											src={catalogue.image[0]}
											alt={catalogue.name}
											class="h-full w-full object-cover transition duration-1000 group-hover:scale-110 group-hover:grayscale-100"
										/>
										<div
											class="absolute inset-0 bg-gradient-to-t from-[#0A1F18] via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"
										></div>

										<!-- Hover Overlay -->
										<div
											class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100"
										>
											<button
												on:click|stopPropagation={() => (selectedService = catalogue)}
												class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md transition hover:bg-white hover:text-black"
											>
												<Expand class="h-3 w-3" />
												VIEW
											</button>
											<button
												class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-senary py-2.5 text-[10px] font-bold tracking-widest text-primary uppercase shadow-lg transition hover:bg-white hover:text-black"
											>
												<Scissors class="h-3 w-3" />
												BOOK
											</button>
										</div>

										<!-- Labels -->
										<div
											class="absolute top-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-bold tracking-wider text-white uppercase backdrop-blur-md"
										>
											{catalogue.type}
										</div>

										<div
											class="absolute bottom-0 left-0 w-full p-5 transition-transform duration-500 group-hover:translate-y-4 group-hover:opacity-0"
										>
											<h4 class="truncate font-serif text-lg text-white">{catalogue.name}</h4>
										</div>
									</div>
								</div>
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
											<span class="hidden sm:block">Previous</span>
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
											<span class="hidden sm:block">Next</span>
											<ChevronRightIcon class="size-4" />
										</Button>
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Detail Modal -->
{#if selectedService}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		on:click={() => (selectedService = null)}
	>
		<div
			class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1F18] shadow-2xl"
			on:click|stopPropagation
			in:scale={{ start: 0.95, duration: 300, easing: quintOut }}
		>
			<div class="relative">
				<Carousel.Root opts={{ loop: true }}>
					<Carousel.Content>
						{#each selectedService.image as src, i}
							<Carousel.Item>
								<img
									{src}
									alt={`${selectedService.name} ${i + 1}`}
									class="h-128 w-full object-cover"
								/>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					{#if selectedService.image.length > 1}
						<Carousel.Previous
							class="absolute top-1/2 left-4 -translate-y-1/2 border-white/10 bg-black/40 text-white hover:bg-white hover:text-black"
						/>
						<Carousel.Next
							class="absolute top-1/2 right-4 -translate-y-1/2 border-white/10 bg-black/40 text-white hover:bg-white hover:text-black"
						/>
					{/if}
				</Carousel.Root>
				<button
					on:click={() => (selectedService = null)}
					class="absolute top-4 right-4 cursor-pointer rounded-full bg-black/40 p-2 text-white transition hover:bg-white hover:text-black"
				>
					<X class="h-6 w-6" />
				</button>
			</div>
			<div class="p-8">
				<div class="mb-2 flex items-center gap-3">
					<span
						class="rounded-full border border-senary/30 bg-senary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-senary uppercase"
						>{selectedService.type}
					</span>
				</div>
				<h3 class="mb-4 font-serif text-3xl text-secondary">{selectedService.name}</h3>
				<div class="mb-8">
					<h4 class="mb-2 text-sm font-bold tracking-widest text-secondary/80 uppercase">
						Description
					</h4>
					<p class="text-lg leading-relaxed font-light text-secondary/70">
						{selectedService.description}
					</p>
				</div>
				<button
					class="w-full rounded-xl bg-senary py-4 text-sm font-bold tracking-widest text-primary uppercase transition hover:bg-white hover:shadow-lg"
				>
					Book Appointment
				</button>
			</div>
		</div>
	</div>
{/if}
