<script>
	import MapPin from '@lucide/svelte/icons/map-pin';
</script>
<footer class="bg-gradient-to-r from-black to-[#2E6057] py-12 text-[#e8ddd4]">
	<div class="container mx-auto px-4">
		<div class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
			<div>
				<h3 class="mb-2 text-2xl font-bold">THREE LIGHTS</h3>
				<p class="text-sm">Barbershop</p>
			</div>

			<div>
				<h4 class="mb-4 font-semibold">Three Lights Barbershop</h4>
				<ul class="space-y-2 text-sm">
					<li><a href="#" class="hover:text-underline hover:text-white">Tentang</a></li>
					<li><a href="#" class="hover:text-underline hover:text-white">Lokasi Detail</a></li>
					<li><a href="#" class="hover:text-underline hover:text-white">Jam Operasional</a></li>
					<li><a href="#" class="hover:text-underline hover:text-white">Layanan & Harga</a></li>
					<li><a href="#" class="hover:text-underline hover:text-white">Produk</a></li>
					<li><a href="#" class="hover:text-underline hover:text-white">Katalog</a></li>
				</ul>
			</div>

			<div>
				<h4 class="mb-4 font-semibold">Kontak</h4>
				<div class="mb-4 flex gap-4"></div>
				<div class="space-y-2">
					<h4 class="font-semibold">Lokasi</h4>
					<p class="flex items-start gap-2 text-sm">
						<MapPin class="mt-1 h-4 w-4 flex-shrink-0" />
						Jl. Terusan Sudimoro, Gembrung, Mojolangu, Kec. Lowokwaru, Kota Malang, Jawa Timur 65142
					</p>
				</div>
			</div>
		</div>

		<div class="border-t border-[#e8ddd4]/20 pt-8 text-center">
			<p class="text-sm">© 2025 Three Lights Barbershop. All Rights Reserved.</p>
		</div>
	</div>
</footer>
