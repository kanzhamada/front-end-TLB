<script>
	import * as Accordion from '$lib/components/ui/accordion';

	export let value = '1';
	export let title = 'Service Title';
	export let price = 'Rp 0';
	export let description = 'Service description...';
</script>

<Accordion.Item
	{value}
	class="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm transition-all hover:border-senary"
>
	<Accordion.Trigger
		class="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-white transition-all duration-200 hover:bg-white/5 hover:text-senary hover:no-underline data-[state=open]:bg-white/5 data-[state=open]:text-white"
	>
		<span class="text-left text-lg font-medium">
			{title} <span class="ml-2 font-bold text-senary">| {price}</span>
		</span>
	</Accordion.Trigger>
	<Accordion.Content class="w-full border-t border-white/10 bg-black/20 px-6 py-4 text-slate-300">
		{description}
	</Accordion.Content>
</Accordion.Item>
