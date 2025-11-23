<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase/client';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Calendar, Clock, User, Scissors, MessageCircle, ArrowLeft } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { sendMessage } from '$lib/api/shared/chat';
	import type { Message } from '$lib/api/shared/chat';
	import ChatMessageList from '$lib/components/ui/chat/chat-message-list.svelte';
	import ChatBubble from '$lib/components/ui/chat/chat-bubble.svelte';
	import ChatInput from '$lib/components/ui/chat/chat-input.svelte';

	let { params } = $props();
	let messages: Message[] = $state([]);
	let newMessage: string = $state('');
	let loading = $state(true);
	let error = $state<string | null>(null);
	let realtimeSubscription: any = null;
	let scrollContainer: HTMLDivElement;

	onMount(async () => {
		if (params.id) {
			await loadChatDetails();
			setupRealtimeListener();
		}
	});

	onDestroy(() => {
		cleanupRealtimeListener();
	});

	async function loadChatDetails() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			if (params.id) {
				const { data, error: err } = await supabase
					.from('messages')
					.select('*')
					.eq('chatID', params.id)
					.order('created_at', { ascending: true });

				if (err) {
					throw new Error(err.message);
				}

				messages = data.map((msg: any) => ({
					content: msg.content,
					sender: msg.sender,
					created_at: msg.created_at,
					read: msg.read
				}));

				await markMessagesAsRead(params.id);
				scrollToBottom();
			}
		} catch (err) {
			console.error('Error loading chat details:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading chat';
		} finally {
			loading = false;
		}
	}

	async function markMessagesAsRead(chatId: string) {
		try {
			const { error } = await supabase.rpc('shared_chat_mark_as_read', {
				chat_id: chatId,
				viewer_user_id: get(authStore).session?.user?.id
			});

			if (error) {
				console.error('Error marking messages as read:', error);
			}
		} catch (err) {
			console.error('Error calling mark as read RPC:', err);
		}
	}

	function setupRealtimeListener() {
		cleanupRealtimeListener();

		realtimeSubscription = supabase
			.channel('admin-chat-changes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `chatID=eq.${params.id}`
				},
				async (payload) => {
					const newMsg = payload.new as Message;
					messages = [...messages, newMsg];
					
					// If message is from customer, mark as read immediately since we are viewing the chat
					if (!isAdminMessage(newMsg.sender)) {
						await markMessagesAsRead(params.id);
					}
					
					scrollToBottom();
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'messages',
					filter: `chatID=eq.${params.id}`
				},
				(payload) => {
					const updatedMsg = payload.new as Message;
					const index = messages.findIndex(
						(msg) => msg.created_at === updatedMsg.created_at && msg.sender === updatedMsg.sender
					);

					if (index !== -1) {
						messages[index] = updatedMsg;
					}
				}
			)
			.subscribe();
	}

	function cleanupRealtimeListener() {
		if (realtimeSubscription) {
			realtimeSubscription.unsubscribe();
			realtimeSubscription = null;
		}
	}

	async function handleSend() {
		if (!newMessage.trim() || !params.id) return;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await sendMessage(params.id, { content: newMessage }, token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to send message');
			}

			newMessage = '';
			scrollToBottom();
		} catch (err) {
			console.error('Error sending message:', err);
			error = err instanceof Error ? err.message : 'An error occurred while sending message';
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function isAdminMessage(senderId: string) {
		return senderId === get(authStore).session?.user?.id;
	}

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}
</script>

<div class="space-y-6">
	<Card class="h-[calc(100vh-8rem)]">
		<CardHeader class="border-b px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-full bg-[#2e6057]/10">
						<MessageCircle class="size-5 text-[#2e6057]" />
					</div>
					<div>
						<CardTitle class="text-lg">Detail Chat</CardTitle>
						<p class="text-sm text-muted-foreground">
							ID: {params.id?.substring(0, 8)}...
						</p>
					</div>
				</div>
				<Button variant="outline" size="sm" onclick={() => goto('/a1-portal-a16-tlb/Chat')}>
					<ArrowLeft class="mr-2 size-4" />
					Kembali
				</Button>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="flex h-full">
				<!-- Reservation Details Sidebar -->
				<div class="hidden w-80 border-r bg-gray-50/50 p-6 md:block">
					<div class="space-y-6">
						<div>
							<h3 class="mb-4 font-semibold text-[#2e6057]">Detail Reservasi</h3>
							<div class="space-y-4">
								<div class="flex items-start gap-3 text-sm">
									<Calendar class="mt-0.5 size-4 text-gray-500" />
									<div>
										<p class="font-medium">Tanggal</p>
										<p class="text-gray-600">20 Nov 2025</p>
									</div>
								</div>
								<div class="flex items-start gap-3 text-sm">
									<Clock class="mt-0.5 size-4 text-gray-500" />
									<div>
										<p class="font-medium">Waktu</p>
										<p class="text-gray-600">10:00</p>
									</div>
								</div>
								<div class="flex items-start gap-3 text-sm">
									<User class="mt-0.5 size-4 text-gray-500" />
									<div>
										<p class="font-medium">Barber</p>
										<p class="text-gray-600">John Doe</p>
									</div>
								</div>
								<div class="flex items-start gap-3 text-sm">
									<Scissors class="mt-0.5 size-4 text-gray-500" />
									<div>
										<p class="font-medium">Layanan</p>
										<p class="text-gray-600">Haircut</p>
									</div>
								</div>
							</div>
						</div>
						
						<div class="rounded-lg border bg-white p-4">
							<span class="text-xs font-medium text-gray-500">Status</span>
							<div class="mt-1 flex items-center gap-2">
								<Badge variant="secondary" class="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
									Menunggu
								</Badge>
							</div>
						</div>
					</div>
				</div>

				<!-- Chat Area -->
				<div class="flex flex-1 flex-col">
					<!-- Messages -->
					<div 
						class="flex-1 overflow-y-auto bg-white"
						bind:this={scrollContainer}
					>
						{#if loading}
							<div class="flex h-full items-center justify-center">
								<div class="flex flex-col items-center gap-2 text-gray-500">
									<div class="size-6 animate-spin rounded-full border-2 border-[#2e6057] border-t-transparent"></div>
									<p class="text-sm">Memuat pesan...</p>
								</div>
							</div>
						{:else if error}
							<div class="flex h-full items-center justify-center text-red-500">
								<p>{error}</p>
							</div>
						{:else if messages.length === 0}
							<div class="flex h-full flex-col items-center justify-center text-gray-500">
								<MessageCircle class="mb-4 size-12 opacity-20" />
								<p>Belum ada pesan dalam chat ini.</p>
							</div>
						{:else}
							<ChatMessageList>
								{#each messages as message (message.created_at + message.sender)}
									<div class="flex w-full {isAdminMessage(message.sender) ? 'justify-end' : 'justify-start'}">
										<div class="flex max-w-[80%] items-end gap-2 {isAdminMessage(message.sender) ? 'flex-row-reverse' : 'flex-row'}">
											{#if !isAdminMessage(message.sender)}
												<Avatar class="size-8 shrink-0">
													<AvatarFallback class="bg-[#2e6057]/10 text-xs text-[#2e6057]">
														C
													</AvatarFallback>
												</Avatar>
											{/if}
											
											<div class="flex flex-col {isAdminMessage(message.sender) ? 'items-end' : 'items-start'}">
												<ChatBubble variant={isAdminMessage(message.sender) ? 'sent' : 'received'}>
													{message.content}
												</ChatBubble>
												<span class="mt-1 text-[10px] text-gray-400">
													{formatDate(message.created_at)}
													{#if isAdminMessage(message.sender) && message.read}
														<span class="ml-1 text-[#2e6057]">✓✓</span>
													{/if}
												</span>
											</div>
										</div>
									</div>
								{/each}
							</ChatMessageList>
						{/if}
					</div>

					<!-- Input -->
					<ChatInput
						bind:value={newMessage}
						onSend={handleSend}
						disabled={loading}
						placeholder="Ketik pesan balasan..."
						class="border-t bg-gray-50/50"
					/>
				</div>
			</div>
		</CardContent>
	</Card>
</div>