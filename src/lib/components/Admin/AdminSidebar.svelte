<script lang="ts">
	import SidebarHeader from '../ui/sidebar/sidebar-header.svelte';
	import {
		Images as ImagesIcon,
		House as HouseIcon,
		UserRound as UserRoundIcon,
		CalendarCheck as CalendarCheckIcon,
		Ticket as TicketsIcon,
		MessageCircle as MessageCircleIcon,
		Scissors as ScissorsIcon,
		CalendarClock as CalendarClockIcon,
		LogOut as LogoutIcon,
		Menu as MenuIcon
	} from 'lucide-svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { page } from '$app/stores';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { unreadChatCount } from '$lib/stores/chat';

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
			tooltip: 'Go to Dashboard'
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

	// Get unread count value for display
	let unreadCount = $state(0);

	// Subscribe to the unreadChatCount store
	$effect(() => {
		const unsubscribe = unreadChatCount.subscribe((value) => {
			unreadCount = value;
		});
		return unsubscribe;
	});
</script>

<Tooltip.Provider>
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
												<a href={item.url} {...props} onclick={handleMenuClick}>
													<item.icon class="h-6 w-6" />
													<span class="relative py-3 text-base">
														{item.title}
														{#if item.title === 'Chat' && unreadCount > 0}
															<span class="absolute -top-1 -right-1 flex h-5 w-5">
																<span class="relative flex h-5 w-5 items-center justify-center">
																	<span
																		class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"
																	></span>
																	<span class="relative inline-flex h-3 w-3 rounded-full bg-red-500"
																	></span>
																</span>
																<span
																	class="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[0.6rem] font-bold text-white"
																>
																	{unreadCount > 9 ? '9+' : unreadCount}
																</span>
															</span>
														{/if}
													</span>
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
