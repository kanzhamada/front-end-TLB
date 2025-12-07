<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { spring } from 'svelte/motion';

	let coords = spring(
		{ x: -100, y: -100 },
		{
			stiffness: 0.15,
			damping: 0.7
		}
	);

	let size = spring(20, {
		stiffness: 0.1,
		damping: 0.4
	});

	let isHovering = false;
	let isClicking = false;

	function handleMouseMove(e: MouseEvent) {
		coords.set({ x: e.clientX, y: e.clientY });
	}

	function handleMouseDown() {
		isClicking = true;
		size.set(15);
	}

	function handleMouseUp() {
		isClicking = false;
		size.set(isHovering ? 60 : 20);
	}

	function handleLinkHover(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (
			target.tagName === 'A' ||
			target.tagName === 'BUTTON' ||
			target.closest('a') ||
			target.closest('button') ||
			target.classList.contains('cursor-pointer')
		) {
			isHovering = true;
			size.set(10);
		} else {
			isHovering = false;
			size.set(20);
		}
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseover', handleLinkHover);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('mouseover', handleLinkHover);
		}
	});
</script>

<div
	class="pointer-events-none fixed z-[9999] mix-blend-difference"
	style="
        left: {$coords.x}px;
        top: {$coords.y}px;
        width: {$size}px;
        height: {$size}px;
        transform: translate(-50%, -50%);
    "
>
	<div
		class="h-full w-full rounded-full bg-white transition-opacity duration-300"
		class:opacity-50={isHovering}
		class:opacity-100={!isHovering}
	></div>
</div>

<style>
	/* Ensure the cursor doesn't interfere with clicks */
	:global(body) {
		cursor: none;
	}

	/* Restore default cursor for touch devices or if JS fails */
	@media (hover: none) {
		:global(body) {
			cursor: auto;
		}
		div {
			display: none;
		}
	}
</style>
