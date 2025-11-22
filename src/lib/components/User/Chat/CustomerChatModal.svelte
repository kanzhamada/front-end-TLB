<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Calendar, Clock, User, Scissors } from 'lucide-svelte';
	import type { ChatDetail, Message } from '$lib/api/shared/chat';
	import { getMessagesByReservation, sendMessage } from '$lib/api/shared/chat';
	import { updateUnreadCount } from '$lib/stores/chat';

	let { reservation, open, onClose } = $props<{
		reservation: any;
		open: boolean;
		onClose: () => void;
	}>();

	let messages: Message[] = $state([]);
	let newMessage: string = $state('');
	let loading = $state(true);
	let error = $state<string | null>(null);
	let realtimeSubscription: any = null;
	let chatID: string | null = $state(null);

	// Get user profile for display
	const userProfile = $derived(() => get(authStore).session?.user);

	onMount(async () => {
		if (open && reservation?.reservationID) {
			await loadMessages();
			setupRealtimeListener();
		}
	});

	onDestroy(() => {
		cleanupRealtimeListener();
	});

	// Update when open changes
	$effect(() => {
		if (open && reservation?.reservationID) {
			loadMessages();
			setupRealtimeListener();
		} else {
			cleanupRealtimeListener();
		}
	});

	async function loadMessages() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			// Get chat details by reservation ID
			const response = await getMessagesByReservation(reservation.reservationID, token);
			if (!response.success || !response.data) {
				throw new Error(response.message || 'Failed to load messages');
			}

			// Set messages from the response
			messages = response.data.messagesDetail || [];

			// Store chatID for sending messages
			if (response.data.chatID) {
				chatID = response.data.chatID;

				// Mark messages as read (we'll use Supabase RPC directly)
				await markMessagesAsRead(response.data.chatID);
			}
		} catch (err) {
			console.error('Error loading messages:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading messages';
		} finally {
			loading = false;
		}
	}

	async function markMessagesAsRead(chatId: string) {
		try {
			// Use Supabase RPC to mark messages as read
			const { data, error } = await supabase.rpc('shared_chat_mark_as_read', {
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
		cleanupRealtimeListener(); // Clean up any existing subscription

		if (!reservation?.reservationID) return;

		// Subscribe to messages table for this reservation's chat
		realtimeSubscription = supabase
			.channel('messages-changes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages'
				},
				(payload) => {
					// Add new message to the list
					messages = [...messages, payload.new as Message];
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'messages'
				},
				(payload) => {
					// Update the read status of messages
					const updatedMessageIndex = messages.findIndex(
						(msg) =>
							msg.content === (payload.old as Message).content &&
							msg.sender === (payload.old as Message).sender &&
							msg.created_at === (payload.old as Message).created_at
					);

					if (updatedMessageIndex !== -1) {
						messages[updatedMessageIndex] = payload.new as Message;
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
		console.log('handleSend called', { newMessage, chatID }); // Debug log
		if (!newMessage.trim() || !chatID) {
			console.log('handleSend conditions not met', {
				hasNewMessage: !!newMessage.trim(),
				hasChatID: !!chatID
			});
			return;
		}

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			console.log('Sending message:', { chatID, content: newMessage, token: !!token });

			// Send message
			const response = await sendMessage(chatID, { content: newMessage }, token);
			console.log('Send message response:', response);

			if (!response.success) {
				throw new Error(response.message || 'Failed to send message');
			}

			// Clear input
			newMessage = '';
			console.log('Message sent successfully, input cleared');
		} catch (err) {
			console.error('Error sending message:', err);
			error = err instanceof Error ? err.message : 'An error occurred while sending message';
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// Determine if message is from current user
	function isCurrentUserMessage(senderId: string) {
		return senderId === get(authStore).session?.user?.id;
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="fixed inset-0 bg-black/50" onclick={onClose}></div>
		<div class="relative z-10 mx-4 h-[90vh] w-full max-w-4xl rounded-xl bg-white shadow-xl">
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-lg font-semibold">Chat untuk Reservasi</h2>
				<Button variant="ghost" class="size-8 p-0" onclick={onClose}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</Button>
			</div>

			<!-- Main Content -->
			<div class="flex h-[calc(100%-4rem)]">
				<!-- Reservation Details Sidebar -->
				<div class="hidden w-1/3 border-r md:block">
					<Card class="m-4">
						<CardHeader>
							<CardTitle class="flex items-center gap-2">
								<Scissors class="size-5" />
								<span>Detail Reservasi</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-3">
								<div class="flex items-center gap-2">
									<User class="size-4 text-gray-500" />
									<span class="font-medium">ID Invoice:</span>
									<span>{reservation.invoice || reservation.reservationID}</span>
								</div>
								<div class="flex items-center gap-2">
									<Calendar class="size-4 text-gray-500" />
									<span class="font-medium">Tanggal:</span>
									<span>{reservation.dateTime?.date}</span>
								</div>
								<div class="flex items-center gap-2">
									<Clock class="size-4 text-gray-500" />
									<span class="font-medium">Waktu:</span>
									<span>{reservation.dateTime?.hour}</span>
								</div>
								<div class="flex items-center gap-2">
									<User class="size-4 text-gray-500" />
									<span class="font-medium">Barber:</span>
									<span>{reservation.barber?.name}</span>
								</div>
								<div class="flex items-center gap-2">
									<Scissors class="size-4 text-gray-500" />
									<span class="font-medium">Layanan:</span>
									<span>{reservation.service?.name}</span>
								</div>
								<div class="mt-4">
									<span class="font-medium">Status:</span>
									<Badge class="ml-2">
										{reservation.status}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Chat Area -->
				<div class="flex h-full w-full flex-col">
					<!-- Chat Messages -->
					<div class="flex-1 overflow-hidden p-4">
						{#if loading}
							<div class="flex h-full items-center justify-center">
								<p>Loading messages...</p>
							</div>
						{:else if error}
							<div class="flex h-full items-center justify-center text-red-500">
								<p>{error}</p>
							</div>
						{:else if messages.length === 0}
							<div class="flex h-full items-center justify-center">
								<p class="text-gray-500">Belum ada pesan. Kirim pesan pertama!</p>
							</div>
						{:else}
							<ScrollArea class="h-full pr-4">
								<div class="space-y-4">
									{#each messages as message (message.created_at + message.sender)}
										<div
											class="flex {isCurrentUserMessage(message.sender)
												? 'justify-end'
												: 'justify-start'}"
										>
											<div class="flex max-w-xs flex-col">
												<div class="flex items-center gap-2">
													{#if !isCurrentUserMessage(message.sender)}
														<Avatar class="size-6">
															<AvatarFallback class="bg-[#2e6057]/10 text-xs text-[#2e6057]">
																A
															</AvatarFallback>
														</Avatar>
													{/if}
													<div
														class="rounded-lg px-3 py-2 {isCurrentUserMessage(message.sender)
															? 'rounded-br-none bg-[#2e6057] text-white'
															: 'rounded-bl-none bg-gray-100 text-gray-800'}"
													>
														<p>{message.content}</p>
													</div>
												</div>
												<div class="mt-1 flex justify-end text-xs text-gray-500">
													{formatDate(message.created_at)}
													{#if !message.read && !isCurrentUserMessage(message.sender)}
														<span class="ml-1">• belum dibaca</span>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</ScrollArea>
						{/if}
					</div>

					<!-- Message Input -->
					<div class="border-t p-4">
						<div class="flex gap-2">
							<Input
								placeholder="Ketik pesan..."
								value={newMessage}
								oninput={(e) => (newMessage = (e.target as HTMLInputElement).value)}
								onkeypress={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSend();
									}
								}}
							/>
							<Button onclick={handleSend} disabled={!newMessage.trim() || loading}>Kirim</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
