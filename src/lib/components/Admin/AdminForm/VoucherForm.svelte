<script lang="ts">
	import { decode } from './../../../../../.svelte-kit/generated/client/app.js';
	import SaveButton from '$lib/components/Global/Button/SaveButton.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { type VoucherSchema } from '$lib/zod/schema';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select/index.js';
	import { toast } from 'svelte-sonner';
	import EditButton from '$lib/components/Global/Button/EditButton.svelte';
	import DeleteButton from '$lib/components/Global/Button/DeleteButton.svelte';
	import CancelButton from '$lib/components/Global/Button/CancelButton.svelte';
	import type { Voucher } from '$lib/types/adminTypes';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils.js';
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		today,
		parseDate,
		parseTime
	} from '@internationalized/date';

	// Define interfaces for better type safety
	interface VoucherDetail extends Voucher {}

	interface Props {
		data?: { form?: SuperValidated<Infer<VoucherSchema>> };
		detailData?: VoucherDetail;
		action: 'create' | 'view' | 'edit';
		title: string;
		success?: boolean;
		message?: string;
	}

	let { data, detailData, action, title, success, message }: Props = $props();

	// Default form data with proper typing
	const defaultFormData: Infer<VoucherSchema> = {
		id: '',
		title: '',
		startDate: {
			date: '',
			time: ''
		},
		expiredDate: {
			date: '',
			time: ''
		},
		description: '',
		service: '',
		value: 0
	};

	// Initialize form with better error handling
	const form = superForm(data?.form ?? defaultFormData, {
		dataType: 'json',
		onUpdated: ({ form }) => {
			if (form.valid && success) {
				const toastMessage = getSuccessMessage(action);
				toast.success(toastMessage);
				goto('/admin/Voucher');
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
				return 'Voucher has been created successfully';
			case 'edit':
				return 'Voucher has been updated successfully';
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
		$formData.title = detailData.title ?? '';
		$formData.startDate.date = detailData.startDate.date ?? '';
		$formData.startDate.time = detailData.startDate.time ?? '';
		$formData.expiredDate.date = detailData.expiredDate.date ?? '';
		$formData.expiredDate.time = detailData.expiredDate.time ?? '';
		$formData.description = detailData.description ?? '';
		$formData.service = detailData.service ?? '';
		$formData.value = detailData.value ?? 0;
	}

	const services = [
		{ value: 'Premium Haircut', label: 'Premium Haircut' },
		{ value: 'Classic Haircut', label: 'Classic Haircut' },
		{ value: 'Shave Bread', label: 'Shave Bread' }
	];

	const triggerContent = $derived(
		services.find((s) => s.value === $formData.service)?.label ?? 'Select a service'
	);

	const df = new DateFormatter('id-ID', {
		dateStyle: 'long'
		// dayPeriod: 'short'
	});

	let valueExpiredDate = $derived(
		$formData.expiredDate.date ? parseDate($formData.expiredDate.date) : undefined
	);

	let valueStartDate = $derived(
		$formData.startDate.date ? parseDate($formData.startDate.date) : undefined
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

		<!-- Title Field -->
		<Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Title
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<Input
							required
							{...props}
							bind:value={$formData.title}
							readonly={isReadonly}
							disabled={isSubmitting}
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter service title..."
							autocomplete="name"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.title?.length || 0}/50 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please enter the title of the service.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Start Date -->
		<div class=" rounded-lg bg-gray-200 p-4">
			<!-- Start Date Field -->
			<Form.Field {form} name="startDate.date">
				<Form.Control>
					{#snippet children({ props })}
						<div class="group space-y-2">
							<Form.Label
								class="mb-2 block text-sm font-semibold text-gray-700"
								for="startDate.date"
							>
								Start Date
								<span class="ml-1 text-red-500" aria-label="Required">*</span>
							</Form.Label>
							<div>
								<!-- Date Picker -->
								<div>
									<Popover.Root>
										<Popover.Trigger
											{...props}
											disabled={isReadonly}
											class={cn(
												buttonVariants({ variant: 'outline' }),
												'w-full justify-start pl-4 text-left font-normal',
												!valueStartDate && 'text-muted-foreground'
											)}
										>
											{valueStartDate
												? df.format(valueStartDate.toDate(getLocalTimeZone()))
												: 'Pick a date'}
											<CalendarIcon class="ml-auto size-4 opacity-50" />
										</Popover.Trigger>

										<Popover.Content class="w-auto p-0" side="top">
											<Calendar
												type="single"
												value={valueStartDate as DateValue}
												bind:placeholder
												calendarLabel="Start Date"
												minValue={today(getLocalTimeZone())}
												onValueChange={(v) => {
													if (v) {
														$formData.startDate.date = v.toString();
													} else {
														$formData.startDate.date = '';
													}
												}}
											/>
										</Popover.Content>
									</Popover.Root>
								</div>
							</div>
							<Form.Description class="mt-2 text-sm text-gray-500">
								Please enter the start date of the voucher.
							</Form.Description>
							<Form.FieldErrors />
							<input
								hidden
								value={$formData.startDate.date}
								name={props.name}
								id="startDate.date"
							/>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<!-- Time Picker -->

			<Form.Field {form} name="startDate.time">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex-1">
							<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
								Time
								<span class="ml-1 text-red-500" aria-label="Required">*</span>
							</Form.Label>
							<Input
								type="time"
								{...props}
								step="60"
								disabled={isReadonly}
								bind:value={$formData.startDate.time}
								class="w-full justify-start bg-background px-4 py-3 [&::-webkit-calendar-picker-indicator]:hidden"
							/>
						</div>
					{/snippet}
				</Form.Control>
				<Form.Description class="mt-2 text-sm text-gray-500">
					Please enter the start time of the voucher.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<!-- Expired Date -->
		<div class=" rounded-lg bg-gray-200 p-4">
			<!-- Expired Date Field -->
			<Form.Field {form} name="expiredDate.date">
				<Form.Control>
					{#snippet children({ props })}
						<div class="group space-y-2">
							<Form.Label
								class="mb-2 block text-sm font-semibold text-gray-700"
								for="expiredDate.date"
							>
								Expired Date
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
														$formData.expiredDate.date = v.toString();
													} else {
														$formData.expiredDate.date = '';
													}
												}}
											/>
										</Popover.Content>
									</Popover.Root>
								</div>
							</div>
							<Form.Description class="mt-2 text-sm text-gray-500">
								Please enter the expired date of the voucher.
							</Form.Description>
							<Form.FieldErrors />
							<input
								hidden
								value={$formData.expiredDate.date}
								name={props.name}
								id="expiredDate.date"
							/>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<!-- Time Picker -->

			<Form.Field {form} name="expiredDate.time">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex-1">
							<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
								Time
								<span class="ml-1 text-red-500" aria-label="Required">*</span>
							</Form.Label>
							<Input
								type="time"
								{...props}
								step="60"
								disabled={isReadonly}
								bind:value={$formData.expiredDate.time}
								class="w-full justify-start bg-background px-4 py-3 [&::-webkit-calendar-picker-indicator]:hidden"
							/>
						</div>
					{/snippet}
				</Form.Control>
				<Form.Description class="mt-2 text-sm text-gray-500">
					Please enter the expired time of the voucher.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<!-- Description Field -->
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 block text-sm font-semibold text-gray-700">
							Description
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<Textarea
							required
							{...props}
							readonly={isReadonly}
							disabled={isSubmitting}
							bind:value={$formData.description}
							class="min-h-[100px] w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Brief description about the voucher..."
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							{$formData.description?.length || 0}/255 characters
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please enter a brief description about the voucher.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Service Field -->
		<Form.Field {form} name="service">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Service
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>

						<Select.Root type="single" bind:value={$formData.service} name={props.name}>
							<Select.Trigger class="w-full" {...props} disabled={isReadonly}
								>{triggerContent}</Select.Trigger
							>
							<Select.Content
								class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Select.Group>
									<Select.Label>Services</Select.Label>
									{#each services as service (service.value)}
										<Select.Item
											value={service.value}
											disabled={isReadonly}
											label={service.label}
											class=" data-[highlighted]:bg-[#2E6057] data-[highlighted]:text-white"
											>{service.label}</Select.Item
										>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please select the service of the voucher.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Value Field -->
		<Form.Field {form} name="value">
			<Form.Control>
				{#snippet children({ props })}
					<div class="group">
						<Form.Label class="mb-2 flex items-center text-sm font-semibold text-gray-700">
							Value
							<span class="ml-1 text-red-500" aria-label="Required">*</span>
						</Form.Label>
						<!-- <div class="relative"> -->
						<!-- <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center">
								<span
									class="flex h-full items-center justify-center rounded-l-md border-r border-gray-200 bg-[#2E6057] px-3  text-sm font-medium text-white"
								>
									Rp
								</span>
							</div> -->

						<Input
							{...props}
							bind:value={$formData.value}
							class="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-all duration-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="100.000"
							required
							readonly={isReadonly}
							disabled={isSubmitting}
							type="number"
						/>
						<div class="mt-1 text-right text-xs text-gray-400">
							Max Value: 100%
							<!-- </div> -->
						</div>
					</div>
				{/snippet}
			</Form.Control>
			<Form.Description class="mt-2 text-sm text-gray-500">
				Please enter the price of the voucher.
			</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-3 border-t border-gray-100 pt-6">
			<CancelButton href="/admin/Voucher" disabled={isSubmitting} />

			{#if action === 'view'}
				<DeleteButton
					description="This action cannot be undone. This will permanently delete the voucher's information from the system."
					descriptionHighlight="Voucher Title: {detailData?.title}"
					disabled={isSubmitting}
				/>
				<EditButton {id} entityName="Voucher" disabled={isSubmitting} />
			{:else}
				<SaveButton disabled={isSubmitting} loading={isSubmitting} on:click={handleSubmit} />
			{/if}
		</div>
	</form>
</div>
