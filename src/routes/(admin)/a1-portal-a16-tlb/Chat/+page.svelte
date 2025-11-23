<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase/client';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { MessageCircle, Clock, User } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { getAdminChatInbox } from '$lib/api/shared/chat';
	import type { ChatInboxItem } from '$lib/api/shared/chat';
	import { updateChatInbox, updateUnreadCount } from '$lib/stores/chat';

	let chats: ChatInboxItem[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let realtimeSubscription: any = null;

	onMount(async () => {
		await loadChats();
		setupRealtimeListener();
	});

	onDestroy(() => {
		if (realtimeSubscription) {
			realtimeSubscription.unsubscribe();
		}
	});

	function setupRealtimeListener() {
		// Listen for changes in messages table to update inbox in real-time
		realtimeSubscription = supabase
			.channel('inbox-changes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
				},
				(payload) => {
					// Refresh the entire chat list to update unread counts and last messages
					loadChats();
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'messages',
				},
				(payload) => {
					// Refresh when read status changes
					loadChats();
				}
			)
			.subscribe();
	}

	async function loadChats() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await getAdminChatInbox(token);
			if (!response.success || !response.data) {
				throw new Error(response.message || 'Failed to load chats');
			}

			chats = response.data;

			// Update the global store
			updateChatInbox(chats);

			// Calculate and update unread count
			const unreadCount = chats.reduce((total, chat) => total + chat.unread_count, 0);
			updateUnreadCount(unreadCount);
		} catch (err) {
			console.error('Error loading chats:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading chats';
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function handleChatSelect(chatId: string) {
		goto(`/a1-portal-a16-tlb/Chat/${chatId}`);
	}
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<div class="flex items-center gap-2">
				<MessageCircle class="size-5" />
				<CardTitle>Daftar Chat</CardTitle>
			</div>
		</CardHeader>
		<CardContent>
			{#if loading}
				<div class="flex h-64 items-center justify-center">
					<p>Memuat daftar chat...</p>
				</div>
			{:else if error}
				<div class="flex h-64 items-center justify-center text-red-500">
					<p>{error}</p>
				</div>
			{:else if chats.length === 0}
				<div class="flex h-64 flex-col items-center justify-center text-gray-500">
					<MessageCircle class="mb-4 size-12" />
					<p>Belum ada pesan</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each chats as chat}
						<div 
							class="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-gray-50"
							on:click={() => handleChatSelect(chat.chatID)}
						>
							<Avatar class="size-10">
								<AvatarFallback class="bg-[#2e6057]/10 text-[#2e6057]">
									{chat.customer_name?.charAt(0) || 'C'}
								</AvatarFallback>
							</Avatar>
							<div class="flex-1">
								<div class="flex items-center justify-between">
									<h3 class="font-medium">{chat.customer_name}</h3>
									{#if chat.unread_count > 0}
										<Badge variant="destructive" class="size-6 rounded-full p-0">
											{chat.unread_count}
										</Badge>
									{/if}
								</div>
								<p class="line-clamp-1 text-sm text-gray-500">{chat.last_message}</p>
								<div class="mt-1 flex items-center gap-2 text-xs text-gray-400">
									<Clock class="size-3" />
									<span>{formatDate(chat.last_sent_at)}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>