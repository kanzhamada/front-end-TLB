<script lang="ts">
	import { decode } from './../../../../../.svelte-kit/generated/client/app';
	import SaveButton from '$lib/components/Global/Button/SaveButton.svelte';
	import * as Form from '$lib/components/ui/form/index';
	import { Input } from '$lib/components/ui/input/index';
	import { type OperationalTimeSchema } from '$lib/zod/schema';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select/index';
	import { toast } from 'svelte-sonner';
	import EditButton from '$lib/components/Global/Button/EditButton.svelte';
	import DeleteButton from '$lib/components/Global/Button/DeleteButton.svelte';
	import CancelButton from '$lib/components/Global/Button/CancelButton.svelte';
	import type { OperationalTime } from '$lib/types/adminTypes';
	import { Calendar } from '$lib/components/ui/calendar/index';
	import * as Popover from '$lib/components/ui/popover/index';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import { buttonVariants } from '$lib/components/ui/button/index';
	import { Label } from '$lib/components/ui/label/index';
	import { cn } from '$lib/utils';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		today,
		parseDate,
		parseTime
	} from '@internationalized/date';
	import Chip from '$lib/components/ui/chip/chip.svelte';
	import ChipItem from '$lib/components/ui/chip/chip-item.svelte';

	let value: string[] = $state<string[]>([]); // track selected time slots

	const times = Array.from({ length: 24 }, (_, i) => {
		const totalMinutes = i * 60;
		const hour = Math.floor(totalMinutes / 60) + 0;
		const minute = totalMinutes % 60;
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	});

	// Define interfaces for better type safety
	interface OperationalTimeDetail extends OperationalTime {}

	interface Props {
		data?: { form?: SuperValidated<Infer<OperationalTimeSchema>> };
		detailData?: OperationalTimeDetail;
		action: 'create' | 'view' | 'edit';
		title: string;
		success?: boolean;
		message?: string;
	}

	let { data, detailData, action, title, success, message }: Props = $props();

	// Default form data with proper typing
	const defaultFormData: Infer<OperationalTimeSchema> = {
		id: '',
		date: '',
		hour: []
	};

	// Initialize form with better error handling
	const form = superForm(data?.form ?? defaultFormData, {
		dataType: 'json',
		onUpdated: ({ form }) => {
			if (form.valid && success) {
				const toastMessage = getSuccessMessage(action);
				toast.success(toastMessage);
				goto('/a1-portal-a16-tlb/OperationalTime');
			} else if (!form.valid && message) {
				toast.error(message);
			}
		},
		onError: ({ result }) => {
			toast.error('An error occurred while processing your request');
		}
	});

	const { form: formData, enhance, delayed, message: formMessage, submitting } = form;

	// Helper function for toast messages
	function getSuccessMessage(action: string): string {
		switch (action) {
			case 'create':
				return 'OperationalTime has been created successfully';
			case 'edit':
				return 'OperationalTime has been updated successfully';
			default:
				return 'Operation completed successfully';
		}
	}

	// Extract ID for better readability
	const id = detailData?.id ?? '';
	const isReadonly = action === 'view';
	const isSubmitting = $submitting || $delayed;

	function handleSubmit() {}

	// Initialize form data if detail data exists
	if (detailData) {
		$formData.id = detailData.id ?? '';
		$formData.date = detailData.date ?? '';
		$formData.hour = detailData.hour ?? [];
	}

	const df = new DateFormatter('id-ID', {
		dateStyle: 'long'
		// dayPeriod: 'short'
	});

	let valueExpiredDate = $derived(
		$formData.date ? parseDate($formData.date) : undefined
	);

	let placeholder = $state<DateValue>(today(getLocalTimeZone()));
</script>

<div class="flex-shrink-0 border-b border-gray-100 p-6">
	<div class="mb-8 text-left">
		<h1 class="text-2xl font-bold text-stone-700 sm:text-3xl">{title}</h1>
	</div>

	<SuperDebug data={$formData} />

	<form method="POST" use:enhance class="space-y-8">
		<Form.Field {form} name="id">
			<Form.Control>
				{#snippet children({ props })}
					<Input type="hidden" {...props} bind:value={$formData.id} />
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Date -->
		<Form.Field {form} name="date">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group space-y-2">
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700" for="date">
							Select Date
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<div>
							<!-- Date Picker -->
							<div>
								<Popover.Root>
									<Popover.Trigger
										disabled={isReadonly}
										{...props}
										class={cn(
											buttonVariants({ variant: 'outline' }),
											'w-full justify-start pl-4 text-left font-normal',
											!valueExpiredDate && 'text-muted-foreground'
										)}
									>
										{valueExpiredDate
											? df.format(valueExpiredDate.toDate(getLocalTimeZone()))
											: 'Pick a date'}
										<CalendarIcon class="ml-auto size-4 opacity-50" />
									</Popover.Trigger>

									<Popover.Content class="w-auto p-0" side="top">
										<Calendar
											type="single"
											readonly={isReadonly}
											value={valueExpiredDate as DateValue}
											bind:placeholder
											calendarLabel="Expired Date"
											minValue={today(getLocalTimeZone())}
											onValueChange={(v) => {
												if (v) {
													$formData.date = v.toString();
												} else {
													$formData.date = '';
												}
											}}
										/>
									</Popover.Content>
								</Popover.Root>
							</div>
						</div>
						<Form.Description class="mt-2 text-sm text-gray-500">
							Please enter the expired date of the operational date.
						</Form.Description>
						<Form.FieldErrors />
						<input hidden value={$formData.date} name={props.name} id="date" />
					</div>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Time Field -->
		<Form.Field {form} name="hour">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group space-y-2">
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700" for="hour">
							Select Times
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>

						<Chip bind:value={$formData.hour}>
							<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
								{#each times as time (time)}
									<ChipItem value={time}>
										<span class="block w-full text-center">{time}</span>
									</ChipItem>
								{/each}
							</div>
						</Chip>

						<Form.Description class="mt-2 text-sm text-gray-500">
							Please enter the start date of the operational time.
						</Form.Description>
						<Form.FieldErrors />
						<input hidden value={$formData.hour} name={props.name} id="hour" />
					</div>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3 border-t border-gray-100 pt-6">
			<CancelButton href="/a1-portal-a16-tlb/OperationalTime" disabled={isSubmitting} />

			{#if action === 'view'}
				<DeleteButton
					description="This action cannot be undone. This will permanently delete the operational time's information from the system."
					descriptionHighlight="Operational Time Title: {detailData?.date}"
					disabled={isSubmitting}
				/>
				<EditButton {id} entityName="OperationalTime" disabled={isSubmitting} />
			{:else}
				<SaveButton disabled={isSubmitting} loading={isSubmitting} on:click={handleSubmit} />
			{/if}
		</div>
	</form>
</div>
