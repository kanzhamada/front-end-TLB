<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4"
>
	<!-- Background Elements -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/40"
	></div>
	<div
		class="pointer-events-none absolute -top-1/2 -left-1/2 h-[1000px] w-[1000px] rounded-full bg-senary/5 blur-[120px]"
	></div>
	<div
		class="pointer-events-none absolute -right-1/2 -bottom-1/2 h-[1000px] w-[1000px] rounded-full bg-primary/10 blur-[120px]"
	></div>

	<div in:fade={{ duration: 800 }} class="relative z-10 w-full max-w-md">
		<Card
			class="w-full border border-senary/20 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-senary/30 hover:bg-white/10"
		>
			<CardHeader class="text-center">
				<div
					class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-senary/10 ring-1 ring-senary/30 transition-all duration-700 hover:scale-110 hover:bg-senary/20 hover:ring-senary/50"
					in:fly={{ y: 20, duration: 800, delay: 200 }}
				>
					<CheckCircle class="size-10 text-senary drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
				</div>
				<CardTitle class="text-3xl font-bold tracking-tight text-secondary">
					Reservasi Berhasil!
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-8 text-center">
				<p
					class="text-lg leading-relaxed font-light text-secondary/80"
					in:fly={{ y: 20, duration: 800, delay: 400 }}
				>
					Pesanan reservasi Anda telah berhasil dibuat. <br />
					Silakan cek profil Anda untuk melihat status reservasi.
				</p>

				<div class="space-y-4 pt-2" in:fly={{ y: 20, duration: 800, delay: 500 }}>
					<Button
						class="h-12 w-full bg-senary text-base font-semibold text-primary shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-[1.02] hover:bg-senary/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
						onclick={() => goto('/profile')}
					>
						Lihat Profil
					</Button>
					<Button
						variant="outline"
						class="h-12 w-full border-white/10 bg-transparent text-base text-secondary transition-all duration-300 hover:border-senary/30 hover:bg-white/5 hover:text-white"
						onclick={() => goto('/')}
					>
						Kembali ke Beranda
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
