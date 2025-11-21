<script>
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import Clock from '@lucide/svelte/icons/clock';

	export let item = { day: '', time: '' };
	const isOff = item.time === 'Off';

	//class="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm transition-all hover:border-emerald-500/30"

	// 1. Define the base classes that are *always* applied.
	const baseClasses =
		'relative overflow-hidden rounded-xl border border-white/10 bg-white/5  p-4 text-white shadow-lg backdrop-blur-sm transition-all hover:border-senary hover:bg-white/5';

	// 2. Define the *conditional* classes that will be added.
	const colorClasses = isOff
		? 'border-red-500/20 bg-red-500/50 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500'
		: 'hover:text-senary';
	// 3. Combine them into a single string.
	const finalClasses = `${baseClasses} ${colorClasses}`;
</script>

<Card class={finalClasses}>
	<Clock
		class="absolute top-1/2 left-[12.5%] z-0 h-35 w-35 -translate-x-1/2 -translate-y-1/2 opacity-10"
		stroke-width="1"
	/>

	<CardHeader class="relative z-10 flex flex-row items-center justify-center text-center">
		<CardTitle class="text-lg capitalize">{item.day}</CardTitle>
		<CardContent class="text-center font-semibold">{item.time}</CardContent>
	</CardHeader>
</Card>

