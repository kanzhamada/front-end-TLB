<script lang="ts">
	import { goto } from '$app/navigation';
	import type { UserProfile } from '$lib/stores/auth';
	import { authStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';

	let { children } = $props();

	// Get user profile from auth store
	const userProfile: UserProfile | null = get(authStore).session?.user || null;

	function handleLogout() {
		authStore.clear();
		goto('/auth/login');
	}
</script>

<div class="min-h-screen bg-[#e8ddd4]">
	<!-- Header -->
	<header class="bg-[#2e6057] py-4">
		<div class="container mx-auto px-4">
			<div class="flex items-center justify-between">
				<h1 class="text-xl font-bold text-white">Profil</h1>
				<button
					onclick={handleLogout}
					class="rounded-md bg-white px-3 py-1 text-sm font-medium text-[#2e6057] hover:bg-gray-100"
				>
					Keluar
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="mb-6 rounded-lg bg-white p-6 shadow-md">
			<div class="flex items-center gap-4">
				<div
					class="flex size-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700"
				>
					{userProfile?.display_name?.charAt(0) ?? 'U'}
				</div>
				<div>
					<h2 class="text-xl font-semibold text-gray-800">
						{userProfile?.display_name ?? 'Pengguna'}
					</h2>
					<p class="text-gray-600">{userProfile?.email}</p>
				</div>
			</div>
		</div>

		<!-- Navigation Tabs -->
		<div class="mb-6 flex border-b border-gray-200">
			<a href="/profile" class="mr-6 pb-3 text-sm font-medium text-gray-500 hover:text-[#2e6057]">
				Profil
			</a>
			<a
				href="/profile/reservation"
				class="mr-6 pb-3 text-sm font-medium text-gray-500 hover:text-[#2e6057]"
			>
				Reservasi
			</a>
			<a
				href="/profile/coin"
				class="mr-6 pb-3 text-sm font-medium text-gray-500 hover:text-[#2e6057]"
			>
				Riwayat Koin
			</a>
			<a
				href="/profile/voucher"
				class="mr-6 pb-3 text-sm font-medium text-gray-500 hover:text-[#2e6057]"
			>
				Voucher
			</a>
		</div>

		<!-- Page Content -->
		<div class="rounded-lg bg-white p-6 shadow-md">
			{@render children()}
		</div>
	</main>
</div>
