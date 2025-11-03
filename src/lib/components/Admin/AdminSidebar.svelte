<script lang="ts">
	import SidebarHeader from '../ui/sidebar/sidebar-header.svelte';
	import ImagesIcon from '@lucide/svelte/icons/images';
	import HouseIcon from '@lucide/svelte/icons/house';
	import UserRoundIcon from '@lucide/svelte/icons/users-round';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
	import TicketsIcon from '@lucide/svelte/icons/tickets';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import LogoutIcon from '@lucide/svelte/icons/log-out';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js'; // Impor Tooltip
	import { page } from '$app/stores';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	const sidebar = useSidebar();

	// Fungsi untuk menangani klik menu pada mobile
	function handleMenuClick() {
		if (sidebar.isMobile) {
			sidebar.setOpenMobile(false);
		}
	}

	// Menu items
	const items = [
		{
			title: 'Dashboard',
			url: '/admin',
			icon: HouseIcon,
			tooltip: 'Go to Dashboard' // Tambahan tooltip
		},
		{
			title: 'Reservation',
			url: '/admin/Reservation',
			icon: CalendarCheckIcon,
			tooltip: 'Manage Reservations'
		},
		{
			title: 'Catalogue',
			url: '/admin/Catalogue',
			icon: ImagesIcon,
			tooltip: 'View Catalogue'
		},
		{
			title: 'Barber',
			url: '/admin/Barber',
			icon: UserRoundIcon,
			tooltip: 'Manage Barbers'
		},
		{
			title: 'Service',
			url: '/admin/Service',
			icon: ScissorsIcon,
			tooltip: 'Manage Services'
		},
		{
			title: 'Operational Time',
			url: '/admin/OperationalTime',
			icon: CalendarClockIcon,
			tooltip: 'Set Operational Hours'
		},
		{
			title: 'Chat',
			url: '/admin/Chat',
			icon: MessageCircleIcon,
			tooltip: 'Chat with Customers'
		},
		{
			title: 'Voucher',
			url: '/admin/Voucher',
			icon: TicketsIcon,
			tooltip: 'Manage Vouchers'
		}
	];
</script>

<!-- Mobile toggle button dengan Tooltip -->
<Tooltip.Provider>
	<!-- <button
		class="fixed top-4 left-4 z-50 rounded-md p-2 md:hidden"
		on:click={() => sidebar.toggle()}
	>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<MenuIcon class="h-6 w-6" />
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Toggle Sidebar</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</button> -->

	<Sidebar.Root {collapsible} {...restProps}>
		<Sidebar.Header>
			<img src="/three_lights_barbershop_logo.svg" alt="" class="p-4" />
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each items as item (item.title)}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Sidebar.MenuItem class="py-2">
										<Sidebar.MenuButton isActive={$page.url.pathname === item.url}>
											{#snippet child({ props })}
												<a href={item.url} {...props} on:click={handleMenuClick}>
													<item.icon class="h-6 w-6" />
													<span class="py-3 text-base">{item.title}</span>
													<Tooltip.Content>
														<p>{item.tooltip}</p>
													</Tooltip.Content>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								</Tooltip.Trigger>
							</Tooltip.Root>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer>
			<Sidebar.Menu>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								style="--sidebar-accent: #FCEAE9; --sidebar-accent-foreground: #E0514A;"
								class="cursor-pointer"
							>
								<LogoutIcon class="h-6 w-6" />
								<span class="py-3 text-base">Logout</span>
							</Sidebar.MenuButton>
							<Tooltip.Content>
								<p>Sign out of your account</p>
							</Tooltip.Content>
						</Sidebar.MenuItem>
					</Tooltip.Trigger>
				</Tooltip.Root>
			</Sidebar.Menu>
			<div class="items-left flex justify-center space-x-2 p-4 text-xs">
				<span>© 2025 by Three Lights Barbershop</span>
			</div>
		</Sidebar.Footer>
	</Sidebar.Root>
</Tooltip.Provider>
