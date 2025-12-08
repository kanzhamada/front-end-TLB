<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ReservationSheet from './Reservation/ReservationSheet.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { LogOut, LogIn, Menu, Home, BookOpen, User } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';

	let showLogoutDialog = $state(false);
	let isMobileMenuOpen = $state(false);

	function handleLogout() {
		authStore.clear();
		showLogoutDialog = false;
		goto('/');
	}
</script>

<nav
	class="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-black/40 shadow-lg backdrop-blur-md transition-all duration-300"
>
	<div class="mx-auto max-w-6xl px-4">
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
					>Beranda</a
				>
				<a
					href="/catalogue"
					class="text-sm font-medium text-secondary transition-colors hover:text-senary">Katalog</a
<<<<<<< HEAD
				>
				<a
					href="/profile"
					class="text-sm font-medium text-secondary transition-colors hover:text-senary">Profil</a
=======
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
				>
				{#if $authStore.session}
					<a
						href="/profile"
						class="text-sm font-medium text-secondary transition-colors hover:text-senary">Profil</a
					>
				{/if}
				<ReservationSheet
					triggerClass="bg-primary text-senary hover:bg-primary/90 font-medium"
					triggerText="Reservasi"
				/>
			</div>

			<div class="hidden items-center gap-4 md:flex">
<<<<<<< HEAD
				<ReservationSheet
					triggerClass="bg-primary text-senary hover:bg-primary/90 font-medium mr-4"
					triggerText="Reservasi"
				/>
=======
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
				<!-- Reservation Button & Auth -->
				{#if $authStore.session}
					<Button
						variant="ghost"
						size="icon"
						class="text-secondary hover:bg-white/0 hover:text-senary"
						onclick={() => (showLogoutDialog = true)}
					>
						<LogOut class="size-5" />
						Keluar
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
<<<<<<< HEAD
									<a
										href="/profile"
										class="flex items-center gap-3 rounded-lg px-4 py-3 text-secondary transition-all hover:bg-white/5 hover:text-senary"
										onclick={() => (isMobileMenuOpen = false)}
									>
										<User class="size-5" />
										<span class="font-medium">Profil</span>
									</a>
=======
									{#if $authStore.session}
										<a
											href="/profile"
											class="flex items-center gap-3 rounded-lg px-4 py-3 text-secondary transition-all hover:bg-white/5 hover:text-senary"
											onclick={() => (isMobileMenuOpen = false)}
										>
											<User class="size-5" />
											<span class="font-medium">Profil</span>
										</a>
									{/if}
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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

<AlertDialog open={showLogoutDialog} onOpenChange={(open) => (showLogoutDialog = open)}>
	<AlertDialogContent class="border border-white/10 bg-primary text-secondary">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-white">Keluar</AlertDialogTitle>
			<AlertDialogDescription class="text-secondary/70">
				Apakah anda yakin ingin keluar?
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel
				class="border-white/10 bg-transparent text-secondary hover:bg-white/10 hover:text-white"
				onclick={() => (showLogoutDialog = false)}
			>
				Batal
			</AlertDialogCancel>
			<AlertDialogAction class="bg-senary text-primary hover:bg-senary/90" onclick={handleLogout}>
				Keluar
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<style>
	/* Ensure navbar is above other content */
	nav {
		position: fixed;
		top: 0;
		width: 100%;
	}
</style>
