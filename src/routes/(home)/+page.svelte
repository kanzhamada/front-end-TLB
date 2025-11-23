<script>
	// --- Icon Imports ---
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Phone from '@lucide/svelte/icons/phone';
	import Eye from '@lucide/svelte/icons/eye';
	import Goal from '@lucide/svelte/icons/goal';
	import { Sparkles, ChevronsDown, Star } from 'lucide-svelte';

	// --- Component Imports ---
	import * as Accordion from '$lib/components/ui/accordion';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';
	import { fade, fly } from 'svelte/transition';

	// --- Our NEW Local Components ---
	// (We will create these in the next step)
	import ScheduleCard from '$lib/components/User/Home/ScheduleCard.svelte';
	import ServiceItem from '$lib/components/User/Home/ServiceItem.svelte';

	// --- Page Data ---
	// Moved from the markup to keep the HTML clean
	const scheduleData = [
		{ day: 'Senin', time: 'Off' },
		{ day: 'Selasa', time: '17:00 - 21:00' },
		{ day: 'Rabu', time: '17:00 - 21:00' },
		{ day: 'Kamis', time: '17:00 - 21:00' },
		{ day: "Jum'at", time: '17:00 - 21:00' },
		{ day: 'Sabtu', time: '17:00 - 21:00' },
		{ day: 'Minggu', time: '17:00 - 21:00' }
	];

	
	const serviceData = [
		{
			id: '1',
			title: 'Premium Haircut',
			price: 'Rp 45.000',
			description: 'Haircut premium dengan pilihan warna dan keramik yang terbaik'
		},
		{
			id: '2',
			title: 'Classic Haircut',
			price: 'Rp 40.000',
			description: 'Haircut premium dengan pilihan warna dan keramik yang terbaik'
		},
		{
			id: '3',
			title: 'Shave Beard',
			price: 'Rp 15.000',
			description: 'Haircut premium dengan pilihan warna dan keramik yang terbaik'
		}
	];

	// Note: I've removed the commented-out Google Maps code for clarity.
</script>

<CustomCursor />

<div class="relative min-h-screen overflow-hidden text-secondary selection:bg-senary/30">
	<section class="relative h-screen w-full overflow-hidden">
		<!-- Overlay Gradient for readability -->
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
		>
			<img
				src="https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				alt=""
				class="h-full w-full object-cover opacity-25"
			/>
		</div>

		<div
			class="relative z-10 mx-auto flex h-full max-w-7xl flex-col content-center justify-center px-6"
			in:fade={{ duration: 1000 }}
		>
			<div class="mb-4 flex items-center gap-4" in:fly={{ y: 20, duration: 800, delay: 200 }}>
				<div class="h-[1px] w-12 bg-senary"></div>
				<p class="text-lg font-medium tracking-[0.3em] text-senary uppercase">
					Three Lights Barbershop
				</p>
			</div>

			<h1
				class="max-w-5xl text-left text-7xl leading-[0.95] font-bold tracking-tighter text-secondary drop-shadow-2xl md:text-9xl lg:text-[130px]"
				in:fly={{ y: 30, duration: 800, delay: 400 }}
			>
				Refine Your <br />
				<span
					class="animate-shimmer bg-gradient-to-r from-senary via-[#F5F5DC] to-senary bg-[length:200%_auto] bg-clip-text text-transparent"
					>Signature Look</span
				>
			</h1>

			<div
				class="z-20 mt-16 w-full transform rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-senary/20 hover:bg-white/10 md:w-full"
				in:fly={{ y: 40, duration: 800, delay: 600 }}
			>
				<div class="grid gap-8 md:grid-cols-3">
					<div class="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/5">
						<div
							class="rounded-full border border-senary/30 bg-senary/10 p-3 text-senary transition-all group-hover:scale-110 group-hover:bg-senary group-hover:text-primary"
						>
							<Phone class="h-6 w-6" />
						</div>
						<div>
							<h3 class="text-lg font-bold text-secondary">Concierge</h3>
							<p class="font-light text-secondary/70">+62 812-3456-7890</p>
						</div>
					</div>

					<div class="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/5">
						<div
							class="rounded-full border border-senary/30 bg-senary/10 p-3 text-senary transition-all group-hover:scale-110 group-hover:bg-senary group-hover:text-primary"
						>
							<MapPin class="h-6 w-6" />
						</div>
						<div>
							<h3 class="text-lg font-bold text-secondary">Atelier</h3>
							<p class="font-light text-secondary/70">Jl. Terusan Sudimoro</p>
						</div>
					</div>

					<div class="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/5">
						<div
							class="rounded-full border border-senary/30 bg-senary/10 p-3 text-senary transition-all group-hover:scale-110 group-hover:bg-senary group-hover:text-primary"
						>
							<Clock class="h-6 w-6" />
						</div>
						<div>
							<h3 class="text-lg font-bold text-secondary">Availability</h3>
							<p class="font-light text-secondary/70">Tue - Sun, 13:00 - 22:00</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Scroll Indicator -->
		<div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-senary/50">
			<ChevronsDown class="h-8 w-8" />
		</div>
	</section>

	<style>
		.animate-shimmer {
			animation: shimmer 3s linear infinite;
		}
		@keyframes shimmer {
			to {
				background-position: 200% center;
			}
		}
	</style>

	<section class="relative z-10 py-32">
		<div class="container mx-auto px-4">
			<div class="mb-16 flex flex-col items-center text-center">
				<Sparkles class="mb-4 h-8 w-8 text-senary" />
				<h2 class="mb-4 text-5xl font-bold text-secondary">The Experience</h2>
				<div class="h-1 w-24 rounded-full bg-senary/50"></div>
			</div>

			<div class="grid grid-cols-1 items-center gap-16 md:grid-cols-3">
				<div
					class="group aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
				>
					<div
						class="h-full w-full bg-[url('https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=687')] bg-cover bg-center grayscale transition-transform duration-700 group-hover:scale-110 hover:grayscale-0"
					></div>
				</div>
				<div
					class="group aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-transform duration-700 hover:scale-[1.02] md:mt-24"
				>
					<div
						class="h-full w-full bg-[url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600')] bg-cover bg-center grayscale transition-transform duration-700 group-hover:scale-110 hover:grayscale-0"
					></div>
				</div>
				<div class="space-y-8 text-lg leading-relaxed font-light text-secondary/80">
					<p>
						<span class="float-left mr-2 font-serif text-4xl text-senary">W</span>elcome to a
						sanctuary of style where precision meets luxury. At Three Lights, we believe that a
						haircut is not just a service, but a ritual of refinement.
					</p>
					<p>
						Our master barbers blend traditional techniques with modern aesthetics to craft a look
						that is uniquely yours. Immerse yourself in an atmosphere of sophistication, designed
						for the modern gentleman.
					</p>
					<button
						class="rounded-full border border-senary px-8 py-3 text-sm font-medium tracking-widest text-senary uppercase transition-all duration-300 hover:bg-senary hover:text-primary"
					>
						Read Our Story
					</button>
				</div>
			</div>

			<div class="mt-32 grid grid-cols-1 gap-12 md:grid-cols-1">
				<Card
					class="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-12 text-secondary backdrop-blur-md transition-all duration-500 hover:border-senary/30 hover:bg-white/10"
				>
					<div
						class="absolute top-0 right-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
					>
						<Eye class="h-64 w-64 text-senary" stroke-width="0.5" />
					</div>

					<CardHeader
						class="relative z-10 col-span-1 grid grid-cols-1 items-center gap-12 md:grid-cols-4"
					>
						<h3
							class="col-span-1 bg-gradient-to-r from-secondary to-senary bg-clip-text text-5xl font-bold text-transparent"
						>
							Vision
						</h3>
						<p
							class="col-span-3 border-l border-senary/20 pl-8 text-left text-xl leading-relaxed font-light text-secondary/80"
						>
							To redefine the standard of male grooming by creating an environment where artistry,
							luxury, and relaxation converge. We envision a world where every man walks out with
							confidence and class.
						</p>
					</CardHeader>
				</Card>

				<Card
					class="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-12 text-secondary backdrop-blur-md transition-all duration-500 hover:border-senary/30 hover:bg-white/10"
				>
					<div
						class="absolute bottom-0 left-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12"
					>
						<Goal class="h-64 w-64 text-senary" stroke-width="0.5" />
					</div>
					<CardHeader
						class="relative z-10 col-span-1 grid grid-cols-1 items-center gap-12 md:grid-cols-4"
					>
						<p
							class="order-2 col-span-3 border-r border-senary/20 pr-8 text-left text-xl leading-relaxed font-light text-secondary/80 md:order-1"
						>
							Our mission is to provide an unparalleled grooming experience through meticulous
							attention to detail, premium products, and a commitment to excellence. We strive to be
							more than a barbershop; we are a destination.
						</p>
						<h3
							class="order-1 col-span-1 bg-gradient-to-r from-secondary to-senary bg-clip-text text-right text-5xl font-bold text-transparent md:order-2"
						>
							Mission
						</h3>
					</CardHeader>
				</Card>
			</div>
		</div>
	</section>

	<section class="relative z-10 bg-black/20 py-32 backdrop-blur-sm">
		<div class="container mx-auto px-4">
			<div class="mb-16 flex flex-col items-center text-center">
				<MapPin class="mb-4 h-8 w-8 text-senary" />
				<h2 class="mb-4 text-5xl font-bold text-secondary">The Location</h2>
				<p class="max-w-2xl text-xl font-light text-secondary/70">
					Jl. Terusan Sudimoro, Gembrung, Mojolangu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65142
				</p>
			</div>

			<div
				class="group relative aspect-[21/9] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
			>
				<div
					class="pointer-events-none absolute inset-0 z-10 bg-senary/10 transition-colors duration-500 group-hover:bg-transparent"
				></div>
				<!-- <iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.664880952302!2d112.62762049999999!3d-7.930025999999999!2m3!1f0!2f0!3f0!3m2!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd62900086d3bb9%3A0xeabf779c52c82c86!2sThree%20Lights%20Barbershop!5e0!3m2!1sid!2sid!4v1762238470079!5m2!1sid!2sid"
					width="100%"
					height="100%"
					style="border:0;"
					allowfullscreen=""
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					class="contrast-125 grayscale invert-[0.8] transition-all duration-700 hover:contrast-100 hover:grayscale-0 hover:invert-0"
				></iframe> -->

				<iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d431.983126857858!2d112.62721699667367!3d-7.930409286893467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd62900086d3bb9%3A0xeabf779c52c82c86!2sThree%20Lights%20Barbershop!5e0!3m2!1sid!2sid!4v1763730654011!5m2!1sid!2sid"
					width="100%"
					height="100%"
					style="border:0;"
					allowfullscreen=""
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					class="contrast-125 grayscale invert-[0.2] transition-all duration-700 hover:contrast-100 hover:grayscale-0 hover:invert-0"
				></iframe>
			</div>
		</div>
	</section>

	<section class="relative z-10 py-32">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-1 gap-24 md:grid-cols-2">
				<div>
					<div class="mb-8 flex items-center gap-4">
						<Clock class="h-8 w-8 text-senary" />
						<h2 class="text-4xl font-bold text-secondary">Opening Hours</h2>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-1">
						{#each scheduleData as item}
							<ScheduleCard {item} />
						{/each}
					</div>
				</div>

				<div>
					<div class="mb-8 flex items-center gap-4">
						<Star class="h-8 w-8 text-senary" />
						<h2 class="text-4xl font-bold text-secondary">Premium Services</h2>
					</div>

					<Accordion.Root type="multiple" class="w-full space-y-4">
						{#each serviceData as service}
							<ServiceItem
								value={service.id}
								title={service.title}
								price={service.price}
								description={service.description}
							/>
						{/each}
					</Accordion.Root>
				</div>
			</div>
		</div>
	</section>
</div>
