<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Clock, AlertCircle } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let {
		date,
		durationHours = 12 + 7,
		onExpire
	} = $props<{
		date: string;
		durationHours?: number;
		onExpire?: () => void;
	}>();

	let timeLeft = $state('');
	let isExpired = $state(false);
	let interval: ReturnType<typeof setInterval>;

	function calculateTimeLeft() {
		const startTime = new Date(date).getTime();
		const endTime = startTime + durationHours * 60 * 60 * 1000;
		const now = new Date().getTime();
		const difference = endTime - now;

		if (difference <= 0) {
			if (!isExpired) {
				isExpired = true;
				timeLeft = '00:00:00';
				if (interval) clearInterval(interval);
				if (onExpire) onExpire();
			}
			return;
		}

		const hours = Math.floor(difference / (1000 * 60 * 60));
		const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((difference % (1000 * 60)) / 1000);

		timeLeft = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		calculateTimeLeft();
		if (!isExpired) {
			interval = setInterval(calculateTimeLeft, 1000);
		}
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

{#if !isExpired}
	<div class="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 md:p-4" transition:fade>
		<div class="flex items-start gap-3">
			<div class="rounded-full bg-orange-500/20 p-1.5 text-orange-400 md:p-2">
				<Clock class="size-4 md:size-5" />
			</div>
			<div class="flex-1 space-y-1">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
					<p class="text-sm font-medium text-orange-300 md:text-base">Batas Pembayaran</p>
					<p class="font-mono text-base font-bold text-orange-400 md:text-lg">{timeLeft}</p>
				</div>
				<p class="text-[10px] leading-relaxed text-orange-300/70 md:text-xs">
					Silakan selesaikan pembayaran sebelum waktu habis untuk menghindari pembatalan otomatis.
				</p>
			</div>
		</div>
	</div>
{:else}
	<div class="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 md:p-4" transition:fade>
		<div class="flex items-start gap-3">
			<div class="rounded-full bg-orange-500/20 p-1.5 text-orange-400 md:p-2">
				<AlertCircle class="size-4 md:size-5" />
			</div>
			<div class="flex-1 space-y-1">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
					<p class="text-sm font-medium text-orange-300 md:text-base">Batas Pembayaran</p>
					<p class="font-mono text-base font-bold text-orange-400 md:text-lg">Expired</p>
				</div>
				<p class="text-[10px] leading-relaxed text-orange-300/70 md:text-xs">
					Silakan selesaikan pembayaran sebelum waktu habis untuk menghindari pembatalan otomatis.
				</p>
			</div>
		</div>
	</div>
{/if}
