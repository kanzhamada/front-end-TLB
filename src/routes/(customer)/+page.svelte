<script>
	// --- Icon Imports ---
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Phone from '@lucide/svelte/icons/phone';
	import Eye from '@lucide/svelte/icons/eye';
	import Goal from '@lucide/svelte/icons/goal';
	import { Sparkles, ChevronsDown, Star, Icon } from 'lucide-svelte';
	import { barberPole } from '@lucide/lab';

	// --- Component Imports ---
	import * as Accordion from '$lib/components/ui/accordion';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { fade, fly } from 'svelte/transition';

	// --- Our NEW Local Components ---
	// (We will create these in the next step)
	import ScheduleCard from '$lib/components/User/Home/ScheduleCard.svelte';
	import ServiceItem from '$lib/components/User/Home/ServiceItem.svelte';

	// --- Page Data ---
	export let data;

	// Helper function to format schedule data
	function formatSchedule(schedule) {
		if (!schedule || schedule.length === 0) return [];

		// Order of days for sorting
		const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const dayMap = {
			monday: 'Senin',
			tuesday: 'Selasa',
			wednesday: 'Rabu',
			thursday: 'Kamis',
			friday: "Jum'at",
			saturday: 'Sabtu',
			sunday: 'Minggu'
		};

		return schedule
			.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
			.map((item) => {
				let time = 'Off';
				if (item.hours && item.hours.length > 0) {
					const start = item.hours[0].slice(0, 5);
					const end = item.hours[item.hours.length - 1].slice(0, 5);
					// Assuming hours are sorted. If not, we might need to sort them first.
					// But typically they come sorted from backend or we can just take min/max if needed.
					// For now, taking first and last seems reasonable based on the example response.
					// Wait, the example response has hours like ["14:00:00", "15:00:00", ...].
					// So start is 14:00, end is 22:00.
					// But we should probably check if they are continuous.
					// For simplicity and based on the design "17:00 - 21:00", let's just take start and end.
					time = `${start} - ${end}`;
				}
				return {
					day: dayMap[item.day] || item.day,
					time
				};
			});
	}

	$: scheduleData = formatSchedule(data.schedule);

	$: serviceData = (data.services || []).map((service) => ({
		id: service.id,
		title: service.name,
		price: `Rp ${service.price.toLocaleString('id-ID')}`,
		description: service.description
	}));

	$: activeDays = scheduleData.filter((d) => d.time !== 'Off');
	$: operationalSummary =
		activeDays.length > 0
			? `${activeDays[0].day} - ${activeDays[activeDays.length - 1].day}, ${activeDays[0].time}`
			: 'Tutup Sementara';

	// Note: I've removed the commented-out Google Maps code for clarity.
</script>

<div class="relative min-h-screen overflow-hidden text-secondary selection:bg-senary/30">
	<section class="relative h-screen w-full overflow-hidden">
		<!-- Overlay Gradient for readability -->
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
		>
			<img
				src="/Banner.webp"
				alt=""
				class="h-full w-full object-cover opacity-20"
				fetchpriority="high"
				loading="eager"
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
				class="max-w-5xl text-left text-5xl leading-[0.95] font-bold tracking-tighter text-secondary drop-shadow-2xl md:text-7xl lg:text-[130px]"
				in:fly={{ y: 30, duration: 800, delay: 400 }}
			>
				Refine Your <br />
				<span
					class="animate-shimmer bg-gradient-to-r from-senary via-[#F5F5DC] to-senary bg-[length:200%_auto] bg-clip-text text-transparent"
					>Signature Look</span
				>
			</h1>

			<div
				class="z-20 mt-12 w-full transform rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-senary/20 hover:bg-white/10 active:border-senary/20 active:bg-white/10 md:mt-16 md:w-full md:p-8"
				in:fly={{ y: 40, duration: 800, delay: 600 }}
			>
				<div class="grid gap-6 md:grid-cols-3 md:gap-8">
					<a href="https://wa.me/6287855014355">
						<div
							class="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/5 active:bg-white/5"
						>
							<div
								class="rounded-full border border-senary/30 bg-senary/10 p-3 text-senary transition-all group-hover:scale-110 group-hover:bg-senary group-hover:text-primary group-active:scale-110 group-active:bg-senary group-active:text-primary"
							>
								<Phone class="h-6 w-6" />
							</div>
							<div>
								<h3 class="text-lg font-bold text-secondary">Kontak Kami</h3>
								<p class="font-light text-secondary/70">+62 878-5501-4355</p>
							</div>
						</div>
					</a>

					<a href="#location">
						<div
							class="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/5 active:bg-white/5"
						>
							<div
								class="rounded-full border border-senary/30 bg-senary/10 p-3 text-senary transition-all group-hover:scale-110 group-hover:bg-senary group-hover:text-primary group-active:scale-110 group-active:bg-senary group-active:text-primary"
							>
								<MapPin class="h-6 w-6" />
							</div>
							<div>
								<h3 class="text-lg font-bold text-secondary">Lokasi</h3>
								<p class="font-light text-secondary/70">
									Jl. Terusan Sudimoro, Gembrung, Mojolangu
								</p>
							</div>
						</div>
					</a>

					<a href="#schedule-and-service">
						<div
							class="group flex items-start gap-4 rounded-xl p-4 transition-all hover:bg-white/5 active:bg-white/5"
						>
							<div
								class="rounded-full border border-senary/30 bg-senary/10 p-3 text-senary transition-all group-hover:scale-110 group-hover:bg-senary group-hover:text-primary group-active:scale-110 group-active:bg-senary group-active:text-primary"
							>
								<Clock class="h-6 w-6" />
							</div>
							<div>
								<h3 class="text-lg font-bold text-secondary">Operasional</h3>
								<p class="font-light text-secondary/70">{operationalSummary}</p>
							</div>
						</div>
					</a>
				</div>
			</div>

			<!-- Scroll Indicator -->
			<div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-senary/50">
				<ChevronsDown class="h-8 w-8" />
			</div>
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

	<section class="relative z-10 py-20 md:py-32" id="about">
		<div class="container mx-auto px-4">
			<div class="mb-16 flex flex-col items-center text-center">
				<Icon iconNode={barberPole} class="mb-4 h-8 w-8 text-senary" />
				<!-- <BarberPole class="mb-4 h-8 w-8 text-senary" /> -->
				<h2 class="mb-4 text-4xl font-bold text-secondary md:text-5xl">Tentang Barber</h2>
				<div class="h-1 w-24 rounded-full bg-senary/50"></div>
			</div>

			<div class="grid grid-cols-1 items-center gap-16 md:grid-cols-3">
				<div
					class="group aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-transform duration-700 hover:scale-[1.02] active:scale-[1.02]"
				>
					<div
						class="h-full w-full bg-[url('/IMG_3095.webp')] bg-cover bg-center grayscale transition-transform duration-700 group-hover:scale-110 group-active:scale-110 hover:grayscale-0 active:grayscale-0"
					></div>
				</div>
				<div
					class="group aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-transform duration-700 hover:scale-[1.02] active:scale-[1.02] md:mt-24"
				>
					<div
						class="h-full w-full bg-[url('/IMG_3092.webp')] bg-cover bg-center grayscale transition-transform duration-700 group-hover:scale-110 group-active:scale-110 hover:grayscale-0 active:grayscale-0"
					></div>
				</div>
				<div class="space-y-8 text-lg leading-relaxed font-light text-secondary/80">
					<p>
						<span class="float-left mr-4 font-serif text-5xl text-senary">T</span>hree Lights
						Barbershop adalah barbershop yang berfokus pada pelayanan potong rambut pria yang rapi,
						nyaman, dan sesuai karakter setiap pelanggan. Dengan suasana tempat yang santai dan
						barber yang berpengalaman, kami berkomitmen untuk memberikan hasil terbaik melalui
						konsultasi gaya, pemahaman bentuk wajah, serta teknik potong yang tepat.
					</p>
					<p>
						Kami percaya bahwa potongan rambut bukan hanya soal gaya, tetapi juga tentang
						kepercayaan diri. Karena itu, Three Lights Barbershop hadir untuk memberikan pengalaman
						potong rambut yang menyenangkan, pelayanan yang ramah, dan hasil yang memuaskan bagi
						setiap pelanggan.
					</p>
				</div>
			</div>

			<div class="mt-32 grid grid-cols-1 gap-12 md:grid-cols-1">
				<Card
					class="group relative self-center overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-8 text-secondary backdrop-blur-md transition-all duration-500 hover:border-senary/30 hover:bg-white/10 active:border-senary/30 active:bg-white/10 md:p-12"
				>
					<div
						class="absolute top-0 right-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 group-active:scale-110 group-active:rotate-12"
					>
						<Eye
							class="absolute top-1/2 left-[12.5%] z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 text-senary"
							stroke-width="1"
						/>
					</div>
					<CardHeader class="relative z-10 flex items-start gap-8 md:gap-12">
						<h3
							class="self-center bg-gradient-to-r from-secondary to-senary bg-clip-text text-4xl font-bold whitespace-nowrap text-transparent md:text-5xl"
						>
							Visi
						</h3>
						<div class="flex-1 border-l border-senary/20 pl-8">
							<p class="text-left text-xl leading-relaxed font-light text-secondary/80">
								“Menjadi barbershop yang memberikan pelayanan rapi, nyaman, dan tepat bagi setiap
								pelanggan dengan memberikan hasil potongan yang sesuai kebutuhan.”
							</p>
						</div>
					</CardHeader>
				</Card>
				<Card
					class="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 p-8 text-secondary backdrop-blur-md transition-all duration-500 hover:border-senary/30 hover:bg-white/10 active:border-senary/30 active:bg-white/10 md:p-12"
				>
					<div
						class="absolute bottom-0 left-0 p-12 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 group-active:scale-110 group-active:-rotate-12"
					>
						<Goal
							class="absolute top-1/2 left-[87.5%] z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 text-senary"
							stroke-width="1"
						/>
					</div>
					<CardHeader class="relative z-10 flex items-start gap-8 md:gap-12">
						<div class="flex-1 border-r border-senary/20 pr-8">
							<p class="text-left text-xl leading-relaxed font-light text-secondary/80">
								1. Memberikan layanan potong rambut yang rapi dan sesuai karakter wajah pelanggan.<br
								/>
								2. Meningkatkan kualitas pelayanan melalui rekomendasi model rambut yang lebih personal.<br
								/>
								3. Menjaga kenyamanan dan kepuasan pelanggan melalui pelayanan yang ramah dan profesional.
							</p>
						</div>
						<h3
							class="self-center bg-gradient-to-r from-secondary to-senary bg-clip-text text-right text-4xl font-bold whitespace-nowrap text-transparent md:text-5xl"
						>
							Misi
						</h3>
					</CardHeader>
				</Card>
			</div>
		</div>
	</section>

	<section class="relative z-10 bg-black/20 py-20 backdrop-blur-sm md:py-32" id="location">
		<div class="container mx-auto px-4">
			<div class="mb-16 flex flex-col items-center text-center">
				<MapPin class="mb-4 h-8 w-8 text-senary" />
				<h2 class="mb-4 text-4xl font-bold text-secondary md:text-5xl">Lokasi</h2>
				<p class="max-w-2xl text-xl font-light text-secondary/70">
					Jl. Terusan Sudimoro, Gembrung, Mojolangu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65142
				</p>
			</div>

			<div
				class="group relative aspect-square overflow-hidden rounded-3xl border border-white/10 shadow-2xl md:aspect-[21/9]"
			>
				<div
					class="pointer-events-none absolute inset-0 z-10 bg-senary/10 transition-colors duration-500 group-hover:bg-transparent group-active:bg-transparent"
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
					allowfullscreen="true"
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
				></iframe>
			</div>
		</div>
	</section>

	<section class="relative z-10 py-20 md:py-32" id="schedule-and-service">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
				<div>
					<div class="mb-8 flex items-center gap-4">
						<Clock class="h-8 w-8 text-senary" />
						<h2 class="text-4xl font-bold text-secondary">Jadwal Operasional</h2>
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
						<h2 class="text-4xl font-bold text-secondary">Layanan</h2>
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
