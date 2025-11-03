<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { Plus, SearchIcon } from '@lucide/svelte/icons';
	import { today } from '@internationalized/date';
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date';

	let value = $state<CalendarDate | undefined>(today(getLocalTimeZone()));
	let selectedTime = $state<string | null>('10:00');
	const bookedDates = Array.from({ length: 3 }, (_, i) => new CalendarDate(2025, 6, 17 + i));
</script>

<div class="px-6 py-6">
	<div class="mx-auto max-w-7xl">
		<div class="rounded-xl">
			<div class=" mb-4 flex flex-col gap-4 sm:flex-row">
				<Button href={`/admin/OperationalTime/Create`} class="ml-auto">
					Add Date
					<Plus />
				</Button>
			</div>

			<!-- Content -->
			<Card.Root class="gap-0 border-0 p-0">
				<Card.Content class="relative border-0 p-0">
					<!-- Calendar Container - Centered -->
					<div class="flex justify-center border-0 p-6">
						<Calendar
							type="single"
							maxValue={new CalendarDate(
								today(getLocalTimeZone()).year,
								today(getLocalTimeZone()).month,
								today(getLocalTimeZone()).day + 14
							)}
							bind:value
							isDateUnavailable={(date) => bookedDates.some((d) => d.compare(date) === 0)}
							class="rounded-lg border bg-transparent p-2 shadow-sm [--cell-size:--spacing(10)] data-unavailable:line-through data-unavailable:opacity-100 md:[--cell-size:--spacing(12)]"
						/>
					</div>
				</Card.Content>
				<Card.Footer class="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row">
					<div class="text-sm">
						{#if value && selectedTime}
							View your selected date:
							<span class="font-medium">
								{value.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
									weekday: 'long',
									day: 'numeric',
									month: 'short'
								})}
							</span>
						{:else}
							Select a date.
						{/if}
					</div>
					<Button
						disabled={!value || !selectedTime}
						class="w-full md:ml-auto md:w-auto"
						variant="outline"
						href={`/admin/OperationalTime/Edit/${value?.toString()}`}
					>
						Continue
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</div>
