<script>
	import { Search, Scissors, X, Star, ChevronsDown, Expand } from 'lucide-svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	// State using Svelte 5 runes
	let selectedFilter = $state('All');
	let searchQuery = $state('');
	let selectedService = $state(null);

	const services = [
		{
			id: 1,
			name: 'Cuki Haircut',
			type: 'Short',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '30 min'
		},
		{
			id: 2,
			name: 'Cepmek Haircut',
			type: 'Medium',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '45 min'
		},
		{
			id: 3,
			name: 'Cepmek Haircut',
			type: 'Long',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '60 min'
		},
		{
			id: 4,
			name: 'Cepmek Haircut',
			type: 'Short',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '30 min'
		},
		{
			id: 5,
			name: 'Cepmek Haircut',
			type: 'Long',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '60 min'
		},
		{
			id: 6,
			name: 'Cepmek Haircut',
			type: 'Long',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '60 min'
		},
		{
			id: 7,
			name: 'Cepmek Haircut',
			type: 'Medium',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '45 min'
		},
		{
			id: 8,
			name: 'Cepmek Haircut',
			type: 'Long',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '60 min'
		},
		{
			id: 9,
			name: 'Cepmek Haircut',
			type: 'Short',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '30 min'
		},
		{
			id: 10,
			name: 'Cepmek Haircut',
			type: 'Medium',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '45 min'
		},
		{
			id: 11,
			name: 'Cepmek Haircut',
			type: 'Long',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '60 min'
		},
		{
			id: 12,
			name: 'Cepmek Haircut',
			type: 'Long',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam aliquet, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.',
			image: [
				'https://plus.unsplash.com/premium_photo-1729627741526-71da3aa3789f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
				'https://images.unsplash.com/photo-1586793810436-0851834fe086?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626',
				'https://images.unsplash.com/photo-1642504640216-a2a8cce892e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
			],
			duration: '60 min'
		}
	];

	// Derived state for filtered services
	const filteredServices = $derived(
		services.filter((service) => {
			const matchesFilter = selectedFilter === 'All' || service.type === selectedFilter;
			const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesFilter && matchesSearch;
		})
	);
</script>

<div class="min-h-screen bg-slate-50">
	<!-- Hero Section -->

	<section class="relative h-screen w-full overflow-hidden">
		<div
			class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&q=80&w=1470')] bg-cover bg-center"
		></div>
		<div class="absolute inset-0 bg-black/60"></div>

		<div
			class="relative z-10 mx-auto flex h-full max-w-5xl flex-col content-center justify-center px-6"
		>
			<p class="mb-4 text-lg text-white/80">Three Lights Barbershop</p>
			<h1
				class="max-w-3xl text-left text-7xl tracking-tight text-white md:text-9xl lg:text-[152px]"
			>
				“Lights Up <br /> Your Style”
			</h1>
			<div class="z-20 mt-10 w-full transform rounded-2xl md:w-full">
				<div class="flex gap-4">
					<button
						class="group relative cursor-pointer overflow-hidden rounded-lg p-1"
						style="
						background: linear-gradient(90deg, #84B48E, #FDFECC, #FF8E01, #84B48E);
						background-size: 200% 100%;
						animation: gradient-move 4s linear infinite alternate;
					"
					>
						<div
							class="flex h-full w-full items-center gap-2 rounded-lg bg-[#2E6057] px-8 py-3 font-medium text-white"
						>
							<Star class="h-5 w-5" />
							AI Katalog
						</div>
					</button>

					<style>
						@keyframes gradient-move {
							0% {
								background-position: 0% 50%;
							}
							100% {
								background-position: 100% 50%;
							}
						}
					</style>

					<style>
						@keyframes gradient-move {
							0% {
								background-position: 0% 50%;
							}
							100% {
								background-position: 100% 50%;
							}
						}
					</style>

					<button
						on:click={() => {
							const servicesElement = document.getElementById('services');
							if (servicesElement) {
								// The 'scrollIntoView' method by default scrolls the target element to the very top
								// of the viewport (or other specified block alignment). If there's a sticky or
								// fixed navigation bar at the top, it will often overlap and cut off the top
								// part of the scrolled-to section.

								// To fix this, we can calculate the scroll position manually and apply an offset
								// equal to the height of the sticky navbar.
								// The most robust solution would be to add `scroll-margin-top: [navbar-height]px;`
								// to the #services CSS, but since we're only editing the click handler,
								// we'll use a JavaScript offset as a workaround.

								// *** Adjust this value to match the actual height of your sticky header/navbar ***
								const stickyHeaderHeight = 60; // Example: assuming an 80px tall sticky navbar

								const elementRect = servicesElement.getBoundingClientRect();
								const targetScrollPosition = window.scrollY + elementRect.top - stickyHeaderHeight;

								window.scrollTo({
									top: targetScrollPosition,
									behavior: 'smooth'
								});
							}
						}}
						class="relative cursor-pointer rounded-lg bg-white p-1"
					>
						<div
							class="flex h-full w-full items-center gap-2 rounded-lg bg-[#1A1A1A] px-8 py-3 font-medium text-white"
						>
							<ChevronsDown class="h-5 w-5" />
							Lihat Katalog
						</div></button
					>
				</div>
			</div>
		</div>
	</section>

	<!-- Services Catalog -->
	<section class="container mx-auto px-4 py-12" id="services">
		<div class="mb-8">
			<h3 class="mb-6 text-3xl font-bold text-slate-800">Katalog</h3>

			<div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div class="flex flex-wrap items-center gap-3">
					<span class="font-medium text-slate-600">Filter</span>
					<button
						on:click={() => (selectedFilter = 'All')}
						class={`rounded-full px-6 py-2 font-medium transition ${
							selectedFilter === 'All'
								? 'bg-gradient-to-r from-black to-[#2E6057] text-white'
								: 'border border-slate-300 bg-white text-slate-700 hover:border-emerald-600'
						}`}
					>
						All
					</button>
					{#each ['Short', 'Medium', 'Long'] as filter (filter)}
						<button
							on:click={() => (selectedFilter = filter)}
							class={`rounded-full px-6 py-2 font-medium transition ${
								selectedFilter === filter
									? 'bg-gradient-to-r from-black to-[#2E6057] text-white'
									: 'border border-slate-300 bg-white text-slate-700 hover:border-emerald-600'
							}`}
						>
							{filter}
						</button>
					{/each}
				</div>

				<div class="relative w-full md:w-64">
					<Search
						class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
					/>
					<input
						type="text"
						placeholder="Search"
						bind:value={searchQuery}
						class="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
					/>
				</div>
			</div>

			<!-- Service Grid -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredServices as service}
					<div
						class="group relative overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
					>
						<div class="relative h-66 overflow-hidden">
							<img
								src={service.image[0]}
								alt={service.name}
								class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							<!-- New black overlay on hover -->
							<div
								class="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-60"
							></div>
							<div
								class="absolute top-3 right-3 rounded-full bg-[#2E6057] px-3 py-1 text-sm font-medium text-white"
							>
								{service.type}
							</div>
							<div
								class="absolute bottom-3 left-3 text-white transition-opacity duration-300 group-hover:opacity-0"
							>
								<h4 class="text-lg font-bold">{service.name}</h4>
							</div>

							<!-- Hover-only buttons: positioned at bottom, over the image -->
							<div
								class="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 gap-2 p-4 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100"
							>
								<button
									on:click|stopPropagation={() => (selectedService = service)}
									class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
								>
									<Expand />
									Detail
								</button>
								<button
									class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2E6057] py-2 font-medium text-white transition hover:bg-emerald-600"
								>
									<Scissors />
									Pesan
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Detail Modal -->
	{#if selectedService}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			on:click={() => (selectedService = null)}
		>
			<div
				class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white"
				on:click|stopPropagation
			>
				<div class="relative">
					<Carousel.Root opts={{ loop: true }}>
						<Carousel.Content>
							{#each selectedService.image as src, i}
								<Carousel.Item>
									<img
										{src}
										alt={`${selectedService.name} ${i + 1}`}
										class="h-144 w-full object-cover"
									/>
								</Carousel.Item>
							{/each}
						</Carousel.Content>
						{#if selectedService.image.length > 1}
							<Carousel.Previous class="absolute top-1/2 left-4 -translate-y-1/2" />
							<Carousel.Next class="absolute top-1/2 right-4 -translate-y-1/2" />
						{/if}
					</Carousel.Root>

					<button
						on:click={() => (selectedService = null)}
						class="absolute top-4 right-4 rounded-full bg-white p-2 shadow transition hover:bg-slate-100"
					>
						<X class="h-6 w-6" />
					</button>
				</div>

				<div class="p-6">
					<h3 class="mb-2 text-3xl font-bold text-slate-800">{selectedService.name}</h3>
					<div class="mb-6 flex items-center gap-4">
						<span class="rounded-full bg-emerald-100 px-4 py-1 font-medium text-emerald-800">
							{selectedService.type}
						</span>
					</div>
					<div class="mb-6">
						<h4 class="mb-2 text-lg font-bold">Deskripsi</h4>
						<p class="text-slate-600">
							{selectedService.description}
						</p>
					</div>

					<button
						class="w-full rounded-lg bg-primary py-3 text-lg font-medium text-white transition hover:bg-emerald-600"
					>
						Reservasi Sekarang
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
