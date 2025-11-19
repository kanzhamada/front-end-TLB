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
		class="mx-auto mt-16 w-full max-w-5xl rounded-2xl border bg-[#f7f3ee] p-6 shadow-2xl"
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
								? 'border-emerald-700 bg-emerald-700 text-white'
								: isPastStep(key)
									? 'border-emerald-700 bg-emerald-700 text-white'
									: 'border-emerald-900/30 bg-white text-emerald-900'
						)}
					>
						{#if isPastStep(key)}
							<CheckIcon class="size-5" />
						{:else}
							<span class="text-sm">{index + 1}</span>
						{/if}
					</div>
					<span class="ml-2 text-sm font-medium text-emerald-900/80">{label}</span>
				</div>
				{#if index < steps.length - 1}
					<ChevronRight class="mx-1 size-4 text-emerald-900/40" />
				{/if}
			{/each}
		</div>

		<div class="rounded-xl bg-white p-5 shadow-sm">
			{#if loadingData}
				<div class="flex flex-col items-center justify-center gap-4 py-16 text-emerald-900/80">
					<Loader2Icon class="size-8 animate-spin" />
					<p class="text-sm font-medium">Sedang memuat data reservasi...</p>
				</div>
			{:else if dataError}
				<div class="space-y-4 text-center">
					<p class="text-sm font-medium text-red-600">{dataError}</p>
					<!-- Call the new retry function -->
					<Button variant="outline" onclick={retryLoadReservationData}>Coba lagi</Button>
				</div>
			{:else if step === 'date'}
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-stone-700">Pilih Tanggal Reservasi</h3>
						<p class="text-sm text-stone-500">
							Pilih tahun, bulan, dan tanggal yang tersedia untuk melanjutkan.
						</p>
					</div>

					<div class="space-y-4">
						<div>
							<Label class="mb-2 block text-sm font-semibold text-stone-700">Tahun</Label>
							<div class="flex flex-wrap gap-2">
								{#each availableYears as year (year)}
									<button
										type="button"
										class={cn(
											'rounded-lg border px-4 py-2 text-sm font-medium transition',
											selectedYear === year
												? 'border-emerald-700 bg-emerald-700 text-white'
												: 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400'
										)}
										onclick={() => selectYear(year)}
									>
										{year}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<Label class="mb-2 block text-sm font-semibold text-stone-700">Bulan</Label>
							{#if availableMonths.length === 0}
								<p class="text-sm text-stone-400">Silakan pilih tahun terlebih dahulu.</p>
							{:else}
								<div class="flex flex-wrap gap-2">
									{#each availableMonths as month (month)}
										<button
											type="button"
											class={cn(
												'rounded-lg border px-4 py-2 text-sm font-medium transition',
												selectedMonth === month
													? 'border-emerald-700 bg-emerald-700 text-white'
													: 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400'
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
							<Label class="mb-2 block text-sm font-semibold text-stone-700">Tanggal</Label>
							{#if availableDays.length === 0}
								<p class="text-sm text-stone-400">Tidak ada tanggal yang tersedia.</p>
							{:else}
								<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
									{#each availableDays as day (day.id)}
										<button
											type="button"
											class={cn(
												'rounded-xl border px-3 py-3 text-center transition',
												day.available
													? selectedDayId === day.id
														? 'border-emerald-700 bg-emerald-700 text-white'
														: 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400'
													: 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
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
						<Button onclick={goNext} disabled={!selectedDayId}>Pilih Jam</Button>
					</div>
				</div>
			{:else if step === 'time'}
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-stone-700">Pilih Jam Reservasi</h3>
						<p class="text-sm text-stone-500">
							Tanggal dipilih:
							<span class="font-medium text-emerald-800">
								{selectedDateDisplay ?? '-'}
							</span>
						</p>
					</div>

					<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
						{#each timesForSelectedDay as hour (hour.id)}
							<button
								type="button"
								class={cn(
									'rounded-lg border px-4 py-2 text-sm font-medium transition',
									hour.status === 'available'
										? selectedTimeId === hour.id
											? 'border-emerald-700 bg-emerald-700 text-white'
											: 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400'
										: 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
								)}
								onclick={() => selectTime(hour.id, hour.status === 'available')}
								disabled={hour.status !== 'available'}
							>
								{hour.time}
							</button>
						{/each}
					</div>

					<div class="flex items-center justify-between">
						<Button variant="outline" onclick={goBack}>Kembali</Button>
						<Button onclick={goNext} disabled={!selectedTimeId}>Detail Janji</Button>
					</div>
				</div>
			{:else if step === 'details'}
				<div class="space-y-6">
					<div>
						<h3 class="text-lg font-semibold text-stone-700">Detail Reservasi</h3>
						<p class="text-sm text-stone-500">
							{#if reservationToReschedule}
								Barber dan layanan tidak dapat diubah saat reschedule.
							{:else}
								Pilih barber dan layanan yang Anda inginkan.
							{/if}
						</p>
					</div>

					<div class="space-y-4">
						<div>
							<h4 class="mb-2 text-sm font-semibold text-stone-700">Pilih Barber</h4>
							{#if barbers.length === 0}
								<p class="text-sm text-stone-400">Tidak ada barber yang tersedia saat ini.</p>
							{:else}
								<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{#each barbers as barber (barber.id)}
										<button
											type="button"
											class={cn(
												'rounded-xl border p-4 text-left transition',
												selectedBarberId === barber.id
													? 'border-emerald-700 bg-emerald-700/10'
													: 'border-emerald-200 bg-white hover:border-emerald-400',
												reservationToReschedule ? 'cursor-not-allowed opacity-60' : ''
											)}
											onclick={() => !reservationToReschedule && (selectedBarberId = barber.id)}
											disabled={reservationToReschedule}
										>
											<div class="font-semibold text-emerald-900">{barber.name}</div>
											{#if barber.experience}
												<p class="text-xs text-stone-500">
													Pengalaman: {barber.experience}
												</p>
											{/if}
											{#if barber.skills}
												<p class="text-xs text-stone-500">Keahlian: {barber.skills}</p>
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div>
							<h4 class="mb-2 text-sm font-semibold text-stone-700">Pilih Layanan</h4>
							{#if services.length === 0}
								<p class="text-sm text-stone-400">Tidak ada layanan yang tersedia saat ini.</p>
							{:else}
								<div class="space-y-3">
									{#each services as service (service.id)}
										<button
											type="button"
											class={cn(
												'flex w-full items-center justify-between rounded-xl border p-4 text-left transition',
												selectedServiceId === service.id
													? 'border-emerald-700 bg-emerald-700/10'
													: 'border-emerald-200 bg-white hover:border-emerald-400',
												reservationToReschedule ? 'cursor-not-allowed opacity-60' : ''
											)}
											onclick={() => !reservationToReschedule && (selectedServiceId = service.id)}
											disabled={reservationToReschedule}
										>
											<div>
												<div class="font-semibold text-emerald-900">{service.name}</div>
												<p class="text-xs text-stone-500">{service.description}</p>
											</div>
											<div class="text-sm font-semibold text-emerald-800">
												{currencyFormatter.format(service.price)}
											</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div>
							<Label class="mb-2 block text-sm font-semibold text-stone-700">
								Catatan (Opsional)
							</Label>
							<Textarea
								rows={4}
								placeholder="Tambahkan permintaan khusus..."
								bind:value={specialRequest}
							/>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<Button variant="outline" onclick={goBack}>Kembali</Button>
						<Button
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
							<h3 class="text-lg font-semibold text-stone-700">Konfirmasi Reschedule</h3>
							<p class="text-sm text-stone-500">
								Periksa kembali perubahan reservasi Anda sebelum dikonfirmasi.
							</p>
						{:else}
							<h3 class="text-lg font-semibold text-stone-700">Pembayaran</h3>
							<p class="text-sm text-stone-500">
								Periksa kembali detail reservasi sebelum dikonfirmasi.
							</p>
						{/if}
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<div class="rounded-lg bg-orange-500 p-4 text-white">
							{#if reservationToReschedule}
								<div class="font-semibold">Ringkasan Reschedule</div>
							{:else}
								<div class="font-semibold">Ringkasan Reservasi</div>
							{/if}
							<div class="mt-3 space-y-2 text-sm">
								<div class="flex justify-between">
									<span>Tanggal</span>
									<span>{selectedDateDisplay ?? '-'}</span>
								</div>
								<div class="flex justify-between">
									<span>Jam</span>
									<span>{selectedTimeDisplay ?? '-'}</span>
								</div>
								<div class="flex justify-between">
									<span>Barber</span>
									<span>{selectedBarber?.name ?? '-'}</span>
								</div>
								<div class="flex justify-between">
									<span>Layanan</span>
									<span>{selectedService?.name ?? '-'}</span>
								</div>
							</div>
						</div>

						<div class="rounded-lg border p-4">
							<div class="font-semibold text-stone-700">Voucher</div>
							<p class="mt-2 text-xs text-stone-500">
								Pilih voucher yang ingin digunakan (opsional).
							</p>
							<Select.Root type="single" bind:value={voucherSelection}>
								<Select.Trigger class="mt-3 w-full justify-between">
									{selectedVoucher
										? (selectedVoucher.title ?? selectedVoucher.name ?? 'Voucher')
										: 'Pilih voucher'}
								</Select.Trigger>
								<Select.Content class="w-full">
									<Select.Item value="none">Tanpa Voucher</Select.Item>
									{#each vouchers as voucher (voucher.voucherID)}
										<Select.Item
											value={voucher.voucherID}
											label={voucher.title ?? voucher.name ?? 'Voucher'}
										>
											{voucher.title ?? voucher.name ?? 'Voucher'}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<Separator />

					<div class="space-y-2 text-sm">
						<div class="flex justify-between text-stone-700">
							<span>{selectedService?.name ?? 'Subtotal'}</span>
							<span>{currencyFormatter.format(subtotal)}</span>
						</div>
						<div class="flex justify-between text-emerald-700">
							<span>Diskon Voucher</span>
							<span>-{currencyFormatter.format(voucherDiscount)}</span>
						</div>
						<div class="flex justify-between text-red-600">
							<span>Biaya Admin</span>
							<span>+{currencyFormatter.format(adminFee)}</span>
						</div>
						<div class="flex justify-between text-base font-semibold text-emerald-900">
							<span>Total</span>
							<span>{currencyFormatter.format(total)}</span>
						</div>
					</div>

					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<Button variant="outline" onclick={goBack} class="sm:w-auto">Kembali</Button>
						<div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
							<label class="flex items-center gap-2 text-xs text-stone-600">
								<input type="checkbox" bind:checked={agreeTnc} />
								Saya telah membaca dan menyetujui syarat & ketentuan.
							</label>
							<Button class="sm:w-auto" disabled={loadingSubmit} onclick={handleSubmit}>
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
