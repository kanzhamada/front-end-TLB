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
		Menu as MenuIcon,
		DollarSign
	} from 'lucide-svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { unreadChatCount } from '$lib/stores/chat';
	import { logout } from '$lib/api/auth';
    import { authStore } from '$lib/stores/auth';
	import { toast } from 'svelte-sonner';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	const sidebar = useSidebar();

	// Function to handle logout
	async function handleLogout() {
		try {
			const token = $page.data.session?.access_token;
			if (token) {
				await logout(token);
			}
            
            // Delete the auth session cookie
            document.cookie = "tlb.auth.session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            
            // Clear LocalStorage and Auth Store
            localStorage.removeItem('tlb.auth.session');
            authStore.clear();

			toast.success('Logged out successfully');
			// Force hard redirect to login to clear any state
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout failed:', error);
            // Ensure cleanup happens even if API fails
            document.cookie = "tlb.auth.session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            localStorage.removeItem('tlb.auth.session');
            authStore.clear();
            
			window.location.href = '/login'; 
		}
	}

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
			url: '/a1-portal-a16-tlb',
			icon: HouseIcon,
			tooltip: 'Go to Dashboard'
		},
		{
			title: 'Reservation',
			url: '/a1-portal-a16-tlb/Reservation',
			icon: CalendarCheckIcon,
			tooltip: 'Manage Reservations'
		},
		{
			title: 'Catalogue',
			url: '/a1-portal-a16-tlb/Catalogue',
			icon: ImagesIcon,
			tooltip: 'View Catalogue'
		},
		{
			title: 'Barber',
			url: '/a1-portal-a16-tlb/Barber',
			icon: UserRoundIcon,
			tooltip: 'Manage Barbers'
		},
		{
			title: 'Service',
			url: '/a1-portal-a16-tlb/Service',
			icon: ScissorsIcon,
			tooltip: 'Manage Services'
		},
		{
			title: 'Operational Time',
			url: '/a1-portal-a16-tlb/OperationalTime',
			icon: CalendarClockIcon,
			tooltip: 'Set Operational Hours'
		},
		{
			title: 'Chat',
			url: '/a1-portal-a16-tlb/Chat',
			icon: MessageCircleIcon,
			tooltip: 'Chat with Customers'
		},
		{
			title: 'Finance',
			url: '/a1-portal-a16-tlb/Finance',
			icon: DollarSign,
			tooltip: 'Manage Finances'
		},
		{
			title: 'Voucher',
			url: '/a1-portal-a16-tlb/Voucher',
			icon: TicketsIcon,
			tooltip: 'Manage Vouchers'
		},
		{
			title: 'Settings',
			url: '/a1-portal-a16-tlb/Settings',
			icon: MenuIcon,
			tooltip: 'Website Settings'
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
	<Sidebar.Root
		bind:ref
		{collapsible}
		{...restProps}
		class="border-r border-white/10 bg-slate-950/50 backdrop-blur-md"
	>
		<Sidebar.Header class="border-b border-white/10 bg-transparent">
			<img src="/three_lights_barbershop_logo.svg" alt="Three Lights Barbershop" class="p-4" />
		</Sidebar.Header>
		<Sidebar.Content class="bg-transparent">
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu class="space-y-2 px-2">
						{#each items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={$page.url.pathname === item.url}
									tooltipContent={item.tooltip}
									class="w-full justify-start rounded-xl px-4 py-3 text-secondary/70 transition-all duration-300 hover:bg-white/5 hover:pl-6 hover:text-senary data-[active=true]:bg-senary/10 data-[active=true]:text-senary data-[active=true]:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
									onclick={() => {
										handleMenuClick();
										goto(item.url);
									}}
								>
									<item.icon class="h-6 w-6" />
									<span class="relative ml-3 py-3 text-base font-light">
										{item.title}
										{#if item.title === 'Chat' && unreadCount > 0}
											<span class="absolute -top-1 -right-1 flex h-5 w-5">
												<span class="relative flex h-5 w-5 items-center justify-center">
													<span
														class="absolute inline-flex h-full w-full animate-ping rounded-full bg-senary opacity-75"
													></span>
													<span class="relative inline-flex h-3 w-3 rounded-full bg-senary"></span>
												</span>
												<span
													class="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[0.6rem] font-bold text-primary"
												>
													{unreadCount > 9 ? '9+' : unreadCount}
												</span>
											</span>
										{/if}
									</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer class="border-t border-white/10 bg-transparent">
			<Sidebar.Menu class="px-2 pb-4">
				<Sidebar.MenuItem>
					<form action="?/logout" method="POST" class="w-full">
						<Sidebar.MenuButton
							type="submit"
							tooltipContent="Sign out of your account"
							class="w-full justify-start rounded-xl px-4 py-3 text-red-400/80 transition-all duration-300 hover:bg-red-500/10 hover:pl-6 hover:text-red-400"
						>
							<LogoutIcon class="h-5 w-5" />
							<span class="ml-3 text-base font-light">Logout</span>
						</Sidebar.MenuButton>
					</form>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
			<div class="items-left flex justify-center space-x-2 p-4 text-xs text-secondary/50">
				<span>© 2025 by Three Lights Barbershop</span>
			</div>
		</Sidebar.Footer>
	</Sidebar.Root>
</Tooltip.Provider>
