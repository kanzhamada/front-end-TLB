<!-- routes/reservations/+page.svelte -->
<script lang="ts">
	import DataTable from '$lib/components/Admin/Table/DataTable.svelte';
	import { reservationColumns as columns } from '$lib/columns/admin/reservationColumns';
	import CalendarIcon from '@lucide/svelte/icons/calendar-days';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import StatsCard from '$lib/components/Admin/Statistics/StatsCard.svelte';
	import { getReservations } from '$lib/api/admin/reservation';

	const statusOptions = [
		{
			value: '',
			label: 'All Status',
			className:
				' bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer rounded-full mb-2 mt-2 justify-center',
			color: '--accent: #ffffff; --accent-foreground: #6b7280'
		},
		{
			value: 'waiting-approve',
			label: 'Waiting Approve',
			className:
				'bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-pointer rounded-full mb-2 justify-center',
			color: '--accent: #ffffff; --accent-foreground: #f59e0b'
		},
		{
			value: 'on-going',
			label: 'On Going',
			className:
				'bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer rounded-full mb-2 justify-center',
			color: '--accent: #ffffff; --accent-foreground: #3b82f6'
		},
		{
			value: 'completed',
			label: 'Completed',
			className:
				'bg-green-50 text-green-700 border border-green-200 cursor-pointer rounded-full mb-2 justify-center',
			color: '--accent: #ffffff; --accent-foreground: #22c55e'
		},
		{
			value: 'canceled-by-user',
			label: 'Canceled by User',
			className:
				'bg-red-50 text-red-700 border border-red-200 cursor-pointer rounded-full mb-2 justify-center',
			color: '--accent: #ffffff; --accent-foreground: #ef4444'
		},
		{
			value: 'canceled-by-admin',
			label: 'Canceled by Admin',
			className:
				'bg-purple-50 text-purple-700 border border-purple-200 cursor-pointer rounded-full mb-2 justify-center',
			color: '--accent: #ffffff; --accent-foreground: #ef4444'
		}
	];

	let totalReservations: number = $state(0);
	let completedReservations: number = $state(0);
	let pendingReservations: number = $state(0);
	let ongoingReservations: number = $state(0);
	let completionRate: number = $state(0);

	let response = getReservations();

	// Calculate statistics
	totalReservations = response.reservations.length;
	completedReservations = response.reservations.filter((r) => r.status === 'completed').length;
	pendingReservations = response.reservations.filter((r) => r.status === 'waiting-approve').length;
	ongoingReservations = response.reservations.filter((r) => r.status === 'on-going').length;
	completionRate = Math.round((completedReservations / totalReservations) * 100);
</script>

<!-- Stats Cards -->
<div class="px-6 py-6">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
			<!-- @ts-ignore -->
			<StatsCard
				title="Completed"
				value={completedReservations}
				icon={TrendingUpIcon}
				bgColor="bg-green-50"
				iconColor="text-green-600"
			/>
			<StatsCard
				title="Pending"
				value={pendingReservations}
				icon={ClockIcon}
				bgColor="bg-yellow-50"
				iconColor="text-yellow-600"
			/>
			<StatsCard
				title="Ongoing"
				value={ongoingReservations}
				icon={UsersIcon}
				bgColor="bg-blue-50"
				iconColor="text-blue-600"
			/>
			<StatsCard
				title="Success Rate"
				value={`${completionRate}%`}
				icon={CalendarIcon}
				bgColor="bg-purple-50"
				iconColor="text-purple-600"
			/>
		</div>

		<!-- Data Table -->
		<div class="rounded-xl border border-gray-200/60 bg-white shadow-sm">
			<DataTable
				tableData={response.reservations}
				tableColumns={columns}
				entityName="reservation"
				searchConfig={{ enabled: true, column: 'customer', placeholder: 'Customer' }}
				filterConfig={{
					enabled: true,
					options: statusOptions,
					defaultColumn: 'status'
				}}
			/>
		</div>
	</div>
</div>
