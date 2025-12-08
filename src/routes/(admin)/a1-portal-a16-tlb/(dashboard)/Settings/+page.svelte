<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { getSettings, updateSettings, type WebsiteSettings } from '$lib/api/admin/settings';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { Loader2, Save } from 'lucide-svelte';

	let { data } = $props();

	let loading = $state(false);
	let pageLoading = $state(true);
	let settings = $state<WebsiteSettings>({
		admin_fee: 0,
		vision: '',
		mission: '',
		location: '',
		maps_link: '',
		phone: '',
		instagram: ''
	});

	onMount(async () => {
		const res = await getSettings(fetch);
		if (res.success && res.data) {
			settings = res.data;
		} else {
			toast.error(res.message || 'Failed to load settings');
		}
		pageLoading = false;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		const token = data.session?.access_token || '';

		const payload = {
			...settings,
			admin_fee: Number(settings.admin_fee)
		};

		const res = await updateSettings(fetch, payload, token);
		
		if (res.success) {
			toast.success('Website settings updated successfully');
			if (res.data) settings = res.data;
		} else {
			toast.error(res.message || 'Failed to update settings');
		}
		loading = false;
	}
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30">
	<!-- Header -->
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		
		<div class="relative z-10 mx-auto max-w-[1600px]">
			<div class="flex items-center gap-4 mb-4">
				<div class="h-[1px] w-12 bg-senary"></div>
				<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Configuration</p>
			</div>

			<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
				Website <span class="text-senary">Settings</span>
			</h1>
			<p class="mt-4 max-w-xl font-light text-secondary/70">
				Manage global configurations, contact information, and brand messaging.
			</p>
		</div>
	</div>

	<div class="px-8 pb-20">
		<div class="mx-auto max-w-[1600px]">
			{#if pageLoading}
				<div class="flex h-60 items-center justify-center">
					<Loader2 class="h-8 w-8 animate-spin text-senary" />
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-8">
					<!-- General Section -->
					<div class="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
						<h3 class="mb-6 text-xl font-bold text-secondary flex items-center gap-3">
							<span class="h-1.5 w-1.5 rounded-full bg-senary"></span>
							General Information
						</h3>
						
						<div class="grid gap-6">
							<div class="space-y-2">
								<Label for="admin_fee" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Admin Fee (IDR)</Label>
								<Input 
									id="admin_fee" 
									type="number" 
									bind:value={settings.admin_fee}
									class="h-14 rounded-xl border-white/10 bg-black/20 px-4 text-lg text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								/>
							</div>
						</div>
					</div>

					<!-- Brand Section -->
					<div class="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
						<h3 class="mb-6 text-xl font-bold text-secondary flex items-center gap-3">
							<span class="h-1.5 w-1.5 rounded-full bg-senary"></span>
							Brand & Vision
						</h3>
						
						<div class="grid gap-6">
							<div class="space-y-2">
								<Label for="vision" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Vision</Label>
								<Textarea 
									id="vision" 
									bind:value={settings.vision}
									class="min-h-[120px] rounded-xl border-white/10 bg-black/20 p-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20 leading-relaxed"
								/>
							</div>

							<div class="space-y-2">
								<Label for="mission" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Mission</Label>
								<Textarea 
									id="mission" 
									bind:value={settings.mission}
									class="min-h-[120px] rounded-xl border-white/10 bg-black/20 p-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20 leading-relaxed"
								/>
							</div>
						</div>
					</div>

					<!-- Contact Section -->
					<div class="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
						<h3 class="mb-6 text-xl font-bold text-secondary flex items-center gap-3">
							<span class="h-1.5 w-1.5 rounded-full bg-senary"></span>
							Contact & Location
						</h3>
						
						<div class="grid gap-6 md:grid-cols-2">
							<div class="md:col-span-2 space-y-2">
								<Label for="location" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Address / Location</Label>
								<Input 
									id="location" 
									bind:value={settings.location}
									class="h-14 rounded-xl border-white/10 bg-black/20 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								/>
							</div>

							<div class="md:col-span-2 space-y-2">
								<Label for="maps" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Google Maps Embed Link</Label>
								<Input 
									id="maps" 
									bind:value={settings.maps_link}
									placeholder="https://www.google.com/maps/embed?..."
									class="h-14 rounded-xl border-white/10 bg-black/20 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								/>
								<p class="text-[10px] text-secondary/40">* Paste the src URL from the Google Maps 'Embed a map' HTML</p>
							</div>

							<div class="space-y-2">
								<Label for="phone" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Phone Number</Label>
								<Input 
									id="phone" 
									bind:value={settings.phone}
									class="h-14 rounded-xl border-white/10 bg-black/20 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								/>
							</div>

							<div class="space-y-2">
								<Label for="instagram" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Instagram</Label>
								<Input 
									id="instagram" 
									bind:value={settings.instagram}
									placeholder="@username"
									class="h-14 rounded-xl border-white/10 bg-black/20 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								/>
							</div>
						</div>
					</div>

					<div class="flex justify-end pt-4">
						<Button 
							type="submit" 
							class="h-14 min-w-[200px] bg-senary text-lg font-bold tracking-wide text-primary hover:bg-senary/90 shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.5)] transition-all duration-300 rounded-xl"
							disabled={loading}
						>
							{#if loading}
								<Loader2 class="mr-2 h-5 w-5 animate-spin" />
								Saving...
							{:else}
								<Save class="mr-2 h-5 w-5" />
								Save Settings
							{/if}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>
