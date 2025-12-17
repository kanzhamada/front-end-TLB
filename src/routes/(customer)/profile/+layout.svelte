<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { UserProfile } from '$lib/stores/auth';
	import { authStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		LogOut,
		Wallet,
		Calendar,
		Ticket,
		User,
		Mail,
		Phone,
		Lock,
		Sparkles,
		Eye,
		EyeOff
	} from 'lucide-svelte';
	import { getProfile, updateProfile, type ProfileData } from '$lib/api/customer/profile';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { profileSchema } from '$lib/zod/schema';
	import LogoutDialog from '$lib/components/User/LogoutDialog.svelte';

	let { children } = $props();

	// State variables
	let showEditModal = $state(false);
	let showChangePasswordModal = $state(false);
	let showLogoutDialog = $state(false);
	let profileData = $state<ProfileData | null>(null);

	let loading = $state(false);
	let error = $state<string | null>(null);
	let isUpdating = $state(false);
	let isChangingPassword = $state(false);
	// For change password form
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Get user profile from auth store
	const userProfile: UserProfile | null = get(authStore).session?.user || null;

	console.log(userProfile);

	function handleLogout() {
		authStore.clear();
		showLogoutDialog = false;
		goto('/auth/login');
	}

	// Load profile for editing
	async function loadProfile() {
		loading = true;
		error = null;
		profileData = null;

		try {
			console.debug('Getting token from authStore...');
			const token = get(authStore).session?.access_token;
			console.debug('Token:', token);
			if (!token) {
				console.debug('No token found, throwing error.');
				throw new Error('User not authenticated');
			}

			console.debug('Calling getProfile with token...');
			const response = await getProfile(token);
			console.debug('getProfile response:', response);
			if (!response.success || !response.data) {
				console.debug('Response unsuccessful or missing data, throwing error.');
				throw new Error(response.message || 'Failed to load profile');
			}

			console.debug('Setting profileData to response.data:', response.data);
			profileData = response.data;
			console.log('photo profile', profileData?.photoProfile);
		} catch (err) {
			console.error('Error loading profile for edit:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading profile';
		} finally {
			console.debug('Setting loading to false.');
			loading = false;
		}
	}

	onMount(() => {
		loadProfile();
	});

	// Handle opening edit modal
	function openEditModal() {
		showEditModal = true;
	}

	// Handle profile update
	async function handleUpdateProfile() {
		if (!profileData) return;

		// Validate using Zod schema
		const validationResult = profileSchema.safeParse({
			displayName: profileData.displayName,
			phone: profileData.phone
		});

		if (!validationResult.success) {
			// Get the first error message
			error = validationResult.error.errors[0].message;
			return;
		}

		isUpdating = true;
		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const updatePayload = {
				displayName: profileData.displayName,
				phone: profileData.phone
			};

			const response = await updateProfile(updatePayload, token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to update profile');
			}

			// Update the auth store with new profile data
			const currentSession = get(authStore).session;
			if (currentSession && profileData) {
				authStore.setSession({
					...currentSession,
					user: {
						...currentSession.user,
						display_name: profileData.displayName,
						phone: profileData.phone,
						email: profileData.email
					}
				});
			}

			// Update the local userProfile state to reflect changes
			// This will update the display in the sidebar
			showEditModal = false;

			// Refresh the page to update all displays
			location.reload();
		} catch (err) {
			console.error('Error updating profile:', err);
			error = err instanceof Error ? err.message : 'An error occurred while updating profile';
		} finally {
			isUpdating = false;
		}
	}

	// Handle input change for profile data
	function handleInputChange(field: keyof ProfileData, value: string) {
		if (profileData) {
			profileData = {
				...profileData,
				[field]: value
			};
		}
	}

	// Handle password change
	async function handleChangePassword() {
		if (!currentPassword || !newPassword || !confirmPassword) {
			error = 'Semua field harus diisi';
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'Kata sandi baru dan konfirmasi tidak cocok';
			return;
		}

		if (newPassword.length < 6) {
			error = 'Kata sandi baru harus memiliki minimal 6 karakter';
			return;
		}

		isChangingPassword = true;
		error = null;

		try {
			// In a real implementation, you would call an API to change password
			// For now, we'll show a message that this would make an API call
			alert(
				'Fitur ganti kata sandi akan diintegrasikan dengan API backend. Simulasi: Kata sandi berhasil diubah.'
			);

			// Reset form
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';

			// Close modal
			showChangePasswordModal = false;
		} catch (err) {
			console.error('Error changing password:', err);
			error = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengganti kata sandi';
		} finally {
			isChangingPassword = false;
		}
	}
</script>

<div class="relative min-h-screen overflow-hidden text-secondary selection:bg-senary/30">
	<!-- Background -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
	></div>

	<!-- Main Content with Profile Navigation -->
	<main class="relative z-10 container mx-auto px-4 py-24">
		<div class="flex flex-col gap-8 md:flex-row">
			<!-- Sidebar with Profile Info -->
			<div class="w-full flex-shrink-0 md:w-72" in:fly={{ x: -20, duration: 800, delay: 200 }}>
				<!-- Profile Section with extended user info -->
				<div
					class="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
				>
					<div class="flex flex-col items-center text-center">
						<div class="relative">
							<Avatar class="size-24 border-2 border-senary shadow-[0_0_15px_rgba(212,175,55,0.3)]">
								{#if profileData?.photoProfile}
									<img src={profileData.photoProfile} alt={profileData?.displayName ?? 'User'} />
								{:else}
									<AvatarFallback class="bg-primary text-2xl text-senary">
										{profileData?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
									</AvatarFallback>
								{/if}
							</Avatar>
						</div>

						<div class="mt-4 w-full">
							<h2 class="truncate text-xl font-bold text-secondary">
								{profileData?.displayName ?? 'Pengguna'}
							</h2>
							<p class="truncate text-sm text-secondary/60">{profileData?.email}</p>

							<div class="mt-4 space-y-2 rounded-xl bg-black/20 p-3 text-sm">
								<p class="flex items-center justify-between">
									<span class="text-xs tracking-wider text-secondary/50 uppercase">Saldo</span>
									<span class="flex items-center gap-1 font-bold text-senary">
										<Wallet class="size-3" />
										{profileData?.coin ?? 0}
									</span>
								</p>
							</div>

							<div class="mt-6 space-y-3">
								<Button
									variant="outline"
									class="w-full border-white/10 bg-transparent text-secondary transition-all hover:border-senary/30 hover:bg-white/5 hover:text-senary"
									onclick={openEditModal}
								>
									Edit Profil
								</Button>
								<Button
									variant="outline"
									class="w-full border-white/10 bg-transparent text-secondary transition-all hover:border-senary/30 hover:bg-white/5 hover:text-senary"
									onclick={() => (showChangePasswordModal = true)}
								>
									Ganti Kata Sandi
								</Button>
								<Button
									variant="outline"
									class="w-full border-white/10 bg-transparent text-red-500 transition-all hover:border-red-500/30 hover:bg-white/5 hover:text-red-500"
									onclick={() => (showLogoutDialog = true)}
								>
									<LogOut class="mr-2 size-4" />
									Keluar
								</Button>
							</div>
						</div>
					</div>
				</div>

				<!-- Navigation Menu -->
				<div class="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
					<nav class="space-y-1">
						<a
							href="/profile/reservation"
							class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 {$page.url.pathname.startsWith(
								'/profile/reservation'
							)
								? 'border border-senary/20 bg-senary/10 text-senary'
								: 'border border-transparent text-secondary/70 hover:bg-white/5 hover:text-secondary'}"
						>
							<Calendar class="size-5" />
							<span>Reservasi</span>
						</a>
						<a
							href="/profile/coin"
							class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 {$page.url.pathname.startsWith(
								'/profile/coin'
							)
								? 'border border-senary/20 bg-senary/10 text-senary'
								: 'border border-transparent text-secondary/70 hover:bg-white/5 hover:text-secondary'}"
						>
							<Wallet class="size-5" />
							<span>Riwayat Koin</span>
						</a>
						<a
							href="/profile/voucher"
							class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 {$page.url.pathname.startsWith(
								'/profile/voucher'
							)
								? 'border border-senary/20 bg-senary/10 text-senary'
								: 'border border-transparent text-secondary/70 hover:bg-white/5 hover:text-secondary'}"
						>
							<Ticket class="size-5" />
							<span>Voucher Saya</span>
						</a>
					</nav>
				</div>
			</div>

			<!-- Main Content Area -->
			<div class="flex-grow" in:fly={{ x: 20, duration: 800, delay: 400 }}>
				<!-- Page Content -->
				<div
					class="min-h-[600px] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
				>
					{@render children()}
				</div>
			</div>
		</div>
	</main>

	<!-- Edit Profile Modal -->
	{#if showEditModal}
		<div class="fixed inset-0 z-[100] flex items-center justify-center p-4" in:fade>
			<div
				class="fixed inset-0 bg-black/80 backdrop-blur-sm"
				onclick={() => (showEditModal = false)}
			></div>
			<div
				class="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#05120e] p-6 shadow-2xl"
				in:fly={{ y: 20 }}
			>
				<h3 class="mb-6 text-xl font-bold text-secondary">Edit Profil</h3>

				{#if loading}
					<div class="animate-pulse space-y-4">
						{#each [1, 2] as _}
							<div class="h-12 w-full rounded-lg bg-white/5"></div>
						{/each}
					</div>
				{:else if profileData}
					<div class="space-y-4">
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-senary">
								<User class="size-4" />
								<label class="font-medium">Nama Lengkap</label>
							</div>
							<input
								type="text"
								class="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
								value={profileData.displayName}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									handleInputChange('displayName', target.value);
								}}
							/>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-senary">
								<Phone class="size-4" />
								<label class="font-medium">Nomor Telepon</label>
							</div>
							<input
								type="text"
								class="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
								value={profileData.phone}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									handleInputChange('phone', target.value);
								}}
							/>
						</div>
						{#if error}
							<div class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
								{error}
							</div>
						{/if}
					</div>

					<div class="mt-8 flex justify-end gap-3">
						<Button
							variant="ghost"
							class="text-secondary hover:bg-white/5 hover:text-white"
							onclick={() => (showEditModal = false)}
						>
							Batal
						</Button>
						<Button
							class="bg-senary text-primary hover:bg-senary/90"
							onclick={handleUpdateProfile}
							disabled={isUpdating}
						>
							{#if isUpdating}
								Menyimpan...
							{:else}
								Simpan Perubahan
							{/if}
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Change Password Modal -->
	{#if showChangePasswordModal}
		<div class="fixed inset-0 z-[100] flex items-center justify-center p-4" in:fade>
			<div
				class="fixed inset-0 bg-black/80 backdrop-blur-sm"
				onclick={() => (showChangePasswordModal = false)}
			></div>
			<div
				class="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#05120e] p-6 shadow-2xl"
				in:fly={{ y: 20 }}
			>
				<h3 class="mb-6 text-xl font-bold text-secondary">Ganti Kata Sandi</h3>

				{#if error && showChangePasswordModal}
					<div class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
						{error}
						selet
					</div>
				{/if}

				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-senary">
							<Lock class="size-4" />
							<label class="font-medium">Kata Sandi Saat Ini</label>
						</div>
						<div class="relative">
							<input
								type={showCurrentPassword ? 'text' : 'password'}
								class="w-full rounded-lg border border-white/10 bg-black/20 p-3 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
								placeholder="Masukkan kata sandi saat ini"
								value={currentPassword}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									currentPassword = target.value;
								}}
							/>
							<button
								type="button"
								class="absolute top-1/2 right-3 -translate-y-1/2 text-secondary/50 hover:text-senary"
								onclick={() => (showCurrentPassword = !showCurrentPassword)}
							>
								{#if showCurrentPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-senary">
							<Lock class="size-4" />
							<label class="font-medium">Kata Sandi Baru</label>
						</div>
						<div class="relative">
							<input
								type={showNewPassword ? 'text' : 'password'}
								class="w-full rounded-lg border border-white/10 bg-black/20 p-3 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
								placeholder="Masukkan kata sandi baru"
								value={newPassword}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									newPassword = target.value;
								}}
							/>
							<button
								type="button"
								class="absolute top-1/2 right-3 -translate-y-1/2 text-secondary/50 hover:text-senary"
								onclick={() => (showNewPassword = !showNewPassword)}
							>
								{#if showNewPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-senary">
							<Lock class="size-4" />
							<label class="font-medium">Konfirmasi Kata Sandi Baru</label>
						</div>
						<div class="relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								class="w-full rounded-lg border border-white/10 bg-black/20 p-3 pr-10 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
								placeholder="Konfirmasi kata sandi baru"
								value={confirmPassword}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									confirmPassword = target.value;
								}}
							/>
							<button
								type="button"
								class="absolute top-1/2 right-3 -translate-y-1/2 text-secondary/50 hover:text-senary"
								onclick={() => (showConfirmPassword = !showConfirmPassword)}
							>
								{#if showConfirmPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="mt-8 flex justify-end gap-3">
					<Button
						variant="ghost"
						class="text-secondary hover:bg-white/5 hover:text-white"
						onclick={() => (showChangePasswordModal = false)}
					>
						Batal
					</Button>
					<Button
						class="bg-senary text-primary hover:bg-senary/90"
						onclick={handleChangePassword}
						disabled={isChangingPassword}
					>
						{#if isChangingPassword}
							Menyimpan...
						{:else}
							Ganti Kata Sandi
						{/if}
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<LogoutDialog bind:open={showLogoutDialog} onConfirm={handleLogout} />
</div>
