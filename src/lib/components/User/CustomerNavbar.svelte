<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ReservationSheet from './Reservation/ReservationSheet.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
</script>

<nav
	class="fixed top-0 right-0 left-0 z-50 border-b border-secondary/20 bg-black/40 shadow-lg backdrop-blur-md transition-all duration-300"
>
	<div class="container mx-auto px-4">
		<div class="flex h-20 items-center justify-between">
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
				<a href="/" class="text-sm font-medium text-secondary transition-colors hover:text-senary"
					>Home</a
				>
				<a
					href="/catalogue"
					class="text-sm font-medium text-secondary transition-colors hover:text-senary"
					>Catalogue</a
				>
				<a
					href="/profile"
					class="text-sm font-medium text-secondary transition-colors hover:text-senary">Profile</a
				>
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
			<Button
				class="bg-senary font-bold text-primary shadow-[0_0_20px_rgba(255,142,1,0.3)] transition-all hover:bg-senary/80 hover:shadow-[0_0_30px_rgba(255,142,1,0.5)]"
				>Reservation</Button
			>
		</div>
	</div>
</nav>

<style>
	/* Ensure navbar is above other content */
	nav {
		position: fixed;
		top: 0;
		width: 100%;
	}
</style>
