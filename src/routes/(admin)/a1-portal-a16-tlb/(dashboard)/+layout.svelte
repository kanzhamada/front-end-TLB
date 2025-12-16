<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AdminSidebar from '$lib/components/Admin/AdminSidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from 'lucide-svelte';

	let { children } = $props();

	let loading = $state(false);

	let headerElement: HTMLElement;
	let lastScrollY = 0;
	let isHeaderVisible = $state(true);
	let scrollDirection = 'up';

	onMount(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Determine scroll direction
			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				// Scrolling down and past threshold
				scrollDirection = 'down';
				isHeaderVisible = false;
			} else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
				// Scrolling up or at top
				scrollDirection = 'up';
				isHeaderVisible = true;
			}

			lastScrollY = currentScrollY;
		};

		// Add scroll event listener with throttling
		let ticking = false;
		const throttledScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					handleScroll();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', throttledScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', throttledScroll);
		};
	});
</script>

<Sidebar.Provider>
	<AdminSidebar />
	<Sidebar.Inset class="relative bg-background min-h-screen overflow-hidden selection:bg-senary/30">
		<!-- Global Background Effects -->
		<div class="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-senary/5 via-background to-background pointer-events-none z-0"></div>
		<div class="fixed top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>
		
		<!-- Decorative Orbs -->
		<div class="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-senary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
		<div class="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

		<header
			bind:this={headerElement}
			class="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-border/20 bg-background/50 px-6 backdrop-blur-xl transition-all duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-16"
			class:header-hidden={!isHeaderVisible}
			style="transform: translateY({isHeaderVisible ? '0' : '-100%'})"
		>
			<div class="flex items-center gap-4">
				<Sidebar.Trigger class="rounded-xl p-2 text-muted-foreground hover:bg-white/5 hover:text-senary transition-colors duration-300" />
				<Separator orientation="vertical" class="h-6 bg-border/20" />
				<div class="flex items-center gap-3">
					<div class="hidden md:block">
						<h1 class="text-sm font-bold tracking-[0.2em] text-foreground uppercase leading-none">Three Lights</h1>
						<p class="text-[9px] font-medium tracking-[0.3em] text-senary/80 uppercase leading-none mt-1">Barbershop</p>
					</div>
				</div>
			</div>

            <!-- Header Actions / Status could go here -->
            <div class="flex items-center gap-4">
                 <!-- Add any header-right actions here if needed -->
				 <Button
					variant="outline"
					size="sm"
					class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-white"
					onclick={() => {
						loading = true;
						window.location.reload();
					}}
					disabled={loading}
				>
					<RefreshCw class="mr-2 size-4 {loading ? 'animate-spin' : ''}" />
					Refresh
				</Button>
            </div>
		</header>

		<!-- Content wrapper -->
		<div class="relative flex-1 z-10">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<style>
	:global(.sidebar-root) {
		transition: transform 0.3s ease;
	}

	:global(.sidebar-collapsed) {
		transform: translateX(-100%);
	}

	@media (min-width: 768px) {
		:global(.sidebar-collapsed) {
			transform: translateX(0);
		}
	}

	/* Header animations */
	.header-hidden {
		transform: translateY(-100%) !important;
	}
	
	/* Smooth transitions for header visibility */
	header {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>