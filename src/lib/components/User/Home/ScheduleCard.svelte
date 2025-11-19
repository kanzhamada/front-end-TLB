<script>
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import Clock from '@lucide/svelte/icons/clock';

	export let item = { day: '', time: '' };
	const isOff = item.time === 'Off';

	// 1. Define the base classes that are *always* applied.
	//    Notice I removed `via-70%` and `to-95%` from here.
	const baseClasses =
		'relative overflow-hidden rounded-lg border-0 bg-linear-50 from-zinc-950 from-1% p-2 text-white shadow-md';

	// 2. Define the *conditional* classes that will be added.
	//    Now, the gradient stops (`via-70%`, `to-95%`) are correctly
	//    paired with their respective colors.
	const colorClasses = isOff
		? 'via-orange-400 via-70% to-orange-400 to-95%'
		: 'via-primary via-70% to-primary to-95%';

	// 3. Combine them into a single string.
	const finalClasses = `${baseClasses} ${colorClasses}`;
</script>

<Card class={finalClasses}>
	<Clock
		class="absolute top-1/2 left-[12.5%] z-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 opacity-10"
		stroke-width="1"
	/>

	<CardHeader class="relative z-10 text-center">
		<CardTitle class="text-lg capitalize">{item.day}</CardTitle>
		<CardContent class="text-center font-semibold">{item.time}</CardContent>
	</CardHeader>
</Card>
