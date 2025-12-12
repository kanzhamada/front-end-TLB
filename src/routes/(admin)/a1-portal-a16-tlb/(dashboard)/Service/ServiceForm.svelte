<script lang="ts">
	import { createService, editService, deleteService, type Service } from '$lib/api/admin/service';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { X, Loader2, Scissors, Pencil, Trash2, Coins } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let {
		mode = $bindable(),
		service,
		token,
		onClose,
		onUpdate
	} = $props<{
		mode: 'add' | 'edit' | 'view';
		service: Service | null;
		token: string;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let loading = $state(false);
	let name = $state(service?.name || '');
	let price = $state(service?.price?.toString() || '');
	let description = $state(service?.description || '');
	let attainableCoin = $state(service?.attainableCoin?.toString() || '0');

	$effect(() => {
		if (service) {
			name = service.name;
			price = service.price?.toString() || '';
			description = service.description || '';
			attainableCoin = service.attainableCoin?.toString() || '0';
		} else {
			name = '';
			price = '';
			description = '';
			attainableCoin = '0';
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		const payload = {
			name,
			price: Number(price),
			description,
			attainableCoin: Number(attainableCoin)
		};

		let res;
		if (mode === 'add') {
			res = await createService(fetch, payload, token);
		} else if (mode === 'edit' && service) {
			res = await editService(fetch, service.id, payload, token);
		}

		if (res?.success) {
			toast.success(`Service ${mode === 'add' ? 'created' : 'updated'} successfully`);
			onUpdate();
			onClose();
		} else {
			toast.error(res?.message || `Failed to ${mode} service`);
		}
		loading = false;
	}

	async function handleDelete() {
		if (!service) return;
		if (!confirm('Are you sure you want to delete this service?')) return;

		loading = true;
		const res = await deleteService(fetch, service.id, token);

		if (res.success) {
			toast.success('Service deleted successfully');
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || 'Failed to delete service');
		}
		loading = false;
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	};
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
						Add New <span class="text-senary">Service</span>
					{:else if mode === 'edit'}
						Edit <span class="text-senary">Service</span>
					{:else}
						Service <span class="text-senary">Details</span>
					{/if}
				</h2>
				<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
					{#if mode === 'add'}
						Create a new service offering
					{:else if mode === 'edit'}
						Update service information
					{:else}
						View service information
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
			{#if mode === 'view' && service}
				<!-- View Mode -->
				<div class="flex flex-col items-center space-y-6">
					<div
						class="relative h-32 w-32 overflow-hidden rounded-full border-2 border-senary/50 shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]"
					>
						<div
							class="flex h-full w-full items-center justify-center bg-white/5 text-secondary/30"
						>
							<Scissors class="h-12 w-12" />
						</div>
					</div>

					<div class="text-center">
						<h3 class="text-2xl font-bold text-secondary">{service.name}</h3>
						<p class="text-senary text-xl font-medium mt-1">{formatCurrency(service.price)}</p>

						{#if (service.attainableCoin ?? 0) > 0}
							<div
								class="mt-3 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1"
							>
								<Coins class="mr-2 h-3 w-3 text-yellow-500" />
								<span class="text-xs font-medium text-yellow-500"
									>+{service.attainableCoin} Coins</span
								>
							</div>
						{/if}
					</div>

					<div class="w-full space-y-4 rounded-2xl border border-white/5 bg-white/5 p-6">
						<div>
							<Label
								class="text-xs font-bold tracking-widest text-secondary/50 uppercase mb-1 block"
								>Description</Label
							>
							<p class="text-secondary leading-relaxed">
								{service.description || 'No description provided.'}
							</p>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex w-full gap-3 pt-2">
						<Button
							variant="outline"
							class="flex-1 border-white/10 bg-transparent text-secondary hover:bg-white/5 hover:text-white"
							onclick={() => (mode = 'edit')}
						>
							<Pencil class="mr-2 h-4 w-4" />
							Edit Service
						</Button>
						<Button
							variant="destructive"
							class="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
							onclick={handleDelete}
							disabled={loading}
						>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								<Trash2 class="mr-2 h-4 w-4" />
							{/if}
							Delete Service
						</Button>
					</div>
				</div>
			{:else}
				<!-- Add/Edit Mode -->
				<form onsubmit={handleSubmit} class="space-y-6">
					<div class="space-y-2">
						<Label for="name" class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
							>Service Name</Label
						>
						<Input
							id="name"
							bind:value={name}
							placeholder="e.g. Premium Haircut"
							class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
							required
						/>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label
								for="price"
								class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
								>Price (IDR)</Label
							>
							<Input
								id="price"
								type="number"
								bind:value={price}
								placeholder="e.g. 100000"
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								required
							/>
						</div>
						<div class="space-y-2">
							<Label
								for="coins"
								class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
								>Attainable Coins</Label
							>
							<Input
								id="coins"
								type="number"
								bind:value={attainableCoin}
								placeholder="e.g. 10"
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label
							for="description"
							class="text-xs font-bold tracking-widest text-secondary/70 uppercase"
							>Description</Label
						>
						<Textarea
							id="description"
							bind:value={description}
							placeholder="Describe the service details..."
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
</div>
