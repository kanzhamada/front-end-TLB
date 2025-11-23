<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import { goto } from '$app/navigation';
</script>

<div class="flex min-h-screen items-center justify-center bg-[#e8ddd4] p-4">
	<Card class="w-full max-w-md border-0 bg-white shadow-2xl">
		<CardHeader class="text-center">
			<div
				class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100"
			>
				<CheckCircle class="size-10 text-emerald-600" />
			</div>
			<CardTitle class="text-2xl font-bold text-[#2e6057]">Reservasi Berhasil!</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6 text-center">
			<p class="text-base text-gray-700">
				Pesanan reservasi Anda telah berhasil dibuat. Silakan cek profil Anda untuk melihat status
				reservasi.
			</p>

			<div class="pt-4">
				<Button
					class="w-full bg-[#fcb13f] text-[#032B24] hover:bg-[#fcb13f]/90"
					onclick={() => goto('/profile')}
				>
					Lihat Profil
				</Button>
			</div>
			<div>
				<Button
					variant="outline"
					class="w-full border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
					onclick={() => goto('/')}
				>
					Kembali ke Beranda
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
