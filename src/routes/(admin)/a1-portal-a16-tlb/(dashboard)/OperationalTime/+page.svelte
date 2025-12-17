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
		Settings2,
		X
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
	import { Day as CalendarDay } from '$lib/components/ui/calendar';
	import { cn } from "$lib/utils";
	import { fade, slide } from 'svelte/transition';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	// State
	let isLoading = $state(false);
	let isSavingSchedule = $state(false);

	// Daily Operational State
	let operationalTimes = $state<OperationalTime[]>([]);
	let selectedDate = $state<CalendarDate | undefined>(undefined);
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

	// Derived state for efficient and robust lookup
	let scheduledDates = $derived(new Set(operationalTimes.map(ot => {
		if (!ot.date) return '';
		// Handle ISO and simple date strings
		return ot.date.split('T')[0];
	})));

	$effect(() => {
		if (operationalTimes.length > 0) {
			console.log('Processed Scheduled Dates:', Array.from(scheduledDates));
		}
	});

	// Simplified isScheduled check
	const isScheduled = (date: any) => {
		if (!date) return false;
		return scheduledDates.has(date.toString());
	};

	function handleDateSelect(date: DateValue | undefined) {
		if (!date) return;
		
		// Always update selectedDate
		selectedDate = date as CalendarDate;
		const dateStr = date.toString();
		
		// Find existing schedule logic
		const existing = operationalTimes.find(ot => ot.date && ot.date.split('T')[0] === dateStr);
		
		selectedOperational = existing || null;
		
		// Open modal immediately
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
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		<div class="relative z-10 mx-auto max-w-[1600px]">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="h-[1px] w-12 bg-senary"></div>
					<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Admin Portal</p>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-senary">{operationalTimes.length}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Date Overrides</p>
				</div>
			</div>
			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Operational <span class="text-senary">Time</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Manage your general weekly schedule and specific daily overrides.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8">
		<div class="mx-auto max-w-[1600px]">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				
				<!-- Column 1: Calendar (Takes up 5 cols) -->
				<div class="lg:col-span-5 space-y-4">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-bold text-white flex items-center gap-3">
							<div class="p-2 bg-senary/10 rounded-lg text-senary border border-senary/20">
								<CalendarDays class="h-5 w-5" />
							</div>
							Dates & Overrides
						</h2>
					</div>
					
					<div class="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-md relative overflow-hidden group">
						<div class="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
							<CalendarIcon class="w-32 h-32 text-white/5 transform rotate-12 translate-x-8 -translate-y-8" />
						</div>

						<div class="relative z-10 flex flex-col items-center w-full">
							<div class="w-full flex items-center justify-between mb-6 px-4 max-w-sm mx-auto">
								<span class="text-xs font-medium text-secondary/70">Select date</span>
								<div class="flex items-center gap-2 text-[10px] text-senary bg-senary/10 px-2.5 py-1 rounded-full border border-senary/20">
									<div class="h-1.5 w-1.5 rounded-full bg-senary shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
									<span class="font-bold tracking-wide uppercase">Scheduled</span>
								</div>
							</div>
							
						<div class="p-1 bg-black/40 rounded-3xl border border-white/5 shadow-2xl w-full max-w-sm mx-auto overflow-hidden flex flex-col items-center">
							<Calendar
								type="single"
								bind:value={selectedDate}
								onValueChange={handleDateSelect}
								preventDeselect
								class="text-secondary bg-transparent p-4 w-fit mx-auto"
							>
								{#snippet day({ day, outsideMonth })}
									<CalendarDay 
										date={day}
										class={cn(
											"group relative w-10 h-10 p-0 font-medium aria-selected:opacity-100 hover:bg-white/10 transition-all rounded-full data-[selected]:bg-senary data-[selected]:text-primary data-[selected]:!opacity-100 data-[selected]:shadow-[0_0_15px_rgba(212,175,55,0.4)]",
											outsideMonth && "text-secondary/20 opacity-30"
										)}
									>
										<div class="relative w-full h-full flex flex-col items-center justify-center pt-0.5">
											<span class="text-sm z-10">{day.day}</span>
											{#if !outsideMonth && isScheduled(day)}
												<div class="absolute bottom-1.5 h-1 w-1 rounded-full bg-senary shadow-[0_0_4px_rgba(212,175,55,1)] ring-0 group-data-[selected]:bg-black"></div>
											{/if}
										</div>
									</CalendarDay>
								{/snippet}
							</Calendar>
						</div>
							
							<p class="mt-6 text-[10px] text-center text-secondary/30 max-w-xs mx-auto">
								Tap dates with gold dots to edit specific overrides.
							</p>
						</div>
					</div>
				</div>

				<!-- Column 2: Weekly Template (Takes up 7 cols) -->
				<div class="lg:col-span-7 space-y-4">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-bold text-white flex items-center gap-3">
							<div class="p-2 bg-senary/10 rounded-lg text-senary border border-senary/20">
								<Repeat class="h-5 w-5" />
							</div>
							Weekly Schedule
						</h2>
						<Button 
							onclick={saveWeeklySchedule} 
							disabled={isSavingSchedule}
							size="sm"
							class="bg-senary text-primary hover:bg-senary/90 font-bold h-9 px-4 text-xs transition-all shadow-[0_0_15px_-5px_rgba(212,175,55,0.3)]"
						>
							{#if isSavingSchedule}
								<Loader2 class="mr-2 h-3.5 w-3.5 animate-spin" />
								Saving changes...
							{:else}
								<Save class="mr-2 h-3.5 w-3.5" />
								Save Changes
							{/if}
						</Button>
					</div>

					<div class="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-md min-h-[500px]">
						<div class="space-y-4">
							{#each days as day}
								<div class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 hover:bg-black/30 transition-all duration-300 group">
									<!-- Day Name -->
									<div class="w-24 shrink-0 flex items-center gap-3">
										<div class="w-1 h-8 rounded-full bg-white/10 group-hover:bg-senary/50 transition-colors"></div>
										<p class="font-bold text-sm text-secondary capitalize">{day}</p>
									</div>

									<!-- Time Slots -->
									<div class="flex-1 flex flex-wrap gap-2 items-center">
										{#each (weeklySchedule[day] || []) as time, i}
											<div class="relative group/chip flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-1 py-1 transition-all" transition:fade>
												<Input 
													type="time" 
													value={time} 
													oninput={(e) => updateWeeklySlot(day, i, e.currentTarget.value)}
													class="time-input h-7 p-0 text-xs font-mono text-secondary border-none bg-transparent focus-visible:ring-0 text-center w-[76px] cursor-pointer"
												/>
												<!-- Delete Action -->
												<button 
													onclick={() => removeWeeklySlot(day, i)}
													class="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full opacity-0 group-hover/chip:opacity-100 shadow-md flex items-center justify-center hover:bg-red-600 transition-all scale-75 hover:scale-100 z-10 ring-2 ring-black"
												>
													<X class="h-3 w-3" />
												</button>
											</div>
										{/each}
										
										<!-- Add Button -->
										<button 
											onclick={() => addWeeklySlot(day)}
											class="h-9 px-3 rounded-lg border border-dashed border-white/20 hover:border-senary/50 hover:bg-senary/5 text-xs text-secondary/50 hover:text-senary flex items-center gap-2 transition-all"
											title="Add time slot"
										>
											<Plus class="h-3.5 w-3.5" />
											<span class="sr-only sm:not-sr-only">Add Slot</span>
										</button>
										
										{#if (weeklySchedule[day] || []).length === 0}
											<span class="text-xs text-secondary/30 italic ml-2">No active slots (Closed)</span>
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
			selectedDate = undefined;
		}}
	/>
</div>

<style>
	/* Custom Scrollbar */
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

	/* Hide default time picker icon */
	:global(.time-input::-webkit-calendar-picker-indicator) {
		display: none;
	}
</style>