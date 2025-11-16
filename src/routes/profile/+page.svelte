<script lang="ts">
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';

	// Get user profile from auth store
	const userProfile = get(authStore).session?.user;
</script>

<div>
	<h2 class="mb-4 text-xl font-bold text-gray-800">Informasi Profil</h2>

	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
			<p class="mt-1 text-gray-900">{userProfile?.display_name ?? '-'}</p>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700">Email</label>
			<p class="mt-1 text-gray-900">{userProfile?.email ?? '-'}</p>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700">Nomor Telepon</label>
			<p class="mt-1 text-gray-900">{userProfile?.phone ?? '-'}</p>
		</div>
	</div>
</div>
