<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ReservationSheet from './Reservation/ReservationSheet.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
</script>

<nav class="fixed top-0 right-0 left-0 z-50 bg-[#032B24] shadow-lg">
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex items-center gap-2">
				<img
					src="/three_lights_barbershop_logo.svg"
					alt="Three Lights Barbershop Logo"
					class="h-12 w-auto"
				/>
			</div>

			<!-- Navigation Links -->
			<div class="hidden items-center gap-8 md:flex">
				<a href="/" class="text-[#e8ddd4] transition-colors hover:text-white">Home</a>
				<a href="/catalogue" class="text-[#e8ddd4] transition-colors hover:text-white">Katalog</a>
				<a href="/profile" class="text-[#e8ddd4] transition-colors hover:text-white">Profile</a>
			</div>

			<!-- Reservation Button -->
			{#if $authStore.session}
				<ReservationSheet
					triggerClass="bg-[#e8ddd4] text-[#2e6057] hover:bg-[#2e6057]/90 hover:text-[#e8ddd4]/90"
					triggerText="Reservasi"
				/>
				<Button
					variant="ghost"
					class="ml-2 text-[#e8ddd4] hover:text-white"
					onclick={() => {
						authStore.clear();
						goto('/');
					}}
				>
					Keluar
				</Button>
			{:else}
				<div class="flex items-center gap-3">
					<Button
						variant="outline"
						class="border-[#e8ddd4] text-[#e8ddd4] hover:bg-[#e8ddd4]/10"
						onclick={() => goto('/auth/login')}
					>
						Masuk
					</Button>
					<Button
						class="bg-[#e8ddd4] text-[#2e6057] hover:bg-[#2e6057]/90 hover:text-[#e8ddd4]/90"
						onclick={() => goto('/auth/register')}
					>
						Daftar
					</Button>
				</div>
			{/if}
		</div>
	</div>
</nav>

<style>
	/* Ensure navbar is above other content */
	nav {
		position: sticky;
		top: 0;
	}
</style>
