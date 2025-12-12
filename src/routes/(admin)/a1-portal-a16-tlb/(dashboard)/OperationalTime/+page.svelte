<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { 
		Plus, 
		Calendar as CalendarIcon, 
		Clock, 
		Save, 
		Loader2, 
		Trash2, 
		AlertCircle,
		CalendarDays,
		Repeat,
		Settings2
	} from 'lucide-svelte';
	import { 
		getOperationalTimes, 
		getSchedule, 
		updateSchedule,
		type OperationalTime, 
		type WeeklySchedule 
	} from '$lib/api/admin/operationalTime';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { CalendarDate, getLocalTimeZone, today, parseDate, type DateValue } from '@internationalized/date';
	import OperationalModal from './OperationalModal.svelte';
	import { cn } from "$lib/utils";
	import { fade, slide } from 'svelte/transition';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	// State
	let isLoading = $state(false);
	let isSavingSchedule = $state(false);

	// Daily Operational State
	let operationalTimes = $state<OperationalTime[]>([]);
	let selectedDate = $state<CalendarDate | undefined>(today(getLocalTimeZone()));
	let modalOpen = $state(false);
	let selectedOperational = $state<OperationalTime | null>(null);

	// Weekly Schedule State
	let weeklySchedule = $state<WeeklySchedule>({
		sunday: ['10:00'],
		monday: ['10:00'],
		tuesday: ['10:00'],
		wednesday: ['10:00'],
		thursday: ['10:00'],
		friday: ['10:00'],
		saturday: ['10:00']
	});

	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

	// Load Data
	async function loadDailyData() {
		if (!token) return;
		isLoading = true;
		const res = await getOperationalTimes(fetch, token);
		if (res.success && res.data) {
			operationalTimes = res.data;
		}
		isLoading = false;
	}

	async function loadWeeklyData() {
		if (!token) return;
		isLoading = true;
		const res = await getSchedule(fetch, token);
		if (res.success && res.data) {
			// Normalize data: map array response to object structure
			const rawData = res.data as unknown as any[];
			const normalized: any = {};
			
			// Initialize with empty arrays
			days.forEach(day => normalized[day] = []);

			if (Array.isArray(rawData)) {
				rawData.forEach(item => {
					if (item.day && days.includes(item.day.toLowerCase())) {
						const dayKey = item.day.toLowerCase();
						// Handle hours: convert null to [], and format HH:MM:SS to HH:MM
						const hours = Array.isArray(item.hours) 
							? item.hours.map((t: string) => t.substring(0, 5)) 
							: [];
						normalized[dayKey] = hours;
					}
				});
			}
			
			weeklySchedule = normalized as WeeklySchedule;
		} else {
			console.log('Weekly schedule not found or failed to load, using default.');
		}
		isLoading = false;
	}

	$effect(() => {
		if (token) {
			loadDailyData();
			loadWeeklyData();
		}
	});

	// Daily Logic
	const scheduledDates = $derived(
		operationalTimes.map((ot) => {
			const [year, month, day] = ot.date.split('-').map(Number);
			return new CalendarDate(year, month, day);
		})
	);

	// Simplified isScheduled check
	const isScheduled = (date: any) => {
		if (!date) return false;
		const dateStr = date.toString(); // CalendarDate.toString() gives YYYY-MM-DD
		return operationalTimes.some((ot) => ot.date === dateStr);
	};

	function handleDateSelect(date: DateValue | undefined) {
		if (!date) return;
		selectedDate = date as CalendarDate;
		const dateStr = date.toString();
		const existing = operationalTimes.find(ot => ot.date === dateStr);
		
		selectedOperational = existing || null;
		modalOpen = true;
	}

	function handleModalUpdate() {
		loadDailyData();
	}

	// Weekly Logic
	function addWeeklySlot(day: keyof WeeklySchedule) {
		const times = weeklySchedule[day] || [];
		if (times.length === 0) {
			weeklySchedule[day] = [...times, '12:00'];
		} else {
			const lastTime = times[times.length - 1];
			const [hoursStr, minutesStr] = lastTime.split(':');
			let hours = parseInt(hoursStr, 10);
			const minutes = minutesStr || '00';
			
			hours = (hours + 1) % 24;
			const nextTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
			
			weeklySchedule[day] = [...times, nextTime];
		}
	}

	function removeWeeklySlot(day: keyof WeeklySchedule, index: number) {
		weeklySchedule[day] = weeklySchedule[day].filter((_, i) => i !== index);
	}

	function updateWeeklySlot(day: keyof WeeklySchedule, index: number, value: string) {
		weeklySchedule[day][index] = value;
	}

	async function saveWeeklySchedule() {
		if (!token) return;
		isSavingSchedule = true;
		const res = await updateSchedule(fetch, weeklySchedule, token);
		if (res.success) {
			toast.success('Weekly schedule template updated successfully');
		} else {
			toast.error(res.message || 'Failed to update weekly schedule');
		}
		isSavingSchedule = false;
	}
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30 pb-20">
	<!-- Hero Header -->
	<div class="relative w-full overflow-hidden px-8 pt-6 pb-2">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		
		<div class="relative z-10 mx-auto max-w-[1600px]">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="h-[1px] w-12 bg-senary"></div>
					<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Admin Portal</p>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-senary">{operationalTimes.length}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Active Overrides</p>
				</div>
			</div>

			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Operational <span class="text-senary">Management</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Manage your recurring weekly schedule and specific daily availability.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8">
		<div class="mx-auto max-w-[1800px]">
			<!-- Dashboard Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
				
				<!-- Column 1: Calendar -->
				<div class="space-y-3">
					<h2 class="text-base font-bold text-white flex items-center gap-2">
						<div class="p-1.5 bg-senary/10 rounded-md text-senary">
							<CalendarDays class="h-3.5 w-3.5" />
						</div>
						Calendar
					</h2>
					<div class="bg-black/40 rounded-3xl border border-white/5 p-5 backdrop-blur-md h-[400px] flex flex-col">
						<div class="flex items-center justify-between mb-2 shrink-0">
							<span class="text-xs text-secondary/70">Select date</span>
							<div class="flex items-center gap-1.5 text-[10px] text-secondary/50">
								<div class="h-1.5 w-1.5 rounded-full bg-senary shadow-[0_0_8px_rgba(255,215,0,0.5)]"></div>
								<span>Override Active</span>
							</div>
						</div>
						<div class="flex-1 flex items-center justify-center w-full min-h-0">
							<Calendar
								type="single"
								bind:value={selectedDate}
								onValueChange={handleDateSelect}
								class="text-secondary rounded-xl border border-white/5 bg-black/20 p-3 shadow-xl scale-95 origin-center"
							>
								{#snippet day({ day, outsideMonth })}
									<div class="relative w-8 h-8 flex items-center justify-center">
										<span class="text-xs font-medium">{day.day}</span>
										{#if !outsideMonth && isScheduled(day.date)}
											<div class="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-senary shadow-[0_0_6px_rgba(255,215,0,0.6)]"></div>
										{/if}
									</div>
								{/snippet}
							</Calendar>
						</div>
					</div>
				</div>

				<!-- Column 2: Daily Actions -->
				<div class="space-y-3">
					<h2 class="text-base font-bold text-white flex items-center gap-2">
						<div class="p-1.5 bg-senary/10 rounded-md text-senary">
							<Settings2 class="h-3.5 w-3.5" />
						</div>
						Daily Actions
					</h2>
					<div class="bg-black/40 rounded-3xl border border-white/5 p-5 backdrop-blur-md h-[400px] flex flex-col">
						<div class="flex-1 flex flex-col justify-center items-center text-center p-4">
							<div class="relative mb-4">
								<div class="absolute inset-0 bg-senary/20 blur-xl rounded-full"></div>
								<div class="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
									<Clock class="h-8 w-8 text-senary" />
								</div>
							</div>
							
							<div class="space-y-1.5 mb-6">
								<h3 class="text-xl font-bold text-white tracking-tight">
									{#if selectedDate}
										{selectedDate.toString()}
									{:else}
										No Date Selected
									{/if}
								</h3>
								<p class="text-xs text-secondary/60 max-w-[220px] mx-auto leading-relaxed h-8">
									{#if selectedDate}
										{isScheduled(selectedDate) ? 'Custom hours set.' : 'Using default weekly schedule.'}
									{:else}
										Select a date to manage.
									{/if}
								</p>
							</div>
							
							<Button 
								class="w-full max-w-[180px] bg-senary text-primary hover:bg-senary/90 font-bold tracking-wide h-10 text-sm shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]"
								disabled={!selectedDate}
								onclick={() => selectedDate && handleDateSelect(selectedDate)}
							>
								{isScheduled(selectedDate) ? 'Edit Override' : 'Add Override'}
							</Button>
						</div>
					</div>
				</div>

				<!-- Column 3: Weekly Template (Compacted Chips) -->
				<div class="space-y-3 lg:col-span-2 xl:col-span-1">
					<div class="flex items-center justify-between">
						<h2 class="text-base font-bold text-white flex items-center gap-2">
							<div class="p-1.5 bg-senary/10 rounded-md text-senary">
								<Repeat class="h-3.5 w-3.5" />
							</div>
							Weekly Template
						</h2>
						<Button 
							onclick={saveWeeklySchedule} 
							disabled={isSavingSchedule}
							size="sm"
							class="bg-white/5 text-secondary hover:bg-white/10 border border-white/10 h-7 text-[10px] font-medium px-3"
						>
							{#if isSavingSchedule}
								<Loader2 class="mr-1.5 h-2.5 w-2.5 animate-spin" />
								Saving...
							{:else}
								<Save class="mr-1.5 h-2.5 w-2.5" />
								Save
							{/if}
						</Button>
					</div>

					<div class="bg-black/40 rounded-3xl border border-white/5 p-5 backdrop-blur-md h-[400px] flex flex-col">
						<div class="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
							{#each days as day}
								<div class="flex items-center gap-4 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group/row">
									<!-- Day Name -->
									<div class="w-10 shrink-0">
										<p class="font-bold text-xs text-white/90 capitalize">{day.substring(0, 3)}</p>
									</div>

									<!-- Time Slots (Premium Chips) -->
									<div class="flex-1 flex flex-wrap gap-2 items-center">
										{#each (weeklySchedule[day] || []) as time, i}
											<div class="relative group/chip flex items-center bg-senary/5 hover:bg-senary/10 border border-senary/20 rounded-md px-2 py-1 transition-all" transition:fade>
												<Input 
													type="time" 
													value={time} 
													oninput={(e) => updateWeeklySlot(day, i, e.currentTarget.value)}
													class="time-input h-auto p-0 text-xs font-mono text-senary border-none bg-transparent focus-visible:ring-0 text-center w-[85px]"
												/>
												<!-- Delete Action (Hover-only corner badge) -->
												<button 
													onclick={() => removeWeeklySlot(day, i)}
													class="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover/chip:opacity-100 shadow-sm flex items-center justify-center hover:bg-red-600 transition-all scale-90 hover:scale-100"
												>
													<Trash2 class="h-2 w-2" />
												</button>
											</div>
										{/each}
										
										<!-- Add Button (Ghost Pill) -->
										<button 
											onclick={() => addWeeklySlot(day)}
											class="h-6 px-2 rounded-md border border-dashed border-white/20 hover:border-senary/50 hover:bg-senary/5 text-[10px] text-secondary/50 hover:text-senary flex items-center gap-1 transition-all opacity-60 group-hover/row:opacity-100"
											title="Add slot"
										>
											<Plus class="h-3 w-3" />
											<span class="sr-only sm:not-sr-only">Add</span>
										</button>
										
										{#if (weeklySchedule[day] || []).length === 0}
											<span class="text-[10px] text-secondary/20 italic ml-1">Closed</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<OperationalModal 
		bind:open={modalOpen}
		operational={selectedOperational}
		initialDate={selectedDate}
		token={token}
		onUpdate={handleModalUpdate}
		onClose={() => {
			modalOpen = false;
			selectedOperational = null;
		}}
	/>
</div>

<style>
	/* Custom Scrollbar for Weekly List */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	/* Hide default time picker icon for cleaner look */
	:global(.time-input::-webkit-calendar-picker-indicator) {
		display: none;
	}
</style>
