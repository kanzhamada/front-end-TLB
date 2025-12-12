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
	import Calendar from '@lucide/svelte/icons/calendar';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import * as Select from '$lib/components/ui/select';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';
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
		getServices as getServicesApi, // Import with alias
		getPaymentFees,
		getCompanySettings,
		type PaymentFees
	} from '$lib/api/shared/api';
	import { createReservation } from '$lib/api/customer/reservation';
	import {
		getAvailableVouchers,
		buyVoucher,
		getProfile,
		type Voucher
	} from '$lib/api/customer/profile';
	import VoucherSelectionModal from './VoucherSelectionModal.svelte';
	import { authStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';

	let {
		triggerClass = '',
		triggerText = 'Reservasi',
		reservationToReschedule = null,
		initialNote = '',
		open = $bindable(false)
	} = $props();
	const dispatch = createEventDispatcher();

	console.log(initialNote);
	type Step = 'date' | 'time' | 'details' | 'payment';
	const stepOrder: Step[] = ['date', 'time', 'details', 'payment'];
	const steps = [
		{ key: 'date', label: 'Tanggal' },
		{ key: 'time', label: 'Waktu' },
		{ key: 'details', label: 'Detail' },
		{ key: 'payment', label: 'Pembayaran' }
	] satisfies { key: Step; label: string }[];

	let step: Step = $state('date');

	let loadingData = $state(false);
	let loadingSubmit = $state(false);
	let dataError = $state<string | null>(null);

	let operational = $state<OperationalDay[]>([]);
	let barbers = $state<Barber[]>([]);
	let services = $state<Service[]>([]);
	let vouchers = $state<OwnedVoucher[]>([]);
	let availableVouchers = $state<Voucher[]>([]);
	let userCoins = $state(0);

	let selectedYear = $state<number | null>(null);
	let selectedMonth = $state<number | null>(null);
	let selectedDayId = $state<string | null>(null);
	let selectedTimeId = $state<string | null>(null);
	let selectedBarberId = $state<string | null>(null);
	let selectedServiceId = $state<string | null>(null);
	let specialRequest = $state('');
	let typingRequest = $state('');

	$effect(() => {
		specialRequest = initialNote;
		console.log('specialRequest', specialRequest);
	});

	let voucherSelection = $state('none');
	let redeemCode = $state<string | null>(null);
	let redeemCodeDiscount = $state(0);
	let showVoucherModal = $state(false);
	let showReservationModal = $state(false);
	let agreeTnc = $state(false);
	let selectedPaymentMethod = $state<string | null>(null);
	let paymentFees = $state<PaymentFees | null>(null);
	let adminFee = $state(0);
	let paymentMethodFee = $state(0);

	const paymentMethods = [
		{
			category: 'E-Wallet',
			items: [
				{ id: 'shopeepay', label: 'ShopeePay', icon: 'shopeepay' },
				{ id: 'gopay', label: 'GoPay', icon: 'gopay' },
				{ id: 'dana', label: 'Dana', icon: 'dana' }
			]
		},
		{
			category: 'QRIS',
			items: [{ id: 'qris', label: 'QRIS', icon: 'qris' }]
		},
		{
			category: 'Bank Transfer',
			items: [
				{ id: 'permata_va', label: 'Permata Virtual Account', icon: 'permata' },
				{ id: 'bca_va', label: 'BCA Virtual Account', icon: 'bca' },
				{ id: 'mandiri_bill', label: 'Mandiri Bill Payment', icon: 'mandiri' },
				{ id: 'bni_va', label: 'BNI Virtual Account', icon: 'bni' },
				{ id: 'bri_va', label: 'BRI Virtual Account', icon: 'bri' },
				{ id: 'danamon_va', label: 'Danamon Virtual Account', icon: 'danamon' }
			]
		}
	];

	let loadAttempted = $state(false);
	let showLoginAlert = $state(false);

	function openVoucherModal() {
		showVoucherModal = true;
		showReservationModal = false;
	}

	function closeVoucherModal() {
		showVoucherModal = false;
		showReservationModal = true;
	}

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
	let total = $state(0);
	let selectedDateDisplay = $state<string | null>(null);
	let selectedTimeDisplay = $state<string | null>(null);

	// Persistence Logic
	const STORAGE_KEY = 'reservation_state';

	function saveState() {
		if (!browser) return;
		const state = {
			step,
			selectedYear,
			selectedMonth,
			selectedDayId,
			selectedTimeId,
			selectedBarberId,
			selectedServiceId,
			specialRequest,
			voucherSelection,
			redeemCode,
			redeemCodeDiscount,
			redeemCode,
			redeemCodeDiscount,
			agreeTnc,
			selectedPaymentMethod
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}

	function loadState() {
		if (!browser) return;
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const state = JSON.parse(saved);
				step = state.step || 'date';
				selectedYear = state.selectedYear;
				selectedMonth = state.selectedMonth;
				selectedDayId = state.selectedDayId;
				selectedTimeId = state.selectedTimeId;
				selectedBarberId = state.selectedBarberId;
				selectedServiceId = state.selectedServiceId;
				specialRequest = state.specialRequest || '';
				voucherSelection = state.voucherSelection || 'none';
				redeemCode = state.redeemCode || null;
				redeemCodeDiscount = state.redeemCodeDiscount || 0;
				agreeTnc = state.agreeTnc || false;
				selectedPaymentMethod = state.selectedPaymentMethod || null;

				// If we have saved state, we should open the modal automatically if it was closed during flow
				// But user requirement says "This behavior also applies when the user closes the modal"
				// which implies we just save it. We don't necessarily auto-open unless redirected back.
				// We'll handle auto-open logic if needed, but for now just restoring values.
			} catch (e) {
				console.error('Failed to load reservation state', e);
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	}

	function clearState() {
		if (!browser) return;
		localStorage.removeItem(STORAGE_KEY);
	}

	$effect(() => {
		// Save state whenever relevant variables change
		if (open) {
			saveState();
		}
	});

	$effect(() => {
		if (initialNote) {
			specialRequest = initialNote;
		}
	});

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
		if (voucherSelection === 'none') {
			selectedVoucher = null;
		} else {
			const matchingVouchers = vouchers.filter((v) => v.voucherID === voucherSelection);
			matchingVouchers.sort((a, b) => {
				const dateA = new Date((a.created_at as string) || 0).getTime();
				const dateB = new Date((b.created_at as string) || 0).getTime();
				return dateB - dateA;
			});
			selectedVoucher = matchingVouchers[0] ?? null;
		}
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
		if (selectedPaymentMethod && paymentFees) {
			let feeConfig;
			if (['shopeepay', 'gopay', 'dana', 'qris'].includes(selectedPaymentMethod)) {
				// Map qris to qris key in paymentFees
				const key = selectedPaymentMethod === 'qris' ? 'qris' : selectedPaymentMethod;
				feeConfig = paymentFees[key];
			} else {
				// Bank transfers
				feeConfig = paymentFees['bank_transfer'];
			}

			if (feeConfig) {
				if (feeConfig.type === 'fixed') {
					paymentMethodFee = feeConfig.value;
				} else if (feeConfig.type === 'percentage') {
					// Percentage of subtotal? Or subtotal - discount? Usually gross amount.
					// Let's assume subtotal for now, or subtotal - voucher?
					// Usually payment fee is based on the amount to be paid.
					// Amount to be paid = subtotal - voucher - redeem + admin
					// But admin fee is added to total.
					// Let's calculate base amount first.
					const baseAmount = Math.max(subtotal - voucherDiscount - redeemCodeDiscount, 0);
					paymentMethodFee = Math.ceil((baseAmount + adminFee) * 0.5 * feeConfig.value);
				}
			} else {
				paymentMethodFee = 0;
			}
		} else {
			paymentMethodFee = 0;
		}
	});

	$effect(() => {
		total = Math.max(
			subtotal - voucherDiscount - redeemCodeDiscount + adminFee + paymentMethodFee,
			0
		);
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

	// Example Calculation Logic
	let examplePaymentMethod = $derived(selectedPaymentMethod || 'qris');
	let exampleFeeConfig = $derived.by(() => {
		if (!paymentFees) return null;
		const key =
			examplePaymentMethod === 'qris'
				? 'qris'
				: ['shopeepay', 'gopay', 'dana'].includes(examplePaymentMethod)
					? examplePaymentMethod
					: 'bank_transfer';
		return paymentFees[key];
	});

	let exampleServiceFee = $derived.by(() => {
		if (!exampleFeeConfig) return 0;
		if (exampleFeeConfig.type === 'fixed') return exampleFeeConfig.value;

		const baseAmount = Math.max(subtotal - voucherDiscount - redeemCodeDiscount, 0);
		return Math.ceil((baseAmount + adminFee) * 0.5 * exampleFeeConfig.value);
	});

	let exampleTotal = $derived(
		Math.max(subtotal - voucherDiscount - redeemCodeDiscount + adminFee + exampleServiceFee, 0)
	);

	let exampleDP = $derived.by(() => {
		return Math.ceil((exampleTotal - exampleServiceFee) * 0.5 + exampleServiceFee);
	});

	let exampleSisa = $derived(exampleTotal - exampleDP);

	let error = $state<string | null>(null);
	$effect(() => {
		if (error) {
			toast.error(error);
		}
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
		redeemCode = null;
		redeemCodeDiscount = 0;
		specialRequest = '';
		agreeTnc = false;
		selectedPaymentMethod = null;
		clearState();
	}

	function initializeDateSelection(days: OperationalDay[]) {
		if (!days.length) {
			selectedYear = null;
			selectedMonth = null;
			selectedDayId = null;
			return;
		}

		// Only initialize if not already selected (e.g. from restored state)
		if (selectedYear && selectedMonth && selectedDayId) return;

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
		dataError = null;

		try {
			const [operationalRes, barbersRes, servicesRes, feesRes, settingsRes] = await Promise.all([
				getOperationalApi(fetch),
				getBarbersApi(fetch),
				getServicesApi(fetch),
				getPaymentFees(fetch),
				getCompanySettings(fetch)
			]);

			if (!operationalRes.success) {
				throw new Error(
					operationalRes.message ?? 'Tidak dapat memuat jadwal operasional. Coba lagi nanti.'
				);
			}

			if (!operationalRes.data || operationalRes.data.length === 0) {
				throw new Error('Tidak ada jadwal operasional yang tersedia saat ini.');
			}

			operational = operationalRes.data;
			initializeDateSelection(operationalRes.data);

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

			if (feesRes.success && feesRes.data) {
				paymentFees = feesRes.data;
			}

			if (settingsRes.success && settingsRes.data) {
				adminFee = settingsRes.data.admin_fee;
			}

			const token = get(authStore).session?.access_token;
			if (token) {
				const [vouchersRes, availableRes, profileRes] = await Promise.all([
					getOwnedVouchersApi(fetch, token),
					getAvailableVouchers(token),
					getProfile(token)
				]);

				if (vouchersRes.success && vouchersRes.data) {
					vouchers = vouchersRes.data;
				} else {
					vouchers = [];
				}

				if (availableRes.success && availableRes.data) {
					availableVouchers = availableRes.data;
				} else {
					availableVouchers = [];
				}

				if (profileRes.success && profileRes.data) {
					userCoins = profileRes.data.coin;
				}
			} else {
				vouchers = [];
				availableVouchers = [];
				userCoins = 0;
			}
		} catch (error) {
			console.error('Error in loadReservationData:', error);
			dataError =
				error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data reservasi.';
		} finally {
			loadingData = false;
		}
	}

	async function retryLoadReservationData() {
		if (open) {
			loadAttempted = false;
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

	async function handleLoginRedirect() {
		saveState();
		showLoginAlert = false;
		open = false;
		await goto('/auth/login');
	}

	async function handleSubmit() {
		error = null;
		if (!selectedBarberId || !selectedServiceId || !selectedTimeId) {
			error = 'Data reservasi belum lengkap.';
			return;
		}

		if (!agreeTnc) {
			error = 'Silakan setujui syarat dan ketentuan terlebih dahulu.';
			return;
		}

		if (!selectedPaymentMethod && !reservationToReschedule) {
			error = 'Silakan pilih metode pembayaran terlebih dahulu.';
			return;
		}

		const token = get(authStore).session?.access_token;
		if (!token) {
			showLoginAlert = true;
			return;
		}

		const session = get(authStore).session;
		if (session?.expires_at && Date.now() >= session.expires_at * 1000) {
			authStore.clear();
			showLoginAlert = true;
			error = 'Sesi login Anda telah berakhir. Silakan login kembali.';
			return;
		}

		loadingSubmit = true;
		try {
			if (reservationToReschedule) {
				const { rescheduleReservation } = await import('$lib/api/customer/reservation');
				const response = await rescheduleReservation(
					reservationToReschedule.reservationID,
					selectedTimeId,
					token
				);

				if (!response.success) {
					toast.error(response.message ?? 'Gagal mereschedule reservasi.');
					return;
				}

				toast.success('Reservasi berhasil direschedule!');
				open = false;
				clearState();

				const event = new CustomEvent('reservationCompleted', {
					detail: { success: true, type: 'reschedule' }
				});
				dispatch('reservationCompleted', { success: true, type: 'reschedule' });
			} else {
				const isBankTransfer = [
					'permata_va',
					'bca_va',
					'mandiri_bill',
					'bni_va',
					'bri_va',
					'danamon_va'
				].includes(selectedPaymentMethod!);

				const payloadPaymentMethod = isBankTransfer ? 'bank_transfer' : selectedPaymentMethod!;

				const response = await createReservation(
					{
						barberId: selectedBarberId,
						serviceId: selectedServiceId,
						dateTimeId: selectedTimeId,
						notes: specialRequest ? specialRequest.trim() : undefined,
						voucherId: voucherSelection !== 'none' ? voucherSelection : undefined,
						redeemCode: redeemCode ?? undefined,
						paymentMethod: payloadPaymentMethod
					},
					token
				);

				console.log(response);

				if (!response.success) {
					toast.error(response.error.message ?? 'Gagal membuat reservasi.');
					return;
				}

				toast.success('Reservasi berhasil dibuat!');

				open = false;
				clearState();
				await goto('/profile/reservation');
				window.location.reload();
			}
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			error = 'Terjadi kesalahan saat memproses reservasi.';
		} finally {
			loadingSubmit = false;
		}
	}

	$effect(async () => {
		if (open) {
			if (!loadAttempted) {
				// Try to load state first
				loadState();

				// If no state loaded (e.g. new session), reset selections only if not already set by loadState
				if (!selectedYear) {
					resetSelections();
				}

				await loadReservationData();
				loadAttempted = true;

				if (reservationToReschedule) {
					const matchingBarber = barbers.find(
						(b) => b.name === reservationToReschedule.barber.name
					);
					if (matchingBarber) {
						selectedBarberId = matchingBarber.id;
					}

					const matchingService = services.find(
						(s) =>
							s.name === reservationToReschedule.service.name &&
							s.price === reservationToReschedule.service.price
					);
					if (matchingService) {
						selectedServiceId = matchingService.id;
					}

					specialRequest = reservationToReschedule.notes || '';
					voucherSelection = reservationToReschedule.voucherId || 'none';
				}
			}
			// Removed else block that was causing infinite loop
		} else {
			loadAttempted = false;
		}
	});
</script>

<Sheet bind:open>
	<SheetTrigger>
		<Button class={cn(triggerClass)}><Calendar class="size-5" />{triggerText}</Button>
	</SheetTrigger>

	<SheetContent
		side="top"
		class="mx-auto mt-16 w-full max-w-5xl rounded-2xl border border-senary/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
	>
		<SheetHeader class="p-0">
			<SheetTitle class="sr-only">Reservation</SheetTitle>
			<SheetDescription class="sr-only">Create a new reservation</SheetDescription>
		</SheetHeader>

		<div class="mb-6 flex items-center justify-around gap-1 sm:justify-between sm:gap-3">
			{#each steps as { key, label }, index (key)}
				<div class="flex flex-1 items-center justify-center sm:justify-start">
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
							'ml-2 hidden text-sm font-medium transition-colors sm:block',
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
				<div
					class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 max-h-[60vh] overflow-y-auto pr-2"
				>
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
									<div
										class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 max-h-[500px] overflow-y-auto pr-2"
									>
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
				</div>
			{:else if step === 'time'}
				<div
					class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 max-h-[60vh] overflow-y-auto pr-2"
				>
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
				</div>
			{:else if step === 'details'}
				<div
					class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 max-h-[60vh] overflow-y-auto pr-2"
				>
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
									class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 h-[200px] overflow-y-auto pr-2 md:h-[400px]"
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
									class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 h-[200px] overflow-y-auto pr-2 md:h-[400px]"
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
													onclick={() =>
														!reservationToReschedule && (selectedServiceId = service.id)}
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
							{#if specialRequest}
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
							{:else}
								<div class="col-span-1 md:col-span-2">
									<Label class="mb-2 block text-sm font-semibold text-secondary/80">
										Catatan (Opsional)
									</Label>
									<Textarea
										rows={4}
										placeholder="Tambahkan permintaan khusus..."
										bind:value={typingRequest}
										class="border-white/10 bg-white/5 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/50"
									/>
								</div>
							{/if}
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
				</div>
			{:else if step === 'payment'}
				<div
					class="scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-senary/50 max-h-[60vh] overflow-y-auto pr-2"
				>
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

								<Button
									variant="outline"
									class="mt-3 w-full justify-between border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-white"
									disabled={reservationToReschedule}
									onclick={() => ((showVoucherModal = true), (showReservationModal = false))}
								>
									<span>
										{#if redeemCode}
											Kode Redeem Digunakan
										{:else}
											{selectedVoucher
												? (selectedVoucher.title ?? selectedVoucher.name ?? 'Voucher')
												: 'Pilih / Beli Voucher'}
										{/if}
									</span>
									<ChevronRight class="h-4 w-4 opacity-50" />
								</Button>
							</div>
						</div>

						{#if !reservationToReschedule}
							<div class="space-y-4">
								<h4 class="font-semibold text-secondary">Metode Pembayaran</h4>
								<Accordion.Root type="single" class="w-full space-y-2">
									{#each paymentMethods as group}
										<Accordion.Item value={group.category} class="border-b-0">
											<Accordion.Trigger
												class="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-secondary hover:bg-white/10 hover:no-underline data-[state=open]:bg-white/10"
											>
												{group.category}
											</Accordion.Trigger>
											<Accordion.Content class="pt-2">
												<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
													{#each group.items as item}
														<button
															type="button"
															class={cn(
																'flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-300',
																selectedPaymentMethod === item.id
																	? 'border-senary bg-senary/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
																	: 'border-white/10 bg-white/5 hover:border-senary/50 hover:bg-white/10'
															)}
															onclick={() => (selectedPaymentMethod = item.id)}
														>
															<!-- Placeholder icons -->
															<div class="flex size-8 items-center justify-center rounded">
																<img src="/payment-method/{item.icon}.svg" alt={item.label} />
															</div>
															<div class="flex flex-col">
																<span
																	class={cn(
																		'text-sm font-medium',
																		selectedPaymentMethod === item.id
																			? 'text-senary'
																			: 'text-secondary'
																	)}>{item.label}</span
																>
																{#if paymentFees}
																	{@const feeKey =
																		item.id === 'qris'
																			? 'qris'
																			: ['shopeepay', 'gopay', 'dana'].includes(item.id)
																				? item.id
																				: 'bank_transfer'}
																	{@const feeConfig = paymentFees[feeKey]}
																	{#if feeConfig}
																		<span class="text-xs text-secondary/60">
																			Biaya: {feeConfig.type === 'fixed'
																				? currencyFormatter.format(feeConfig.value)
																				: `${(feeConfig.value * 100).toFixed(1)}%`}
																		</span>
																	{/if}
																{/if}
															</div>
														</button>
													{/each}
												</div>
											</Accordion.Content>
										</Accordion.Item>
									{/each}
								</Accordion.Root>
							</div>
						{/if}

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
							{#if redeemCode}
								<div class="flex justify-between text-senary">
									<span>Redeem Code ({redeemCode})</span>
									<span>-{currencyFormatter.format(redeemCodeDiscount)}</span>
								</div>
							{/if}
							<div class="flex justify-between text-destructive">
								<span>Biaya Admin</span>
								<span>+{currencyFormatter.format(adminFee)}</span>
							</div>
							{#if paymentMethodFee > 0}
								<div class="flex justify-between text-destructive">
									<span>Biaya Layanan</span>
									<span>+{currencyFormatter.format(paymentMethodFee)}</span>
								</div>
							{/if}
							<div class="flex justify-between text-base font-semibold text-secondary">
								<span>Total</span>
								<span class="text-xl text-senary">{currencyFormatter.format(total)}</span>
							</div>
							<div class="flex justify-between text-base font-semibold text-secondary">
								<span>Biaya DP</span>
								<span class="text-xl text-senary"
									>{currencyFormatter.format(
										(total - paymentMethodFee) * 0.5 + paymentMethodFee
									)}</span
								>
							</div>
						</div>

						<!-- Terms and Conditions Accordion -->
						<Accordion.Root type="single" collapsible class="w-full">
							<Accordion.Item value="tnc" class="border-white/10">
								<Accordion.Trigger class="text-sm text-secondary hover:text-senary">
									Syarat & Ketentuan
								</Accordion.Trigger>
								<Accordion.Content class="text-sm text-secondary/70">
									<ul class="list-disc space-y-1 pl-4">
										<li>
											Reservasi yang sudah dibayar tidak dapat dibatalkan, namun dapat di-reschedule
											maksimal 1 kali.
										</li>
										<li>Harap datang 10 menit sebelum jadwal reservasi.</li>
										<li>
											Keterlambatan lebih dari 15 menit dapat menyebabkan pembatalan reservasi.
										</li>
										<li>Biaya admin tidak dapat dikembalikan.</li>
									</ul>
								</Accordion.Content>
							</Accordion.Item>

							<Accordion.Item value="calculation-example" class="border-white/10">
								<Accordion.Trigger class="text-sm text-secondary hover:text-senary">
									Cara Perhitungan Pembayaran
								</Accordion.Trigger>
								<Accordion.Content class="space-y-4 text-sm text-secondary/70">
									<div>
										<h4 class="mb-2 font-semibold text-senary">KOMPONEN BIAYA:</h4>
										<ul class="list-disc space-y-1 pl-4">
											<li>
												<span class="font-medium text-secondary">Harga Service:</span> Biaya layanan
												barbershop yang Anda pilih ({currencyFormatter.format(subtotal)})
											</li>
											<li>
												<span class="font-medium text-secondary">Biaya Admin:</span> Biaya tetap
												administrasi sistem reservasi ({currencyFormatter.format(adminFee)})
											</li>
											<li>
												<span class="font-medium text-secondary">Biaya Layanan:</span> Biaya
												transaksi dari metode pembayaran ({examplePaymentMethod === 'qris'
													? 'QRIS'
													: examplePaymentMethod === 'bank_transfer'
														? 'Bank Transfer'
														: examplePaymentMethod}: {exampleFeeConfig?.type === 'fixed'
													? currencyFormatter.format(exampleFeeConfig.value)
													: `${((exampleFeeConfig?.value ?? 0) * 100).toFixed(1)}%`})
											</li>
											<li>
												<span class="font-medium text-secondary">Diskon Voucher:</span> Potongan
												harga dari voucher yang Anda gunakan ({currencyFormatter.format(
													voucherDiscount + redeemCodeDiscount
												)})
											</li>
										</ul>
									</div>

									<div>
										<h4 class="mb-2 font-semibold text-senary">RUMUS PERHITUNGAN:</h4>
										<div class="space-y-3">
											<div class="rounded-lg border border-white/10 bg-white/5 p-3">
												<p class="mb-1 font-medium text-secondary">
													1. Biaya Layanan ({examplePaymentMethod === 'qris'
														? 'QRIS'
														: examplePaymentMethod}):
												</p>
												<div class="space-y-1 font-mono text-xs text-secondary/80">
													{#if exampleFeeConfig?.type === 'fixed'}
														<p>
															Biaya Layanan = {currencyFormatter.format(exampleFeeConfig.value)}
														</p>
													{:else}
														<p>
															Biaya Layanan = [(Harga Service - Diskon + Biaya Admin) ÷ 2] × {(
																(exampleFeeConfig?.value ?? 0) * 100
															).toFixed(1)}%
														</p>
														<p>
															= [({currencyFormatter.format(subtotal)} - {currencyFormatter.format(
																voucherDiscount + redeemCodeDiscount
															)} + {currencyFormatter.format(adminFee)}) ÷ 2] × {(
																(exampleFeeConfig?.value ?? 0) * 100
															).toFixed(1)}%
														</p>
														<p>
															= {currencyFormatter.format(
																(subtotal - (voucherDiscount + redeemCodeDiscount) + adminFee) / 2
															)} × {((exampleFeeConfig?.value ?? 0) * 100).toFixed(1)}%
														</p>
														<p class="font-bold text-senary">
															= {currencyFormatter.format(exampleServiceFee)}
														</p>
													{/if}
												</div>
											</div>

											<div class="rounded-lg border border-white/10 bg-white/5 p-3">
												<p class="mb-1 font-medium text-secondary">2. Total Pembayaran:</p>
												<div class="space-y-1 font-mono text-xs text-secondary/80">
													<p>
														Total = Harga Service - Diskon Voucher + Biaya Admin + Biaya Layanan
													</p>
													<p>
														= {currencyFormatter.format(subtotal)} - {currencyFormatter.format(
															voucherDiscount + redeemCodeDiscount
														)} + {currencyFormatter.format(adminFee)} + {currencyFormatter.format(
															exampleServiceFee
														)}
													</p>
													<p class="font-bold text-senary">
														= {currencyFormatter.format(exampleTotal)}
													</p>
												</div>
											</div>

											<div class="rounded-lg border border-white/10 bg-white/5 p-3">
												<p class="mb-1 font-medium text-secondary">3. Biaya Uang Muka (DP 50%):</p>
												<div class="space-y-1 font-mono text-xs text-secondary/80">
													<p>
														Biaya DP = [(Harga Service - Diskon Voucher + Biaya Admin) ÷ 2] + Biaya
														Layanan
													</p>
													<p>
														= [({currencyFormatter.format(subtotal)} - {currencyFormatter.format(
															voucherDiscount + redeemCodeDiscount
														)} + {currencyFormatter.format(adminFee)}) ÷ 2] + {currencyFormatter.format(
															exampleServiceFee
														)}
													</p>
													<p>
														= {currencyFormatter.format(
															(subtotal - (voucherDiscount + redeemCodeDiscount) + adminFee) / 2
														)} + {currencyFormatter.format(exampleServiceFee)}
													</p>
													<p class="font-bold text-senary">
														= {currencyFormatter.format(exampleDP)}
													</p>
												</div>
											</div>
										</div>
									</div>

									<div class="rounded-lg border border-senary/20 bg-senary/10 p-3">
										<h4 class="mb-2 font-semibold text-senary">CATATAN PENTING:</h4>
										<p class="mb-2">
											Anda membayar 50% (uang muka) saat reservasi sebesar <span
												class="font-bold text-senary">{currencyFormatter.format(exampleDP)}</span
											>, dan sisanya dibayar di tempat setelah layanan selesai.
										</p>
										<div class="mt-2 flex justify-between border-t border-senary/20 pt-2 text-xs">
											<span>Sisa pembayaran di tempat:</span>
											<span class="font-mono font-bold"
												>{currencyFormatter.format(exampleSisa)}</span
											>
										</div>
										<div class="flex justify-between pt-1 text-xs">
											<span>Total keseluruhan:</span>
											<span class="font-mono font-bold"
												>{currencyFormatter.format(exampleTotal)}</span
											>
										</div>
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>
				</div>

				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Button
						variant="outline"
						class="border-white/10 text-secondary hover:bg-white/10 hover:text-white sm:w-auto"
						onclick={goBack}>Kembali</Button
					>
					<div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
						<div class="flex items-center space-x-2">
							<Checkbox
								id="tnc"
								bind:checked={agreeTnc}
								class="border-white/20 data-[state=checked]:bg-senary data-[state=checked]:text-primary"
							/>
							<Label
								for="tnc"
								class="text-xs leading-none text-secondary/60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Saya menyetujui syarat & ketentuan
							</Label>
						</div>
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
								<div></div>
							{/if}
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</SheetContent>
</Sheet>

<VoucherSelectionModal
	bind:open={showVoucherModal}
	ownedVouchers={vouchers}
	{availableVouchers}
	{services}
	{userCoins}
	{selectedServiceId}
	selectedVoucherId={voucherSelection === 'none' ? null : voucherSelection}
	onClose={() => (showVoucherModal = false)}
	onSelect={(voucherId) => {
		voucherSelection = voucherId ?? 'none';
		if (voucherSelection !== 'none') {
			redeemCode = null;
			redeemCodeDiscount = 0;
		}
		showVoucherModal = false;
	}}
	onRedeemApply={(code, discount) => {
		redeemCode = code;
		redeemCodeDiscount = discount;
		voucherSelection = 'none';
		showVoucherModal = false;
	}}
	onBuy={async (voucher) => {
		const token = get(authStore).session?.access_token;
		if (!token) return;

		try {
			const response = await buyVoucher(voucher.voucherID, token);
			if (response.success) {
				toast.success('Voucher berhasil dibeli!');
				// Reload data
				await loadReservationData();
			} else {
				toast.error(response.message || 'Gagal membeli voucher');
			}
		} catch (e) {
			console.error('Error buying voucher:', e);
			toast.error('Terjadi kesalahan saat membeli voucher');
		}
	}}
/>

<AlertDialog open={showLoginAlert} onOpenChange={(open) => (showLoginAlert = open)}>
	<AlertDialogContent class="border border-white/10 bg-primary text-secondary">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-white">Login Diperlukan</AlertDialogTitle>
			<AlertDialogDescription class="text-secondary/70">
				Anda perlu masuk ke akun Anda untuk melanjutkan proses reservasi. Data reservasi Anda akan
				disimpan.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel
				class="border-white/10 bg-transparent text-secondary hover:bg-white/10 hover:text-white"
				onclick={() => (showLoginAlert = false)}
			>
				Batal
			</AlertDialogCancel>
			<AlertDialogAction
				class="bg-senary text-primary hover:bg-senary/90"
				onclick={handleLoginRedirect}
			>
				Masuk Sekarang
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<style>
	:global([data-slot='sheet-content']) {
		border-radius: 1rem;
	}
</style>
