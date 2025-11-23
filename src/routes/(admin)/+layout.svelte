<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AdminSidebar from '$lib/components/Admin/AdminSidebar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

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
	<Sidebar.Inset class="relative">
		<header
			bind:this={headerElement}
			class="sticky z-40 flex h-16 w-full shrink-0 items-center gap-2 bg-[#2e6057] shadow-md transition-transform duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
			class:header-hidden={!isHeaderVisible}
			style="transform: translateY({isHeaderVisible ? '0' : '-100%'})"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1 rounded-md p-2 text-white hover:bg-white/10" />
				<Separator orientation="vertical" class="mr-2 h-4 bg-white/30" />
				<span class="text-lg font-semibold text-white"> Three Lights Barbershop </span>
			</div>
		</header>

		<!-- Content wrapper with proper top padding to account for fixed header -->
		<div class="flex-1">
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

	/* Ensure header is always on top */
	header {
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	/* Smooth transitions for header visibility */
	header {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Add some visual enhancements */
	header::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #2e6057 0%, #1a3d34 100%);
		z-index: -1;
	}
</style>
