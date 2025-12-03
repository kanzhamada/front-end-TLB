<script lang="ts">
	import type { ChatSession } from '$lib/api/admin/chat';
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';
	import * as AvatarPrimitive from '$lib/components/ui/avatar';
	import { cn } from '$lib/utils';

	let { sessions, selectedChatId, onSelect } = $props<{
		sessions: ChatSession[];
		selectedChatId: string | null;
		onSelect: (session: ChatSession) => void;
	}>();

	let searchQuery = $state('');

	let filteredSessions = $derived(
		sessions.filter((s) => (s.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()))
	);

	const formatTime = (isoString: string) => {
		if (!isoString) return '';
		const date = new Date(isoString);
		const now = new Date();
		const isToday = date.toDateString() === now.toDateString();
		
		if (isToday) {
			return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
		} else {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	};
</script>

<div class="flex h-full w-full flex-col border-r border-white/10 bg-black/20 backdrop-blur-md">
	<!-- Header -->
	<div class="p-4 border-b border-white/10">
		<h2 class="text-xl font-bold text-secondary mb-4">Messages</h2>
		<div class="relative">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-secondary/50" />
			<Input
				placeholder="Search chats..."
				bind:value={searchQuery}
				class="h-10 rounded-xl border-white/10 bg-white/5 pl-10 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary"
			/>
		</div>
	</div>

	<!-- List -->
	<div class="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
		{#each filteredSessions as session (session.chatID)}
			<button
				onclick={() => onSelect(session)}
				class={cn(
					"w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group relative overflow-hidden",
					selectedChatId === session.chatID 
						? "bg-senary/10 border border-senary/20" 
						: "hover:bg-white/5 border border-transparent"
				)}
			>
				{#if selectedChatId === session.chatID}
					<div class="absolute left-0 top-0 bottom-0 w-1 bg-senary"></div>
				{/if}

				<div class="relative">
					<AvatarPrimitive.Root class="h-12 w-12 rounded-full border border-white/10 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
						<AvatarPrimitive.Image
							src={session.customerPhoto}
							alt={session.customerName}
							class="aspect-square h-full w-full object-cover"
						/>
						<AvatarPrimitive.Fallback
							class="flex h-full w-full items-center justify-center bg-slate-800 text-secondary font-medium"
						>
							{(session.customerName || '?').charAt(0)}
						</AvatarPrimitive.Fallback>
					</AvatarPrimitive.Root>
					{#if session.unreadCount > 0}
						<span
							class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-senary text-[10px] font-bold text-primary shadow-lg ring-2 ring-black"
						>
							{session.unreadCount}
						</span>
					{/if}
				</div>

				<div class="min-w-0 flex-1">
					<div class="flex items-center justify-between mb-0.5">
						<h3 class={cn(
							"truncate font-medium transition-colors",
							selectedChatId === session.chatID ? "text-senary" : "text-secondary group-hover:text-white"
						)}>
							{session.customerName || 'Unknown Customer'}
						</h3>
						<span class="text-[10px] text-secondary/50 font-medium">{formatTime(session.lastMessageTime)}</span>
					</div>
					<p class={cn(
						"truncate text-xs",
						session.unreadCount > 0 ? "text-secondary font-medium" : "text-secondary/60"
					)}>
						{session.lastMessage}
					</p>
				</div>
			</button>
		{/each}

		{#if filteredSessions.length === 0}
			<div class="p-8 text-center text-secondary/40 text-sm">
				No chats found.
			</div>
		{/if}
	</div>
</div>
