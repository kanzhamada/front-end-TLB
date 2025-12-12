<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Tabs from "$lib/components/ui/tabs";
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
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	// State
	let activeTab = $state('daily');
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
			const rawData = res.data as any[];
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

	const isScheduled = (date: CalendarDate) => {
		return scheduledDates.some((d) => d.compare(date) === 0);
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

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30">
	<!-- Hero Header -->
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		
		<div class="relative z-10 mx-auto max-w-7xl">
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

	<div class="px-6 pb-20 lg:px-8">
		<div class="mx-auto max-w-7xl space-y-6">
			
			<Tabs.Root value="daily" class="w-full" onValueChange={(v) => activeTab = v}>
				<div class="flex items-center justify-between mb-6">
					<Tabs.List class="grid w-full max-w-[400px] grid-cols-2 bg-white/5 border border-white/10 p-1 rounded-xl">
						<Tabs.Trigger 
							value="daily" 
							class="rounded-lg data-[state=active]:bg-senary data-[state=active]:text-primary transition-all duration-300"
						>
							<CalendarDays class="mr-2 h-4 w-4" />
							Daily Overrides
						</Tabs.Trigger>
						<Tabs.Trigger 
							value="weekly" 
							class="rounded-lg data-[state=active]:bg-senary data-[state=active]:text-primary transition-all duration-300"
						>
							<Repeat class="mr-2 h-4 w-4" />
							Weekly Template
						</Tabs.Trigger>
					</Tabs.List>
				</div>

				<!-- Daily Tab -->
				<Tabs.Content value="daily" class="mt-0 focus-visible:outline-none focus-visible:ring-0">
					<div class="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-sm flex flex-col items-center">
						<div class="w-full max-w-5xl grid md:grid-cols-[1fr_300px] gap-8 items-start">
							<!-- Calendar Section -->
							<div class="flex flex-col gap-4 w-full">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="p-2 bg-senary/10 rounded-lg text-senary">
											<CalendarIcon class="h-5 w-5" />
										</div>
										<div>
											<h3 class="text-lg font-bold text-white">Calendar</h3>
											<p class="text-xs text-secondary/60">Select a date to manage availability</p>
										</div>
									</div>
									
									<!-- Legend -->
									<div class="flex items-center gap-4 text-xs text-secondary/50">
										<div class="flex items-center gap-2">
											<div class="h-1.5 w-1.5 rounded-full bg-senary shadow-[0_0_8px_rgba(255,215,0,0.5)]"></div>
											<span>Has Override</span>
										</div>
									</div>
								</div>

								<div class="bg-black/20 rounded-2xl border border-white/5 p-8 flex justify-center w-full">
									<Calendar
										type="single"
										bind:value={selectedDate}
										onValueChange={handleDateSelect}
										class="text-secondary w-full [&_table]:w-full [&_table]:max-w-full"
									>
										{#snippet day({ day, outsideMonth })}
											<div class="relative w-full h-12 flex items-center justify-center">
												<span class="text-sm font-medium">{day.day}</span>
												{#if !outsideMonth && isScheduled(day)}
													<div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-senary shadow-[0_0_6px_rgba(255,215,0,0.6)]"></div>
												{/if}
											</div>
										{/snippet}
									</Calendar>
								</div>
							</div>

							<!-- Action Panel (Compact) -->
							<div class="w-full bg-black/20 rounded-2xl border border-white/5 p-6 flex flex-col gap-6 h-full min-h-[400px]">
								<div class="flex items-center gap-3 text-white border-b border-white/5 pb-4">
									<Settings2 class="h-5 w-5 text-senary" />
									<span class="font-medium">Actions</span>
								</div>
								
								<div class="flex-1 flex flex-col justify-center items-center text-center">
									<div class="h-16 w-16 rounded-full bg-senary/10 flex items-center justify-center mb-4">
										<Clock class="h-8 w-8 text-senary" />
									</div>
									
									<p class="text-sm text-secondary/70 mb-6 px-2">
										{#if selectedDate}
											<span class="block mb-2">
												Create a custom schedule for specific day<br>
												
											</span>
										{:else}
											Select a date to begin
										{/if}
									</p>
									
									<Button 
										variant="outline" 
										class="w-full border-senary/50 text-senary hover:bg-senary hover:text-primary transition-all h-12 font-bold tracking-wide"
										disabled={!selectedDate}
										onclick={() => selectedDate && handleDateSelect(selectedDate)}
									>
										{selectedDate ? 'Create Schedule' : 'Select Date'}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</Tabs.Content>

				<!-- Weekly Tab -->
				<Tabs.Content value="weekly" class="mt-0 focus-visible:outline-none focus-visible:ring-0">
					<div class="bg-white/5 rounded-3xl border border-white/10 p-6 backdrop-blur-sm">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center gap-3">
								<div class="p-2 bg-senary/10 rounded-lg text-senary">
									<Repeat class="h-5 w-5" />
								</div>
								<div>
									<h3 class="text-lg font-bold text-white">Weekly Schedule Template</h3>
									<p class="text-xs text-secondary/60">Set default operating hours</p>
								</div>
							</div>
							<Button 
								onclick={saveWeeklySchedule} 
								disabled={isSavingSchedule}
								class="bg-senary text-primary hover:bg-senary/90 font-bold min-w-[140px]"
							>
								{#if isSavingSchedule}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									Saving...
								{:else}
									<Save class="mr-2 h-4 w-4" />
									Save Template
								{/if}
							</Button>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{#each days as day}
								<div class="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col gap-3 group hover:border-white/10 transition-colors">
									<div class="flex items-center justify-between pb-2 border-b border-white/5">
										<span class="font-bold text-white capitalize tracking-wide text-sm">{day}</span>
										<Button 
											variant="ghost" 
											size="icon" 
											class="h-6 w-6 text-senary hover:bg-senary/10 rounded-full"
											onclick={() => addWeeklySlot(day)}
										>
											<Plus class="h-3 w-3" />
										</Button>
									</div>
									
									<div class="space-y-2 flex-1 min-h-[80px]">
										{#each (weeklySchedule[day] || []) as time, i}
											<div class="flex items-center gap-2" transition:fade>
												<div class="relative flex-1">
													<Clock class="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-secondary/50" />
													<Input 
														type="time" 
														value={time} 
														oninput={(e) => updateWeeklySlot(day, i, e.currentTarget.value)}
														class="pl-8 h-8 text-xs rounded-lg border-white/10 bg-white/5 text-secondary focus:border-senary/50"
													/>
												</div>
												<Button 
													variant="ghost" 
													size="icon"
													onclick={() => removeWeeklySlot(day, i)}
													class="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
												>
													<Trash2 class="h-3 w-3" />
												</Button>
											</div>
										{/each}
										{#if (weeklySchedule[day] || []).length === 0}
											<div class="flex flex-col items-center justify-center h-full py-2 text-secondary/30 text-[10px] italic">
												<span>Closed</span>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>
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
