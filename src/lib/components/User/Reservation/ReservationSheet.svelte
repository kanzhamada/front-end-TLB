<script lang="ts">
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription,
		SheetTrigger
	} from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import * as Select from '$lib/components/ui/select';
	import type {
		Barber,
		OperationalDay,
		OwnedVoucher,
		OperationalHour,
		Service,
		ApiResponse
	} from '$lib/api/shared/api';
	// Import the functions *without* calling them here
	import {
		getBarbers as getBarbersApi,
		// Import with alias
		getOperational as getOperationalApi, // Import with alias
		getOwnedVouchers as getOwnedVouchersApi, // Import with alias
		getServices as getServicesApi // Import with alias
	} from '$lib/api/shared/api';
	import { createReservation } from '$lib/api/customer/reservation';
	import { authStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';

	let { triggerClass = '', triggerText = 'Reservasi', reservationToReschedule = null } = $props();
	const dispatch = createEventDispatcher();

	type Step = 'date' | 'time' | 'details' | 'payment';
	const stepOrder: Step[] = ['date', 'time', 'details', 'payment'];
	const steps = [
		{ key: 'date', label: 'Date' },
		{ key: 'time', label: 'Time' },
		{ key: 'details', label: 'Details' },
		{ key: 'payment', label: 'Payment' }
	] satisfies { key: Step; label: string }[];

	let open = $state(false);
	let step: Step = $state('date');

	let loadingData = $state(false);
	let loadingSubmit = $state(false);
	let dataError = $state<string | null>(null);

	let operational = $state<OperationalDay[]>([]);
	let barbers = $state<Barber[]>([]);
	let services = $state<Service[]>([]);
	let vouchers = $state<OwnedVoucher[]>([]);

	let selectedYear = $state<number | null>(null);
	let selectedMonth = $state<number | null>(null);
	let selectedDayId = $state<string | null>(null);
	let selectedTimeId = $state<string | null>(null);
	let selectedBarberId = $state<string | null>(null);
	let selectedServiceId = $state<string | null>(null);
	let specialRequest = $state('');
	let voucherSelection = $state('none');
	let agreeTnc = $state(false);

	let loadAttempted = $state(false);

	const adminFee = 4000;
	const currencyFormatter = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	});

	const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' });
	const weekdayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long' });
	const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long' });

	type DateParts = {
		year: number;
		month: number;
		day: number;
		date: Date;
	};

	type DayOption = {
		id: string;
		day: number;
		weekday: string;
		available: boolean;
		iso: string;
	};

	function parseDateString(value: string): DateParts | null {
		const [yearStr, monthStr, dayStr] = value.split('-');
		const year = Number(yearStr);
		const month = Number(monthStr);
		const day = Number(dayStr);
		if (!year || !month || !day) return null;
		const date = new Date(year, month - 1, day);
		if (Number.isNaN(date.getTime())) return null;
		return { year, month, day, date };
	}

	function getMonthsForYear(year: number) {
		const months = new Set<number>();
		for (const day of operational) {
			const parts = parseDateString(day.date);
			if (parts && parts.year === year) {
				months.add(parts.month);
			}
		}
		return Array.from(months).sort((a, b) => a - b);
	}

	let availableYears = $state<number[]>([]);
	let availableMonths = $state<number[]>([]);
	let availableDays = $state<DayOption[]>([]);
	let selectedDay = $state<OperationalDay | null>(null);
	let timesForSelectedDay = $state<OperationalHour[]>([]);
	let selectedTime = $state<OperationalHour | null>(null);
	let selectedService = $state<Service | null>(null);
	let selectedBarber = $state<Barber | null>(null);
	let selectedVoucher = $state<OwnedVoucher | null>(null);
	let subtotal = $state(0);
	let voucherDiscount = $state(0);
	let total = $state(adminFee);
	let selectedDateDisplay = $state<string | null>(null);
	let selectedTimeDisplay = $state<string | null>(null);

	$effect(() => {
		availableYears = Array.from(
			new Set(
				operational
					.map((day) => parseDateString(day.date))
					.filter((parts): parts is DateParts => Boolean(parts))
					.map((parts) => parts.year)
			)
		).sort((a, b) => a - b);
	});

	$effect(() => {
		availableMonths = selectedYear === null ? [] : getMonthsForYear(selectedYear);
	});

	$effect(() => {
		if (selectedYear === null || selectedMonth === null) {
			availableDays = [];
			return;
		}
		const days: DayOption[] = [];
		for (const entry of operational) {
			const parts = parseDateString(entry.date);
			if (!parts || parts.year !== selectedYear || parts.month !== selectedMonth) continue;
			const available = entry.hours.some((hour) => hour.status === 'available');
			days.push({
				id: entry.id,
				day: parts.day,
				weekday: weekdayFormatter.format(parts.date),
				available,
				iso: entry.date
			});
		}
		availableDays = days.sort((a, b) => a.day - b.day);
	});

	$effect(() => {
		selectedDay = operational.find((day) => day.id === selectedDayId) ?? null;
	});

	$effect(() => {
		timesForSelectedDay = selectedDay ? selectedDay.hours : [];
	});

	$effect(() => {
		selectedTime = selectedDay?.hours.find((hour) => hour.id === selectedTimeId) ?? null;
	});

	$effect(() => {
		selectedService = services.find((service) => service.id === selectedServiceId) ?? null;
	});

	$effect(() => {
		selectedBarber = barbers.find((barber) => barber.id === selectedBarberId) ?? null;
	});

	$effect(() => {
		selectedVoucher =
			voucherSelection === 'none'
				? null
				: (vouchers.find((voucher) => voucher.voucherID === voucherSelection) ?? null);
	});

	$effect(() => {
		subtotal = selectedService?.price ?? 0;
	});

	$effect(() => {
		if (!selectedVoucher || !subtotal) {
			voucherDiscount = 0;
			return;
		}
		const { discountAmount, discountPercentage, value } = selectedVoucher;
		let discount = 0;
		if (typeof discountAmount === 'number') {
			discount = discountAmount;
		} else if (typeof discountPercentage === 'number') {
			discount = Math.round((discountPercentage / 100) * subtotal);
		} else if (typeof value === 'number') {
			discount = value;
		}
		voucherDiscount = Math.min(discount, subtotal);
	});

	$effect(() => {
		total = Math.max(subtotal - voucherDiscount + adminFee, 0);
	});

	$effect(() => {
		if (!selectedDay) {
			selectedDateDisplay = null;
			return;
		}
		const parts = parseDateString(selectedDay.date);
		selectedDateDisplay = parts ? dateFormatter.format(parts.date) : null;
	});

	$effect(() => {
		selectedTimeDisplay = selectedTime?.time ?? null;
	});

	function resetSelections() {
		step = 'date';
		selectedYear = null;
		selectedMonth = null;
		selectedDayId = null;
		selectedTimeId = null;
		selectedBarberId = null;
		selectedServiceId = null;
		voucherSelection = 'none';
		specialRequest = '';
		agreeTnc = false;
	}

	function initializeDateSelection(days: OperationalDay[]) {
		if (!days.length) {
			selectedYear = null;
			selectedMonth = null;
			selectedDayId = null;
			return;
		}

		const dayWithAvailability =
			days.find((day) => day.hours.some((hour) => hour.status === 'available')) ?? days[0];
		const parts = parseDateString(dayWithAvailability.date);
		if (!parts) return;

		selectedYear = parts.year;
		selectedMonth = parts.month;
		selectedDayId = dayWithAvailability.id;
		selectedTimeId = null;
	}

	async function loadReservationData() {
		if (loadingData) return;
		loadingData = true;
		// Reset error state when starting a new load attempt
		dataError = null;

		try {
			const [operationalRes, barbersRes, servicesRes] = await Promise.all([
				getOperationalApi(fetch), // Pass fetch here
				getBarbersApi(fetch), // Pass fetch here
				getServicesApi(fetch) // Pass fetch here
			]);

			console.log('Operational Data:', operationalRes); // Add this for debugging
			console.log('Barbers Data:', barbersRes); // Add this for debugging
			console.log('Services Data:', servicesRes); // Add this for debugging

			// --- CORRECTED LOGIC ---
			// Check if the API call itself failed (success: false)
			if (!operationalRes.success) {
				throw new Error(
					operationalRes.message ?? 'Tidak dapat memuat jadwal operasional. Coba lagi nanti.'
				);
			}

			// Check if the API call succeeded but returned no data ( undefined or [])
			// This is the case we now handle correctly in getOperational
			if (!operationalRes.data || operationalRes.data.length === 0) {
				// Instead of throwing, maybe show an error message or disable the sheet
				// For now, let's throw an error with a clearer message
				throw new Error('Tidak ada jadwal operasional yang tersedia saat ini.');
			}

			// If we reach here, operational data is available and non-empty
			operational = operationalRes.data;
			initializeDateSelection(operationalRes.data);
			// --- END CORRECTED LOGIC ---

			if (barbersRes.success && barbersRes.data) {
				barbers = barbersRes.data;
			} else {
				barbers = [];
				if (barbersRes.message) toast.warning(barbersRes.message);
			}

			if (servicesRes.success && servicesRes.data) {
				services = servicesRes.data;
			} else {
				services = [];
				if (servicesRes.message) toast.warning(servicesRes.message);
			}

			const token = get(authStore).session?.access_token;
			if (token) {
				const vouchersRes = await getOwnedVouchersApi(fetch, token);
				console.log('Vouchers Data:', vouchersRes); // Add this for debugging
				if (vouchersRes.success && vouchersRes.data) {
					vouchers = vouchersRes.data;
				} else {
					vouchers = [];
					if (vouchersRes.message) toast.warning(vouchersRes.message);
				}
			} else {
				vouchers = [];
			}
		} catch (error) {
			console.error('Error in loadReservationData:', error); // More specific logging
			// Use the error's message if it's an Error instance, otherwise a generic one
			dataError =
				error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data reservasi.';
		} finally {
			loadingData = false;
			// Note: We don't reset loadAttempted here because we want the effect to know loading was attempted.
			// The effect will reset loadAttempted only when the sheet is closed.
		}
	}

	async function retryLoadReservationData() {
		// Ensure the sheet is open and reset the attempt flag to allow reloading
		if (open) {
			loadAttempted = false; // Allow the $effect to trigger loading again
			// The $effect will call loadReservationData again on its next run
			// Or, you could call loadReservationData() directly here if preferred
			// loadReservationData();
		}
	}

	function selectYear(year: number) {
		if (selectedYear === year) return;
		selectedYear = year;
		const months = getMonthsForYear(year);
		selectedMonth = months[0] ?? null;
		selectedDayId = null;
		selectedTimeId = null;
	}

	function selectMonth(month: number) {
		if (selectedMonth === month) return;
		selectedMonth = month;
		selectedDayId = null;
		selectedTimeId = null;
	}

	function selectDay(dayId: string, available: boolean) {
		if (!available) return;
		if (selectedDayId === dayId) return;
		selectedDayId = dayId;
		selectedTimeId = null;
	}

	function selectTime(timeId: string, available: boolean) {
		if (!available) return;
		selectedTimeId = timeId;
	}

	function isPastStep(stepKey: Step) {
		return stepOrder.indexOf(step) > stepOrder.indexOf(stepKey);
	}

	function goNext() {
		if (step === 'date') {
			if (!selectedDayId) {
				toast.error('Pilih tanggal reservasi terlebih dahulu.');
				return;
			}
			step = 'time';
		} else if (step === 'time') {
			if (!selectedTimeId) {
				toast.error('Pilih jam reservasi terlebih dahulu.');
				return;
			}
			step = 'details';
		} else if (step === 'details') {
			if (!selectedBarberId || !selectedServiceId) {
				toast.error('Silakan pilih barber dan layanan.');
				return;
			}
			step = 'payment';
		}
	}

	function goBack() {
		if (step === 'payment') step = 'details';
		else if (step === 'details') step = 'time';
		else if (step === 'time') step = 'date';
	}

	async function handleSubmit() {
		if (!selectedBarberId || !selectedServiceId || !selectedTimeId) {
			toast.error('Data reservasi belum lengkap.');
			return;
		}

		if (!agreeTnc) {
			toast.error('Silakan setujui syarat dan ketentuan terlebih dahulu.');
			return;
		}

		const token = get(authStore).session?.access_token;
		if (!token) {
			toast.error('Sesi tidak ditemukan. Silakan masuk kembali.');
			console.error('No access token found in authStore:', get(authStore)); // Debug log
			return;
		}

		console.log('Sending access token:', token); // Debug log - Be careful with real tokens in logs
		// Consider logging just the token's validity (e.g., check expiry) instead of the full token
		const session = get(authStore).session;
		if (session?.expires_at && Date.now() >= session.expires_at * 1000) {
			console.warn('Access token appears to be expired:', session.expires_at);
			// Optionally, attempt refresh here or clear session
			authStore.clear();
			toast.error('Sesi telah habis. Silakan masuk kembali.');
			return;
		}

		loadingSubmit = true;
		try {
			if (reservationToReschedule) {
				// Handle rescheduling
				const { rescheduleReservation } = await import('$lib/api/customer/reservation');
				const response = await rescheduleReservation(
					reservationToReschedule.reservationID,
					selectedTimeId,
					token // Pass the token here
				);

				if (!response.success) {
					toast.error(response.message ?? 'Gagal mereschedule reservasi.');
					return;
				}

				toast.success('Reservasi berhasil direschedule!');
				open = false;

				// Dispatch event to notify parent component
				const event = new CustomEvent('reservationCompleted', {
					detail: { success: true, type: 'reschedule' }
				});
				dispatch('reservationCompleted', { success: true, type: 'reschedule' });
			} else {
				// Handle new reservation
				const response = await createReservation(
					{
						barberId: selectedBarberId,
						serviceId: selectedServiceId,
						dateTimeId: selectedTimeId,
						notes: specialRequest ? specialRequest.trim() : undefined,
						voucherId: voucherSelection !== 'none' ? voucherSelection : undefined
					},
					token // Pass the token here
				);

				if (!response.success) {
					toast.error(response.message ?? 'Gagal membuat reservasi.');
					return;
				}

				toast.success('Reservasi berhasil dibuat!');
				open = false;

				// Redirect to success page after successful reservation
				await goto('/reservation/success');
			}
		} catch (error) {
			console.error('Error in handleSubmit:', error); // More specific logging
			toast.error('Terjadi kesalahan saat memproses reservasi.');
		} finally {
			loadingSubmit = false;
		}
	}

	$effect(async () => {
		if (open) {
			if (!loadAttempted) {
				// Only load data if it hasn't been attempted yet in this session
				resetSelections();

				// Load reservation data
				await loadReservationData();
				loadAttempted = true; // Mark that loading has been attempted

				// If we're rescheduling, pre-fill data from the existing reservation
				// after the data has been loaded and the state has been updated
				if (reservationToReschedule) {
					// Find barber by name - need to wait for barbers to be loaded
					const matchingBarber = barbers.find(
						(b) => b.name === reservationToReschedule.barber.name
					);
					if (matchingBarber) {
						selectedBarberId = matchingBarber.id;
					}

					// Find service by name and price
					const matchingService = services.find(
						(s) =>
							s.name === reservationToReschedule.service.name &&
							s.price === reservationToReschedule.service.price
					);
					if (matchingService) {
						selectedServiceId = matchingService.id;
					}

					// Pre-fill other details
					specialRequest = reservationToReschedule.notes || '';
					voucherSelection = reservationToReschedule.voucherId || 'none';
				}
			}
			// If loadAttempted is true, do nothing here, wait for user action or sheet close/reopen
		} else {
			// If sheet is closed, reset the attempt flag
			loadAttempted = false;
		}
	});
</script>

<Sheet bind:open>
	<SheetTrigger>
		<Button class={cn(triggerClass)}>{triggerText}</Button>
	</SheetTrigger>

	<SheetContent
		side="top"
		class="mx-auto mt-16 w-full max-w-5xl rounded-2xl border border-senary/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
	>
		<SheetHeader class="p-0">
			<SheetTitle class="sr-only">Reservation</SheetTitle>
			<SheetDescription class="sr-only">Create a new reservation</SheetDescription>
		</SheetHeader>

		<div class="mb-6 flex items-center justify-between gap-3">
			{#each steps as { key, label }, index (key)}
				<div class="flex flex-1 items-center">
					<div
						class={cn(
							'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
							step === key
								? 'border-senary bg-senary text-primary'
								: isPastStep(key)
									? 'border-senary bg-senary text-primary'
									: 'border-white/10 bg-white/5 text-muted-foreground'
						)}
					>
						{#if isPastStep(key)}
							<CheckIcon class="size-5" />
						{:else}
							<span class="text-sm font-bold">{index + 1}</span>
						{/if}
					</div>
					<span
						class={cn(
							'ml-2 text-sm font-medium transition-colors',
							step === key || isPastStep(key) ? 'text-senary' : 'text-muted-foreground'
						)}>{label}</span
					>
				</div>
				{#if index < steps.length - 1}
					<ChevronRight class="mx-1 size-4 text-white/20" />
				{/if}
			{/each}
		</div>

		<div class="rounded-xl border border-white/10 bg-white/5 p-6 shadow-inner backdrop-blur-md">
			{#if loadingData}
				<div class="flex flex-col items-center justify-center gap-4 py-16 text-senary">
					<Loader2Icon class="size-8 animate-spin" />
					<p class="text-sm font-medium text-secondary/80">Sedang memuat data reservasi...</p>
				</div>
			{:else if dataError}
				<div class="space-y-4 text-center">
					<p class="text-sm font-medium text-destructive">{dataError}</p>
					<Button
						variant="outline"
						class="border-senary/50 text-senary hover:bg-senary hover:text-primary"
						onclick={retryLoadReservationData}>Coba lagi</Button
					>
				</div>
			{:else if step === 'date'}
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-secondary">Pilih Tanggal Reservasi</h3>
						<p class="text-sm text-secondary/60">
							Pilih tahun, bulan, dan tanggal yang tersedia untuk melanjutkan.
						</p>
					</div>

					<div class="space-y-4">
						<div>
							<Label class="mb-2 block text-sm font-semibold text-secondary/80">Tahun</Label>
							<div class="flex flex-wrap gap-2">
								{#each availableYears as year (year)}
									<button
										type="button"
										class={cn(
											'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300',
											selectedYear === year
												? 'border-senary bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
												: 'border-white/10 bg-white/5 text-secondary hover:border-senary/50 hover:bg-white/10'
										)}
										onclick={() => selectYear(year)}
									>
										{year}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<Label class="mb-2 block text-sm font-semibold text-secondary/80">Bulan</Label>
							{#if availableMonths.length === 0}
								<p class="text-sm text-muted-foreground">Silakan pilih tahun terlebih dahulu.</p>
							{:else}
								<div class="flex flex-wrap gap-2">
									{#each availableMonths as month (month)}
										<button
											type="button"
											class={cn(
												'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300',
												selectedMonth === month
													? 'border-senary bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
													: 'border-white/10 bg-white/5 text-secondary hover:border-senary/50 hover:bg-white/10'
											)}
											onclick={() => selectMonth(month)}
										>
											{monthFormatter.format(new Date(2000, month - 1, 1))}
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div>
							<Label class="mb-2 block text-sm font-semibold text-secondary/80">Tanggal</Label>
							{#if availableDays.length === 0}
								<p class="text-sm text-muted-foreground">Tidak ada tanggal yang tersedia.</p>
							{:else}
								<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
									{#each availableDays as day (day.id)}
										<button
											type="button"
											class={cn(
												'rounded-xl border px-3 py-3 text-center transition-all duration-300',
												day.available
													? selectedDayId === day.id
														? 'border-senary bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
														: 'border-white/10 bg-white/5 text-secondary hover:border-senary/50 hover:bg-white/10'
													: 'cursor-not-allowed border-white/5 bg-white/5 text-white/20'
											)}
											onclick={() => selectDay(day.id, day.available)}
											disabled={!day.available}
										>
											<div class="text-lg font-semibold">{day.day}</div>
											<div class="text-xs capitalize">{day.weekday}</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<div class="flex justify-end">
						<Button
							class="bg-senary text-primary hover:bg-senary/90"
							onclick={goNext}
							disabled={!selectedDayId}>Pilih Jam</Button
						>
					</div>
				</div>
			{:else if step === 'time'}
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-secondary">Pilih Jam Reservasi</h3>
						<p class="text-sm text-secondary/60">
							Tanggal dipilih:
							<span class="font-medium text-senary">
								{selectedDateDisplay ?? '-'}
							</span>
						</p>
					</div>

					<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
						{#each timesForSelectedDay as hour (hour.id)}
							<button
								type="button"
								class={cn(
									'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300',
									hour.status === 'available'
										? selectedTimeId === hour.id
											? 'border-senary bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
											: 'border-white/10 bg-white/5 text-secondary hover:border-senary/50 hover:bg-white/10'
										: 'cursor-not-allowed border-white/5 bg-white/5 text-white/20'
								)}
								onclick={() => selectTime(hour.id, hour.status === 'available')}
								disabled={hour.status !== 'available'}
							>
								{hour.time}
							</button>
						{/each}
					</div>

					<div class="flex items-center justify-between">
						<Button
							variant="outline"
							class="border-white/10 text-secondary hover:bg-white/10 hover:text-white"
							onclick={goBack}>Kembali</Button
						>
						<Button
							class="bg-senary text-primary hover:bg-senary/90"
							onclick={goNext}
							disabled={!selectedTimeId}>Detail Janji</Button
						>
					</div>
				</div>
			{:else if step === 'details'}
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-secondary">Detail Reservasi</h3>
						<p class="text-sm text-secondary/60">
							{#if reservationToReschedule}
								Barber dan layanan tidak dapat diubah saat reschedule.
							{:else}
								Pilih barber dan layanan yang Anda inginkan.
							{/if}
						</p>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<!-- Left Column: Barber Selection -->
						<div class="flex flex-col gap-2">
							<h4 class="text-sm font-semibold text-secondary/80">Pilih Barber</h4>
							<div
								class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 h-[400px] overflow-y-auto pr-2"
							>
								{#if barbers.length === 0}
									<p class="text-sm text-muted-foreground">
										Tidak ada barber yang tersedia saat ini.
									</p>
								{:else}
									<div class="grid grid-cols-1 gap-3">
										{#each barbers as barber (barber.id)}
											<button
												type="button"
												class={cn(
													'rounded-xl border p-4 text-left transition-all duration-300',
													selectedBarberId === barber.id
														? 'border-senary bg-senary/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
														: 'border-white/10 bg-white/5 hover:border-senary/50 hover:bg-white/10',
													reservationToReschedule ? 'cursor-not-allowed opacity-60' : ''
												)}
												onclick={() => !reservationToReschedule && (selectedBarberId = barber.id)}
												disabled={reservationToReschedule}
											>
												<div
													class={cn(
														'font-semibold',
														selectedBarberId === barber.id ? 'text-senary' : 'text-secondary'
													)}
												>
													{barber.name}
												</div>
												{#if barber.experience}
													<p class="text-xs text-secondary/60">
														Pengalaman: {barber.experience}
													</p>
												{/if}
												{#if barber.skills}
													<p class="text-xs text-secondary/60">Keahlian: {barber.skills}</p>
												{/if}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<!-- Right Column: Service Selection -->
						<div class="flex flex-col gap-2">
							<h4 class="text-sm font-semibold text-secondary/80">Pilih Layanan</h4>
							<div
								class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 h-[400px] overflow-y-auto pr-2"
							>
								{#if services.length === 0}
									<p class="text-sm text-muted-foreground">
										Tidak ada layanan yang tersedia saat ini.
									</p>
								{:else}
									<div class="space-y-3">
										{#each services as service (service.id)}
											<button
												type="button"
												class={cn(
													'flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-300',
													selectedServiceId === service.id
														? 'border-senary bg-senary/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
														: 'border-white/10 bg-white/5 hover:border-senary/50 hover:bg-white/10',
													reservationToReschedule ? 'cursor-not-allowed opacity-60' : ''
												)}
												onclick={() => !reservationToReschedule && (selectedServiceId = service.id)}
												disabled={reservationToReschedule}
											>
												<div>
													<div
														class={cn(
															'font-semibold',
															selectedServiceId === service.id ? 'text-senary' : 'text-secondary'
														)}
													>
														{service.name}
													</div>
													<p class="text-xs text-secondary/60">{service.description}</p>
												</div>
												<div class="text-sm font-semibold text-senary">
													{currencyFormatter.format(service.price)}
												</div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<!-- Bottom: Notes (Spanning Full Width) -->
						<div class="col-span-1 md:col-span-2">
							<Label class="mb-2 block text-sm font-semibold text-secondary/80">
								Catatan (Opsional)
							</Label>
							<Textarea
								rows={4}
								placeholder="Tambahkan permintaan khusus..."
								bind:value={specialRequest}
								class="border-white/10 bg-white/5 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/50"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<Button
							variant="outline"
							class="border-white/10 text-secondary hover:bg-white/10 hover:text-white"
							onclick={goBack}>Kembali</Button
						>
						<Button
							class="bg-senary text-primary hover:bg-senary/90"
							onclick={goNext}
							disabled={!selectedBarberId ||
								!selectedServiceId ||
								(reservationToReschedule && (!selectedDayId || !selectedTimeId)) ||
								(reservationToReschedule && loadingData)}
						>
							{#if reservationToReschedule}
								Lanjut ke Konfirmasi
							{:else}
								Lanjut ke Pembayaran
							{/if}
						</Button>
					</div>
				</div>
			{:else if step === 'payment'}
				<div class="space-y-6">
					<div>
						{#if reservationToReschedule}
							<h3 class="text-lg font-semibold text-secondary">Konfirmasi Reschedule</h3>
							<p class="text-sm text-secondary/60">
								Periksa kembali perubahan reservasi Anda sebelum dikonfirmasi.
							</p>
						{:else}
							<h3 class="text-lg font-semibold text-secondary">Pembayaran</h3>
							<p class="text-sm text-secondary/60">
								Periksa kembali detail reservasi sebelum dikonfirmasi.
							</p>
						{/if}
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<div class="rounded-lg border border-senary/20 bg-senary/10 p-4 text-secondary">
							{#if reservationToReschedule}
								<div class="font-semibold text-senary">Ringkasan Reschedule</div>
							{:else}
								<div class="font-semibold text-senary">Ringkasan Reservasi</div>
							{/if}
							<div class="mt-3 space-y-2 text-sm">
								<div class="flex justify-between border-b border-senary/10 pb-2">
									<span class="text-secondary/70">Tanggal</span>
									<span class="font-medium">{selectedDateDisplay ?? '-'}</span>
								</div>
								<div class="flex justify-between border-b border-senary/10 pb-2">
									<span class="text-secondary/70">Jam</span>
									<span class="font-medium">{selectedTimeDisplay ?? '-'}</span>
								</div>
								<div class="flex justify-between border-b border-senary/10 pb-2">
									<span class="text-secondary/70">Barber</span>
									<span class="font-medium">{selectedBarber?.name ?? '-'}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-secondary/70">Layanan</span>
									<span class="font-medium">{selectedService?.name ?? '-'}</span>
								</div>
							</div>
						</div>

						<div class="rounded-lg border border-white/10 bg-white/5 p-4">
							<div class="font-semibold text-secondary">Voucher</div>
							<p class="mt-2 text-xs text-secondary/60">
								Pilih voucher yang ingin digunakan (opsional).
							</p>
							<Select.Root type="single" bind:value={voucherSelection}>
								<Select.Trigger
									class="mt-3 w-full justify-between border-white/10 bg-white/5 text-secondary focus:ring-senary/50"
								>
									{selectedVoucher
										? (selectedVoucher.title ?? selectedVoucher.name ?? 'Voucher')
										: 'Pilih voucher'}
								</Select.Trigger>
								<Select.Content class="border-white/10 bg-background text-secondary">
									<Select.Item value="none" class="focus:bg-senary/20 focus:text-senary"
										>Tanpa Voucher</Select.Item
									>
									{#each vouchers as voucher (voucher.voucherID)}
										<Select.Item
											value={voucher.voucherID}
											label={voucher.title ?? voucher.name ?? 'Voucher'}
											class="focus:bg-senary/20 focus:text-senary"
										>
											{voucher.title ?? voucher.name ?? 'Voucher'}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<Separator class="bg-white/10" />

					<div class="space-y-2 text-sm">
						<div class="flex justify-between text-secondary/80">
							<span>{selectedService?.name ?? 'Subtotal'}</span>
							<span>{currencyFormatter.format(subtotal)}</span>
						</div>
						<div class="flex justify-between text-senary">
							<span>Diskon Voucher</span>
							<span>-{currencyFormatter.format(voucherDiscount)}</span>
						</div>
						<div class="flex justify-between text-destructive">
							<span>Biaya Admin</span>
							<span>+{currencyFormatter.format(adminFee)}</span>
						</div>
						<div class="flex justify-between text-base font-semibold text-secondary">
							<span>Total</span>
							<span class="text-xl text-senary">{currencyFormatter.format(total)}</span>
						</div>
					</div>

					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<Button
							variant="outline"
							class="border-white/10 text-secondary hover:bg-white/10 hover:text-white sm:w-auto"
							onclick={goBack}>Kembali</Button
						>
						<div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
							<label class="flex items-center gap-2 text-xs text-secondary/60 hover:text-secondary">
								<input
									type="checkbox"
									bind:checked={agreeTnc}
									class="rounded border-white/20 bg-white/5 text-senary focus:ring-senary"
								/>
								Saya telah membaca dan menyetujui syarat & ketentuan.
							</label>
							<Button
								class="bg-senary text-primary hover:bg-senary/90 sm:w-auto"
								disabled={loadingSubmit}
								onclick={handleSubmit}
							>
								{#if loadingSubmit}
									<span class="flex items-center gap-2">
										<Loader2Icon class="size-4 animate-spin" />
										{#if reservationToReschedule}
											Memproses Reschedule...
										{:else}
											Memproses Pembayaran...
										{/if}
									</span>
								{:else if reservationToReschedule}
									Konfirmasi Reschedule
								{:else}
									Konfirmasi Reservasi
								{/if}
							</Button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</SheetContent>
</Sheet>

<style>
	:global([data-slot='sheet-content']) {
		border-radius: 1rem;
	}
</style>
