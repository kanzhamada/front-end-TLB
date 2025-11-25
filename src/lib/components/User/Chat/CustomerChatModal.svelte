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
	import { Calendar, Clock, User, Scissors, X, Send } from 'lucide-svelte';
	import type { ChatDetail, Message } from '$lib/api/shared/chat';
	import { getMessagesByReservation, sendMessage } from '$lib/api/shared/chat';
	import { updateUnreadCount } from '$lib/stores/chat';
	import { cn } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';

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
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		in:fade={{ duration: 200 }}
	>
		<div class="absolute inset-0 rounded-2xl bg-black/80 backdrop-blur-sm" onclick={onClose}></div>
		<div
			class="relative z-10 h-[55vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-senary/20 bg-background/95 shadow-2xl backdrop-blur-xl"
			in:scale={{ duration: 300, start: 0.95 }}
		>
			<!-- Modal Header -->
			<div
				class="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 backdrop-blur-md"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-full bg-senary/10 text-senary"
					>
						<Scissors class="size-5" />
					</div>
					<div>
						<h2 class="text-lg font-semibold text-secondary">Chat Reservasi</h2>
						<p class="text-xs text-secondary/60">
							{reservation.invoice || reservation.reservationID}
						</p>
					</div>
				</div>
				<Button
					variant="ghost"
					class="size-8 rounded-full p-0 text-secondary/60 hover:bg-white/10 hover:text-white"
					onclick={onClose}
				>
					<X class="size-5" onclick={onClose} />
				</Button>
			</div>

			<!-- Main Content -->
			<div class="flex h-[calc(100%-4.5rem)] flex-col md:flex-row">
				<!-- Reservation Details Sidebar -->
				<div class="hidden w-80 border-r border-white/10 bg-white/5 md:block">
					<div class="p-4">
						<h3 class="mb-4 text-sm font-semibold tracking-wider text-senary uppercase">
							Detail Reservasi
						</h3>
						<div class="space-y-4">
							<div
								class="group rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-senary/20 hover:bg-white/10"
							>
								<div class="mb-1 flex items-center gap-2 text-xs text-secondary/60">
									<Calendar class="size-3" />
									<span>Tanggal</span>
								</div>
								<div class="font-medium text-secondary">{reservation.dateTime?.date}</div>
							</div>

							<div
								class="group rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-senary/20 hover:bg-white/10"
							>
								<div class="mb-1 flex items-center gap-2 text-xs text-secondary/60">
									<Clock class="size-3" />
									<span>Waktu</span>
								</div>
								<div class="font-medium text-secondary">{reservation.dateTime?.hour}</div>
							</div>

							<div
								class="group rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-senary/20 hover:bg-white/10"
							>
								<div class="mb-1 flex items-center gap-2 text-xs text-secondary/60">
									<User class="size-3" />
									<span>Barber</span>
								</div>
								<div class="font-medium text-secondary">{reservation.barber?.name}</div>
							</div>

							<div
								class="group rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-senary/20 hover:bg-white/10"
							>
								<div class="mb-1 flex items-center gap-2 text-xs text-secondary/60">
									<Scissors class="size-3" />
									<span>Layanan</span>
								</div>
								<div class="font-medium text-secondary">{reservation.service?.name}</div>
							</div>

							<div class="mt-4">
								<Badge
									variant="outline"
									class="w-full justify-center border-senary/30 bg-senary/10 py-1.5 text-senary"
								>
									{reservation.status}
								</Badge>
							</div>
						</div>
					</div>
				</div>

				<!-- Chat Area -->
				<div class="flex h-full flex-1 flex-col bg-black/20">
					<!-- Chat Messages -->
					<div class="flex-1 overflow-hidden p-4">
						{#if loading}
							<div class="flex h-full items-center justify-center text-senary">
								<p class="animate-pulse">Memuat pesan...</p>
							</div>
						{:else if error}
							<div class="flex h-full items-center justify-center text-destructive">
								<p>{error}</p>
							</div>
						{:else if messages.length === 0}
							<div class="flex h-full flex-col items-center justify-center gap-3 text-secondary/40">
								<div class="flex size-16 items-center justify-center rounded-full bg-white/5">
									<Send class="size-8" />
								</div>
								<p>Belum ada pesan. Mulai percakapan!</p>
							</div>
						{:else}
							<ScrollArea class="h-full pr-4">
								<div class="space-y-6">
									{#each messages as message (message.created_at + message.sender)}
										<div
											class="flex {isCurrentUserMessage(message.sender)
												? 'justify-end'
												: 'justify-start'}"
										>
											<div class="flex max-w-[80%] flex-col gap-1 md:max-w-[70%]">
												<div
													class="flex items-end gap-2 {isCurrentUserMessage(message.sender)
														? 'flex-row-reverse'
														: 'flex-row'}"
												>
													{#if !isCurrentUserMessage(message.sender)}
														<Avatar class="size-8 border border-white/10">
															<AvatarFallback class="bg-senary/10 text-xs font-bold text-senary">
																A
															</AvatarFallback>
														</Avatar>
													{/if}

													<div
														class={cn(
															'rounded-2xl px-4 py-3 shadow-sm',
															isCurrentUserMessage(message.sender)
																? 'rounded-br-sm bg-senary text-primary'
																: 'rounded-bl-sm bg-white/10 text-secondary backdrop-blur-sm'
														)}
													>
														<p class="text-sm leading-relaxed">{message.content}</p>
													</div>
												</div>

												<div
													class={cn(
														'flex text-[10px] text-secondary/40',
														isCurrentUserMessage(message.sender)
															? 'justify-end pr-1'
															: 'justify-start pl-11'
													)}
												>
													<span>{formatDate(message.created_at)}</span>
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
					<div class="border-t border-white/10 bg-white/5 p-4 backdrop-blur-md">
						<div class="flex gap-3">
							<Input
								placeholder="Ketik pesan..."
								value={newMessage}
								class="border-white/10 bg-white/5 text-secondary placeholder:text-white/20 focus:border-senary/50 focus:ring-senary/50"
								oninput={(e) => (newMessage = (e.target as HTMLInputElement).value)}
								onkeypress={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSend();
									}
								}}
							/>
							<Button
								onclick={handleSend}
								disabled={!newMessage.trim() || loading}
								class="bg-senary text-primary hover:bg-senary/90"
							>
								<Send class="size-4" />
								<span class="ml-2 hidden sm:inline">Kirim</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
