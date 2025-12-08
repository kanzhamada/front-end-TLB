<script lang="ts">
	import { createBarber, editBarber, deleteBarber, type Barber } from '$lib/api/admin/barber';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { X, Loader2, User, Pencil, Trash2 } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import * as Select from '$lib/components/ui/select';
	import AdminConfirmDialog from '$lib/components/ui/AdminConfirmDialog.svelte';

	let { mode = $bindable(), barber, token, onClose, onUpdate } = $props<{
		mode: 'add' | 'edit' | 'view';
		barber: Barber | null;
		token: string;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let loading = $state(false);
	let name = $state(barber?.name || '');
	let experience = $state(barber?.experience || '');
	let phoneNumber = $state(barber?.phoneNumber || '');
	let description = $state(barber?.description || '');
	let active = $state(barber?.active !== false ? 'true' : 'false'); // Default to active
	let skills = $state(barber?.skills || '');

	$effect(() => {
		if (barber) {
			name = barber.name;
			experience = barber.experience || '';
			phoneNumber = barber.phoneNumber || '';
			description = barber.description || '';
			active = barber.active ? 'true' : 'false';
			skills = barber.skills || '';
		} else {
			name = '';
			experience = '';
			phoneNumber = '';
			description = '';
			active = 'true';
			skills = '';
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		const payload = {
			name,
			experience,
			phoneNumber,
			description,
			active: active === 'true',
			skills
		};

		let res;
		if (mode === 'add') {
			res = await createBarber(fetch, payload, token);
		} else if (mode === 'edit' && barber) {
			res = await editBarber(fetch, barber.id, payload, token);
		}

		if (res?.success) {
			toast.success(`Barber ${mode === 'add' ? 'created' : 'updated'} successfully`);
			onUpdate();
			onClose();
		} else {
			toast.error(res?.message || `Failed to ${mode} barber`);
		}
		loading = false;
	}

	// Delete Confirmation State
	let confirmOpen = $state(false);
	let deleteLoading = $state(false);

	function initiateDelete() {
		confirmOpen = true;
	}

	async function confirmDelete() {
		if (!barber) return;
		
		deleteLoading = true;
		const res = await deleteBarber(fetch, barber.id, token);
		
		if (res.success) {
			toast.success('Barber deleted successfully');
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || 'Failed to delete barber');
		}
		deleteLoading = false;
		confirmOpen = false;
	}

	const statusOptions = [
		{ value: 'true', label: 'Active' },
		{ value: 'false', label: 'Inactive' }
	];
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
	transition:fade={{ duration: 200 }}
	onclick={onClose}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<div
		class="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl"
		onclick={(e) => e.stopPropagation()}
		role="document"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		in:scale={{ start: 0.95, duration: 200, easing: quintOut }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
			<div>
				<h2 class="text-2xl font-bold tracking-tight text-secondary">
					{#if mode === 'add'}
						Add New <span class="text-senary">Barber</span>
					{:else if mode === 'edit'}
						Edit <span class="text-senary">Barber</span>
					{:else}
						Barber <span class="text-senary">Profile</span>
					{/if}
				</h2>
				<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
					{#if mode === 'add'}
						Register a new professional
					{:else if mode === 'edit'}
						Update barber information
					{:else}
						View detailed profile
					{/if}
				</p>
			</div>
			<button
				onclick={onClose}
				class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<div class="max-h-[75vh] overflow-y-auto px-8 py-8 no-scrollbar">
			{#if mode === 'view' && barber}
				<!-- View Mode -->
				<div class="flex flex-col items-center space-y-6">
					<div class="relative h-32 w-32 overflow-hidden rounded-full border-2 border-senary/50 shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]">
						<div class="flex h-full w-full items-center justify-center bg-white/5 text-secondary/30">
							<User class="h-12 w-12" />
						</div>
					</div>

					<div class="text-center">
						<h3 class="text-2xl font-bold text-secondary">{barber.name}</h3>
						<p class="text-senary">{barber.experience || 'N/A'} Experience</p>
						<div class="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
							<div class={`mr-2 h-2 w-2 rounded-full ${barber.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
							<span class="text-xs font-medium text-secondary/80">{barber.active ? 'Active' : 'Inactive'}</span>
						</div>
					</div>

					<div class="w-full space-y-4 rounded-2xl border border-white/5 bg-white/5 p-6">
						<div>
							<Label class="text-xs font-bold tracking-widest text-secondary/50 uppercase mb-1 block">Phone Number</Label>
							<p class="text-secondary">{barber.phoneNumber || 'N/A'}</p>
						</div>
						<div>
							<Label class="text-xs font-bold tracking-widest text-secondary/50 uppercase mb-1 block">Skills</Label>
							<p class="text-secondary">{barber.skills || 'N/A'}</p>
						</div>
						<div>
							<Label class="text-xs font-bold tracking-widest text-secondary/50 uppercase mb-1 block">Description</Label>
							<p class="text-secondary leading-relaxed">{barber.description || 'No description provided.'}</p>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex w-full gap-3 pt-2">
						<Button 
							variant="outline" 
							class="flex-1 border-white/10 bg-transparent text-secondary hover:bg-white/5 hover:text-white"
							onclick={() => mode = 'edit'}
						>
							<Pencil class="mr-2 h-4 w-4" />
							Edit Profile
						</Button>
						<Button 
							variant="destructive" 
							class="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
							onclick={initiateDelete}
							disabled={loading}
						>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								<Trash2 class="mr-2 h-4 w-4" />
							{/if}
							Delete Barber
						</Button>
					</div>
				</div>
			{:else}
				<!-- Add/Edit Mode -->
				<form onsubmit={handleSubmit} class="space-y-6">
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="name" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Name</Label>
							<Input 
								id="name" 
								bind:value={name} 
								placeholder="e.g. John Doe" 
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20" 
								required 
							/>
						</div>
						<div class="space-y-2">
							<Label for="experience" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Experience</Label>
							<Input 
								id="experience" 
								bind:value={experience} 
								placeholder="e.g. 5 Years" 
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20" 
							/>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="phone" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Phone Number</Label>
							<Input 
								id="phone" 
								bind:value={phoneNumber} 
								placeholder="e.g. +1 234 567 890" 
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20" 
							/>
						</div>
						<div class="space-y-2">
							<Label for="status" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Status</Label>
							<Select.Root type="single" bind:value={active}>
								<Select.Trigger class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary focus:border-senary/50 focus:ring-senary/20">
									{statusOptions.find(o => o.value === active)?.label || 'Select Status'}
								</Select.Trigger>
								<Select.Content class="border-white/10 bg-slate-900 text-secondary">
									{#each statusOptions as option}
										<Select.Item 
											value={option.value} 
											label={option.label}
											class="focus:bg-white/10 focus:text-senary cursor-pointer"
										>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="skills" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Skills</Label>
						<Input 
							id="skills" 
							bind:value={skills} 
							placeholder="e.g. Fade, Scissor Cut" 
							class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20" 
						/>
					</div>

					<div class="space-y-2">
						<Label for="description" class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Description</Label>
						<Textarea 
							id="description" 
							bind:value={description} 
							placeholder="Brief bio or specializations..." 
							class="min-h-[100px] rounded-xl border-white/10 bg-white/5 p-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20" 
						/>
					</div>

					<div class="flex justify-end gap-3 pt-6 border-t border-white/10">
						<Button 
							type="button" 
							variant="outline" 
							onclick={onClose} 
							disabled={loading}
							class="border-white/10 bg-transparent text-secondary hover:bg-white/5 hover:text-white"
						>
							Cancel
						</Button>
						<Button 
							type="submit" 
							class="bg-senary text-primary hover:bg-senary/90 font-bold tracking-wide min-w-[120px]" 
							disabled={loading}
						>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							{mode === 'add' ? 'Create' : 'Save Changes'}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>

	<AdminConfirmDialog 
		bind:open={confirmOpen}
		title="Delete Barber"
		description="Are you sure you want to delete this barber? This action cannot be undone."
		variant="destructive"
		confirmText="Delete"
		loading={deleteLoading}
		onConfirm={confirmDelete}
	/>
</div>
