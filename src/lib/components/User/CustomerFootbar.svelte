<script>
	import MapPin from '@lucide/svelte/icons/map-pin';
</script>

<footer class="border-t border-secondary/20 bg-primary py-16 text-secondary/80">
	<div class="container mx-auto px-4">
		<div class="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
			<div>
				<h3 class="mb-4 text-2xl font-bold tracking-wider text-secondary">THREE LIGHTS</h3>
				<p class="text-sm text-secondary/60">Premium Barbershop Experience</p>
			</div>

			<div>
				<h4 class="mb-6 font-bold text-secondary">Quick Links</h4>
				<ul class="space-y-3 text-sm">
					<li><a href="/" class="transition-colors hover:text-senary">About Us</a></li>
					<li><a href="/" class="transition-colors hover:text-senary">Location</a></li>
					<li><a href="/" class="transition-colors hover:text-senary">Opening Hours</a></li>
					<li>
						<a href="/" class="transition-colors hover:text-senary">Services & Pricing</a>
					</li>
					<li>
						<a href="/catalogue" class="transition-colors hover:text-senary">Catalogue</a>
					</li>
				</ul>
			</div>

			<div>
				<h4 class="mb-6 font-bold text-secondary">Contact Us</h4>
				<div class="space-y-4">
					<div>
						<h5 class="mb-2 font-semibold text-secondary">Location</h5>
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

		<div class="border-t border-secondary/20 pt-8 text-center">
			<p class="text-sm text-secondary/60">© 2025 Three Lights Barbershop. All Rights Reserved.</p>
		</div>
	</div>
</footer>
