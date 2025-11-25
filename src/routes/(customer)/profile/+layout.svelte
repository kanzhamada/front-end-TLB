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
		Sparkles
	} from 'lucide-svelte';
	import { getProfile, updateProfile, type ProfileData } from '$lib/api/customer/profile';
	import { fade, fly } from 'svelte/transition';

	let { children } = $props();

	// State variables
	let showEditModal = $state(false);
	let showChangePasswordModal = $state(false);
	let profileData = $state<ProfileData | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let isUpdating = $state(false);
	let isChangingPassword = $state(false);
	// For change password form
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// Get user profile from auth store
	const userProfile: UserProfile | null = get(authStore).session?.user || null;

	function handleLogout() {
		authStore.clear();
		goto('/auth/login');
	}

	// Load profile for editing
	async function loadProfileForEdit() {
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
		} catch (err) {
			console.error('Error loading profile for edit:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading profile';
		} finally {
			console.debug('Setting loading to false.');
			loading = false;
		}
	}

	// Handle opening edit modal
	function openEditModal() {
		loadProfileForEdit();
		showEditModal = true;
	}

	// Handle profile update
	async function handleUpdateProfile() {
		if (!profileData) return;

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
								<AvatarFallback class="bg-primary text-2xl text-senary">
									{userProfile?.display_name?.charAt(0) ?? 'U'}
								</AvatarFallback>
							</Avatar>
							<div
								class="absolute -right-2 -bottom-2 rounded-full bg-senary p-1.5 text-primary shadow-lg"
							>
								<Sparkles class="size-4" />
							</div>
						</div>

						<div class="mt-4 w-full">
							<h2 class="truncate text-xl font-bold text-secondary">
								{userProfile?.display_name ?? 'Pengguna'}
							</h2>
							<p class="truncate text-sm text-secondary/60">{userProfile?.email}</p>

							<div class="mt-4 space-y-2 rounded-xl bg-black/20 p-3 text-sm">
								{#if userProfile?.phone}
									<p class="flex items-center justify-between text-secondary/80">
										<span class="text-xs tracking-wider text-secondary/50 uppercase">Phone</span>
										<span>{userProfile.phone}</span>
									</p>
								{/if}
								<div class="h-[1px] w-full bg-white/5"></div>
								<p class="flex items-center justify-between">
									<span class="text-xs tracking-wider text-secondary/50 uppercase">Balance</span>
									<span class="flex items-center gap-1 font-bold text-senary">
										<Wallet class="size-3" />
										{userProfile?.coin ?? 0}
									</span>
								</p>
							</div>

							<div class="mt-6 space-y-3">
								<Button
									variant="outline"
									class="w-full border-white/10 bg-transparent text-secondary transition-all hover:border-senary/30 hover:bg-white/5 hover:text-senary"
									onclick={openEditModal}
								>
									Edit Profile
								</Button>
								<Button
									variant="outline"
									class="w-full border-white/10 bg-transparent text-secondary transition-all hover:border-senary/30 hover:bg-white/5 hover:text-senary"
									onclick={() => (showChangePasswordModal = true)}
								>
									Change Password
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
							<span>Reservations</span>
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
							<span>Coin History</span>
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
							<span>My Vouchers</span>
						</a>
					</nav>
				</div>

				<!-- Logout Section -->
				<div class="mt-6">
					<Button
						variant="ghost"
						class="w-full justify-start text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
						onclick={handleLogout}
					>
						<LogOut class="mr-2 size-4" />
						Sign Out
					</Button>
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
				<h3 class="mb-6 text-xl font-bold text-secondary">Edit Profile</h3>

				{#if loading}
					<div class="animate-pulse space-y-4">
						{#each [1, 2] as _}
							<div class="h-12 w-full rounded-lg bg-white/5"></div>
						{/each}
					</div>
				{:else if error}
					<div class="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
						{error} suelet
					</div>
				{:else if profileData}
					<div class="space-y-4">
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-senary">
								<User class="size-4" />
								<label class="font-medium">Full Name</label>
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
								<Mail class="size-4" />
								<label class="font-medium">Email</label>
							</div>
							<input
								type="text"
								class="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-secondary/50"
								value={profileData.email}
								disabled
							/>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-senary">
								<Phone class="size-4" />
								<label class="font-medium">Phone Number</label>
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
					</div>

					<div class="mt-8 flex justify-end gap-3">
						<Button
							variant="ghost"
							class="text-secondary hover:bg-white/5 hover:text-white"
							onclick={() => (showEditModal = false)}
						>
							Cancel
						</Button>
						<Button
							class="bg-senary text-primary hover:bg-senary/90"
							onclick={handleUpdateProfile}
							disabled={isUpdating}
						>
							{#if isUpdating}
								Saving...
							{:else}
								Save Changes
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
				<h3 class="mb-6 text-xl font-bold text-secondary">Change Password</h3>

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
							<label class="font-medium">Current Password</label>
						</div>
						<input
							type="password"
							class="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
							placeholder="Enter current password"
							value={currentPassword}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								currentPassword = target.value;
							}}
						/>
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-senary">
							<Lock class="size-4" />
							<label class="font-medium">New Password</label>
						</div>
						<input
							type="password"
							class="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
							placeholder="Enter new password"
							value={newPassword}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								newPassword = target.value;
							}}
						/>
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-senary">
							<Lock class="size-4" />
							<label class="font-medium">Confirm New Password</label>
						</div>
						<input
							type="password"
							class="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-1 focus:ring-senary/20 focus:outline-none"
							placeholder="Confirm new password"
							value={confirmPassword}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								confirmPassword = target.value;
							}}
						/>
					</div>
				</div>

				<div class="mt-8 flex justify-end gap-3">
					<Button
						variant="ghost"
						class="text-secondary hover:bg-white/5 hover:text-white"
						onclick={() => (showChangePasswordModal = false)}
					>
						Cancel
					</Button>
					<Button
						class="bg-senary text-primary hover:bg-senary/90"
						onclick={handleChangePassword}
						disabled={isChangingPassword}
					>
						{#if isChangingPassword}
							Saving...
						{:else}
							Change Password
						{/if}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
