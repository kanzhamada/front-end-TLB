<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { UserProfile } from '$lib/stores/auth';
	import { authStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
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
	import { LogOut, Settings, Wallet, Calendar, Ticket, User, Mail, Phone, Lock } from 'lucide-svelte';
	import { getProfile, updateProfile, type ProfileData } from '$lib/api/customer/profile';

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
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await getProfile(token);
			if (!response.success || !response.data) {
				throw new Error(response.message || 'Failed to load profile');
			}

			profileData = response.data;
		} catch (err) {
			console.error('Error loading profile for edit:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading profile';
		} finally {
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
			alert('Fitur ganti kata sandi akan diintegrasikan dengan API backend. Simulasi: Kata sandi berhasil diubah.');

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

<div class="min-h-screen bg-[#e8ddd4]">
	<!-- Main Content with Profile Navigation -->
	<main class="container mx-auto px-4 py-8">
		<div class="flex flex-col gap-8 md:flex-row">
			<!-- Sidebar with Profile Info -->
			<div class="w-full flex-shrink-0 md:w-64">
				<!-- Profile Section with extended user info -->
				<div class="mb-6 rounded-xl bg-white p-6 shadow-md">
					<div class="flex flex-col items-center text-center">
						<Avatar class="size-20 border-2 border-[#2e6057]">
							<AvatarFallback class="bg-[#2e6057]/10 text-xl text-[#2e6057]">
								{userProfile?.display_name?.charAt(0) ?? 'U'}
							</AvatarFallback>
						</Avatar>
						<div class="mt-3 w-full">
							<h2 class="text-lg font-semibold text-gray-800 truncate">
								{userProfile?.display_name ?? 'Pengguna'}
							</h2>
							<p class="truncate text-sm text-gray-500">{userProfile?.email}</p>
							<div class="mt-2 space-y-1 text-xs text-gray-600">
								{#if userProfile?.phone}
									<p class="truncate">Telp: {userProfile.phone}</p>
								{/if}
								<p class="flex items-center justify-center gap-1">
									<span class="font-medium">Koin:</span>
									<span class="font-bold text-[#2e6057]">{userProfile?.coins ?? 0}</span>
								</p>
							</div>
							<div class="mt-3 space-y-2">
								<Button
									variant="outline"
									class="w-full border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
									onclick={openEditModal}
								>
									Ubah Profil
								</Button>
								<Button
									variant="outline"
									class="w-full border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
									onclick={() => (showChangePasswordModal = true)}
								>
									Ganti Kata Sandi
								</Button>
							</div>
						</div>
					</div>
				</div>

				<!-- Navigation Menu -->
				<div class="rounded-xl bg-white p-2 shadow-md">
					<nav class="space-y-1">
						<a
							href="/profile/reservation"
							class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
								'/profile/reservation'
							)
								? 'bg-[#2e6057]/10 text-[#2e6057]'
								: 'text-gray-700 hover:bg-gray-100'}"
						>
							<Calendar class="size-5" />
							<span>Reservasi</span>
						</a>
						<a
							href="/profile/coin"
							class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
								'/profile/coin'
							)
								? 'bg-[#2e6057]/10 text-[#2e6057]'
								: 'text-gray-700 hover:bg-gray-100'}"
						>
							<Wallet class="size-5" />
							<span>Riwayat Koin</span>
						</a>
						<a
							href="/profile/voucher"
							class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
								'/profile/voucher'
							)
								? 'bg-[#2e6057]/10 text-[#2e6057]'
								: 'text-gray-700 hover:bg-gray-100'}"
						>
							<Ticket class="size-5" />
							<span>Voucher Saya</span>
						</a>
					</nav>
				</div>

				<!-- Logout Section -->
				<div class="mt-6 rounded-xl bg-white p-4 shadow-md">
					<Button
						variant="ghost"
						class="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
						onclick={handleLogout}
					>
						<LogOut class="mr-2 size-4" />
						Keluar
					</Button>
				</div>
			</div>

			<!-- Main Content Area -->
			<div class="flex-grow">
				<!-- Page Content -->
				<div class="rounded-xl bg-white p-6 shadow-md">
					{@render children()}
				</div>
			</div>
		</div>
	</main>

	<!-- Edit Profile Modal -->
	{#if showEditModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div class="fixed inset-0 bg-black/50" onclick={() => (showEditModal = false)}></div>
			<div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-semibold">Ubah Profil</h3>

				{#if loading}
					<div class="animate-pulse space-y-4">
						{#each [1, 2] as _}
							<div class="h-4 w-full rounded bg-gray-200"></div>
						{/each}
					</div>
				{:else if error}
					<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-500">
						{error}
					</div>
				{:else if profileData}
					<div class="space-y-4">
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-500">
								<User class="size-4" />
								<label class="font-medium">Nama Lengkap</label>
							</div>
							<input
								type="text"
								class="w-full rounded border border-gray-300 p-2 focus:border-[#2e6057] focus:outline-none focus:ring-1 focus:ring-[#2e6057]"
								value={profileData.displayName}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									handleInputChange('displayName', target.value);
								}}
							/>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-500">
								<Mail class="size-4" />
								<label class="font-medium">Email</label>
							</div>
							<input
								type="text"
								class="w-full rounded border border-gray-300 p-2 focus:border-[#2e6057] focus:outline-none focus:ring-1 focus:ring-[#2e6057]"
								value={profileData.email}
								disabled
							/>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-500">
								<Phone class="size-4" />
								<label class="font-medium">Nomor Telepon</label>
							</div>
							<input
								type="text"
								class="w-full rounded border border-gray-300 p-2 focus:border-[#2e6057] focus:outline-none focus:ring-1 focus:ring-[#2e6057]"
								value={profileData.phone}
								oninput={(e) => {
									const target = e.target as HTMLInputElement;
									handleInputChange('phone', target.value);
								}}
							/>
						</div>
					</div>

					<div class="mt-6 flex justify-end gap-2">
						<Button
							variant="outline"
							class="border-gray-300 text-gray-700 hover:bg-gray-100"
							onclick={() => (showEditModal = false)}
						>
							Batal
						</Button>
						<Button
							class="bg-[#2e6057] hover:bg-[#2e6057]/80"
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
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div class="fixed inset-0 bg-black/50" onclick={() => (showChangePasswordModal = false)}></div>
			<div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-semibold">Ganti Kata Sandi</h3>

				{#if error && showChangePasswordModal}
					<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-500">
						{error}
					</div>
				{/if}

				<div class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-gray-500">
							<Lock class="size-4" />
							<label class="font-medium">Kata Sandi Saat Ini</label>
						</div>
						<input
							type="password"
							class="w-full rounded border border-gray-300 p-2 focus:border-[#2e6057] focus:outline-none focus:ring-1 focus:ring-[#2e6057]"
							placeholder="Masukkan kata sandi saat ini"
							value={currentPassword}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								currentPassword = target.value;
							}}
						/>
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-gray-500">
							<Lock class="size-4" />
							<label class="font-medium">Kata Sandi Baru</label>
						</div>
						<input
							type="password"
							class="w-full rounded border border-gray-300 p-2 focus:border-[#2e6057] focus:outline-none focus:ring-1 focus:ring-[#2e6057]"
							placeholder="Masukkan kata sandi baru"
							value={newPassword}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								newPassword = target.value;
							}}
						/>
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-gray-500">
							<Lock class="size-4" />
							<label class="font-medium">Konfirmasi Kata Sandi Baru</label>
						</div>
						<input
							type="password"
							class="w-full rounded border border-gray-300 p-2 focus:border-[#2e6057] focus:outline-none focus:ring-1 focus:ring-[#2e6057]"
							placeholder="Konfirmasi kata sandi baru"
							value={confirmPassword}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								confirmPassword = target.value;
							}}
						/>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-2">
					<Button
						variant="outline"
						class="border-gray-300 text-gray-700 hover:bg-gray-100"
						onclick={() => (showChangePasswordModal = false)}
					>
						Batal
					</Button>
					<Button
						class="bg-[#2e6057] hover:bg-[#2e6057]/80"
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
</div>
