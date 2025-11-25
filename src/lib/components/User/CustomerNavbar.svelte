<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ReservationSheet from './Reservation/ReservationSheet.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
</script>

<nav
	class="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-black/40 shadow-lg backdrop-blur-md transition-all duration-300"
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
				<div class="flex items-center gap-4">
					<ReservationSheet
						triggerClass="bg-primary text-senary hover:bg-primary/90 font-medium"
						triggerText="Reservasi"
					/>
					<Button
						variant="ghost"
						class="text-secondary hover:bg-white/5 hover:text-senary"
						onclick={() => {
							authStore.clear();
							goto('/');
						}}
					>
						Keluar
					</Button>
				</div>
			{:else}
				<div class="flex items-center gap-3">
					<Button
						variant="ghost"
						class="text-secondary hover:bg-white/5 hover:text-senary"
						onclick={() => goto('/auth/login')}
					>
						Masuk
					</Button>
					<Button
						class="bg-senary font-medium text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all hover:bg-senary/90 hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
						onclick={() => goto('/auth/register')}
					>
						Daftar
					</Button>
					<ReservationSheet
						triggerClass="bg-primary text-senary hover:bg-primary/90 font-medium"
						triggerText="Reservasi"
					/>
				</div>
			{/if}
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
