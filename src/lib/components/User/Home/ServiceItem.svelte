<script>
	import * as Accordion from '$lib/components/ui/accordion';

	export let value = '1';
	export let title = 'Service Title';
	export let price = 'Rp 0';
	export let description = 'Service description...';
</script>

<Accordion.Item {value} class="overflow-hidden rounded-lg border-0 shadow-md">
	<Accordion.Trigger
		class="flex w-full cursor-pointer items-center justify-between bg-linear-50 from-zinc-950 from-1% via-primary via-70% to-primary to-95% px-6 py-4
        
        text-white transition-all duration-200
        
        hover:no-underline hover:brightness-69 data-[state=open]:bg-[#192b19]"
	>
		<span class="text-left text-lg">
			{title} <span class="font-bold"> | {price}</span>
		</span>
	</Accordion.Trigger>
	<Accordion.Content class="w-full rounded-lg bg-white px-6 py-4 text-[#2e6057]">
		{description}
	</Accordion.Content>
</Accordion.Item>
