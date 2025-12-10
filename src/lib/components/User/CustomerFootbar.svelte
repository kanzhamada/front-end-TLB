<script>
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Instagram from '@lucide/svelte/icons/instagram';
	import Phone from '@lucide/svelte/icons/phone';
</script>

<footer
	class="border-t border-white/10 bg-primary/40 py-12 text-secondary/80 backdrop-blur-md md:py-16"
>
	<div class="mx-auto max-w-6xl px-6 md:px-4">
		<div class="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
			<div>
				<img src="/three_lights_barbershop_logo.svg" alt="" />
			</div>

			<div>
				<h4 class="mb-6 font-bold text-secondary">Menu</h4>
				<ul class="space-y-3 text-sm">
					<li><a href="/#about" class="transition-colors hover:text-senary">Tentang</a></li>
					<li><a href="/#location" class="transition-colors hover:text-senary">Lokasi</a></li>
					<li>
						<a href="/#schedule-and-service" class="transition-colors hover:text-senary">Jadwal</a>
					</li>
					<li>
						<a href="#schedule-and-service" class="transition-colors hover:text-senary">Layanan</a>
					</li>
					<li>
						<a href="/catalogue" class="transition-colors hover:text-senary">Katalog</a>
					</li>
				</ul>
			</div>

			<div>
				<h4 class="mb-6 font-bold text-secondary">Kontak Kami</h4>
				<div class="mb-6 flex items-center gap-4">
					<a href="https://www.instagram.com/threelightsbarbershop/" target="_blank">
						<Instagram class="h-6 w-6 text-senary" />
					</a>
					<a href="https://wa.me/6287855014355" target="_blank">
						<Phone class="h-6 w-6 text-senary" />
					</a>
				</div>
				<div class="space-y-4">
					<div>
						<h5 class="mb-2 font-semibold text-secondary">Lokasi</h5>
						<p class="flex items-start gap-3 text-sm">
							<MapPin class="mt-1 h-4 w-4 flex-shrink-0 text-senary" />
							<span
								>Jl. Terusan Sudimoro, Gembrung, Mojolangu, Kec. Lowokwaru, Kota Malang, Jawa Timur
								65142</span
							>
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="border-t border-white/10 pt-8 text-center">
			<p class="text-sm text-secondary/60">© 2025 Three Lights Barbershop. All Rights Reserved.</p>
		</div>
	</div>
</footer>
