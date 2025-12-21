<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ReservationSheet from './Reservation/ReservationSheet.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { LogOut, LogIn, Menu, Home, BookOpen, User } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import LogoutDialog from '$lib/components/User/LogoutDialog.svelte';

	import { getReservations } from '$lib/api/customer/reservation';
	import { onMount } from 'svelte';

	let showLogoutDialog = $state(false);
	let isMobileMenuOpen = $state(false);
	let hasActiveReservations = $state(false);

	function handleLogout() {
		authStore.clear();
		showLogoutDialog = false;
		goto('/');
	}

	async function checkActiveReservations() {
		const token = $authStore.session?.access_token;
		if (!token) return;

		try {
			const response = await getReservations(token);
			if (response.success && response.data) {
				const activeStatuses = ['waiting', 'onGoing', 'waitingForPayment', 'requestToReschedule'];
				hasActiveReservations = response.data.some((res) => activeStatuses.includes(res.status));
			}
		} catch (error) {
			console.error('Failed to check active reservations:', error);
		}
	}

	$effect(() => {
		if ($authStore.session) {
			checkActiveReservations();
		} else {
			hasActiveReservations = false;
		}
	});
</script>

<nav
	class="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-black/40 shadow-lg backdrop-blur-md transition-all duration-300"
>
	<div class="mx-auto max-w-6xl px-4 md:px-8">
		<div class="flex h-16 items-center justify-between md:h-20">
			<!-- Logo -->
			<div class="flex items-center gap-2">
				<a href="/">
					<img
						src="/three_lights_barbershop_logo.svg"
						alt="Three Lights Barbershop Logo"
						class="h-10 w-auto md:h-12"
						fetchpriority="high"
						width="266"
						height="94"
					/>
				</a>
			</div>

			<!-- Navigation Links -->
			<div class="hidden items-center gap-8 md:flex">
				<a href="/" class="text-sm font-medium text-secondary transition-colors hover:text-senary"
					>Beranda</a
				>
				<a
					href="/catalogue"
					class="text-sm font-medium text-secondary transition-colors hover:text-senary">Katalog</a
				>
				<ReservationSheet
					triggerClass="bg-primary text-senary hover:bg-primary/90 font-medium"
					triggerText="Reservasi"
				/>
			</div>

			<div class="hidden items-center gap-4 md:flex">
				<!-- Reservation Button & Auth -->
				{#if $authStore.session}
					<Button
						variant="ghost"
						size="icon"
						class="relative text-secondary hover:bg-white/0 hover:text-senary"
						onclick={() => goto('/profile')}
					>
						<User class="size-5" />
						{#if hasActiveReservations}
							<div
								class="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-black"
							></div>
						{/if}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="text-secondary hover:bg-white/0 hover:text-senary"
						onclick={() => (showLogoutDialog = true)}
					>
						<LogOut class="size-5" />
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="icon"
						class="text-secondary hover:bg-white/0 hover:text-senary"
						onclick={() => goto('/auth/login')}
					>
						<LogIn class="size-5" />
						Masuk
					</Button>
				{/if}
			</div>

			<!-- Mobile Menu -->
			<div class="md:hidden">
				<Sheet.Root bind:open={isMobileMenuOpen}>
					<Sheet.Trigger>
						<Button variant="ghost" size="icon" class="text-secondary hover:text-senary">
							<Menu class="size-6" />
						</Button>
					</Sheet.Trigger>
					<Sheet.Content
						side="right"
						class="w-[300px] border-l border-white/10 bg-black/95 p-0 backdrop-blur-xl"
					>
						<div class="flex h-full flex-col">
							<!-- Navigation Links -->
							<div class="flex-1 overflow-y-auto py-6">
								<div class="flex flex-col px-4">
									<div
										class="mb-2 px-4 text-xs font-semibold tracking-wider text-white/40 uppercase"
									>
										Menu
									</div>
									<a
										href="/"
										class="flex items-center gap-3 rounded-lg px-4 py-3 text-secondary transition-all hover:bg-white/5 hover:text-senary"
										onclick={() => (isMobileMenuOpen = false)}
									>
										<Home class="size-5" />
										<span class="font-medium">Beranda</span>
									</a>
									<a
										href="/catalogue"
										class="flex items-center gap-3 rounded-lg px-4 py-3 text-secondary transition-all hover:bg-white/5 hover:text-senary"
										onclick={() => (isMobileMenuOpen = false)}
									>
										<BookOpen class="size-5" />
										<span class="font-medium">Katalog</span>
									</a>
									{#if $authStore.session}
										<a
											href="/profile"
											class="flex items-center gap-3 rounded-lg px-4 py-3 text-secondary transition-all hover:bg-white/5 hover:text-senary"
											onclick={() => (isMobileMenuOpen = false)}
										>
											<div class="relative">
												<User class="size-5" />
												{#if hasActiveReservations}
													<div
														class="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-black"
													></div>
												{/if}
											</div>
											<span class="font-medium">Profil</span>
										</a>
									{/if}
								</div>

								<div class="my-6 h-px w-full bg-white/10"></div>

								<!-- Actions -->
								<div class="flex flex-col px-4">
									<div
										class="mb-2 px-4 text-xs font-semibold tracking-wider text-white/40 uppercase"
									>
										Aksi
									</div>
									<div class="px-2">
										<ReservationSheet
											triggerClass="w-full justify-start gap-3 bg-primary/10 text-senary hover:bg-primary/20 font-medium mb-2"
											triggerText="Reservasi"
										/>
									</div>

									{#if $authStore.session}
										<Button
											variant="ghost"
											class="justify-start gap-3 px-4 text-secondary hover:bg-white/5 hover:text-senary"
											onclick={() => {
												isMobileMenuOpen = false;
												showLogoutDialog = true;
											}}
										>
											<LogOut class="size-5" />
											<span class="font-medium">Keluar</span>
										</Button>
									{:else}
										<Button
											variant="ghost"
											class="justify-start gap-3 px-4 text-secondary hover:bg-white/5 hover:text-senary"
											onclick={() => {
												isMobileMenuOpen = false;
												goto('/auth/login');
											}}
										>
											<LogIn class="size-5" />
											<span class="font-medium">Masuk</span>
										</Button>
									{/if}
								</div>
							</div>

							<!-- Footer -->
							<div class="border-t border-white/10 p-6">
								<p class="text-center text-xs text-white/30">
									© {new Date().getFullYear()} Three Lights Barbershop
								</p>
							</div>
						</div>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</div>
	</div>
</nav>

<LogoutDialog bind:open={showLogoutDialog} onConfirm={handleLogout} />

<style>
	/* Ensure navbar is above other content */
	nav {
		position: fixed;
		top: 0;
		width: 100%;
	}
</style>
