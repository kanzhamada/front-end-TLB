<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription,
		SheetFooter
	} from '$lib/components/ui/sheet';
	import { Calendar, Clock, User, Scissors, Send, BadgeInfo } from 'lucide-svelte';
	import type { Message } from '$lib/api/shared/chat';
	import { getMessagesByReservation, sendMessage } from '$lib/api/shared/chat';
	import { cn } from '$lib/utils';

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
	let messagesContainer: HTMLDivElement | null = null;
	let scrollBottomRef: HTMLDivElement | null = null;
	let unreadCount = $state(0);

	// Get user profile for display
	const userProfile = $derived(() => get(authStore).session?.user);
	const currentUserId = $derived(get(authStore).session?.user?.id);

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

	// Auto-scroll when messages change
	$effect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	});

	async function scrollToBottom(smooth = true) {
		await tick(); // Wait for DOM to update

		// Small delay to ensure layout is stable, especially inside Sheet
		setTimeout(() => {
			if (scrollBottomRef) {
				scrollBottomRef.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
			} else if (messagesContainer) {
				messagesContainer.scrollTo({
					top: messagesContainer.scrollHeight,
					behavior: smooth ? 'smooth' : 'auto'
				});
			}
		}, 100);
	}

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

				// Get initial unread count
				await fetchUnreadCount(response.data.chatID);

				// Mark messages as read (we'll use Supabase RPC directly)
				await markMessagesAsRead(response.data.chatID);
			}

			// Scroll to bottom after loading messages
			await scrollToBottom(false);
		} catch (err) {
			console.error('Error loading messages:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading messages';
		} finally {
			loading = false;
		}
	}

	async function fetchUnreadCount(chatId: string) {
		try {
			const { count, error } = await supabase
				.from('messages')
				.select('*', { count: 'exact', head: true })
				.eq('chatID', chatId)
				.eq('read', false)
				.neq('sender', currentUserId);

			if (error) throw error;
			unreadCount = count || 0;
		} catch (err) {
			console.error('Error fetching unread count:', err);
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
			} else {
				// Reset unread count after marking as read
				unreadCount = 0;
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
				async (payload) => {
					const newMessage = payload.new as Message;

					// Only add if it belongs to this chat (if we have chatID)
					if (chatID && newMessage.chatID === chatID) {
						// Add new message to the list
						messages = [...messages, newMessage];

						// If message is not from us, increment unread count
						if (newMessage.sender !== currentUserId) {
							unreadCount++;
							// If chat is open, mark as read immediately
							if (open) {
								await markMessagesAsRead(chatID);
							}
						}
					} else if (!chatID) {
						// If we don't have chatID yet (first message), reload
						await loadMessages();
					}
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
					const updatedMessage = payload.new as Message;

					const updatedMessageIndex = messages.findIndex(
						(msg) => msg.messageID === updatedMessage.messageID
					);

					if (updatedMessageIndex !== -1) {
						messages[updatedMessageIndex] = updatedMessage;
					}

					// Update unread count if needed (e.g. if message was marked read elsewhere)
					if (chatID && updatedMessage.chatID === chatID) {
						fetchUnreadCount(chatID);
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

			// Scroll to bottom after sending
			await scrollToBottom();
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

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			onClose();
		}
	}
<<<<<<< HEAD

	function isSameDay(date1: string, date2: string) {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	}

	function formatDateSeparator(dateString: string) {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (isSameDay(dateString, today.toISOString())) {
			return 'Hari Ini';
		} else if (isSameDay(dateString, yesterday.toISOString())) {
			return 'Kemarin';
		} else {
			return date.toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
		}
	}
=======
>>>>>>> ef57d19 (fix admin catalogue and reservation page)
</script>

<Sheet {open} onOpenChange={handleOpenChange}>
	<SheetContent side="right" class="flex w-full flex-col p-0 sm:max-w-xl">
		<SheetHeader class="border-b border-white/10 bg-white/5 p-4 backdrop-blur-md">
			<div class="flex items-center gap-3">
				<div class="flex size-10 items-center justify-center rounded-full bg-senary/10 text-senary">
					<Scissors class="size-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<SheetTitle class="text-lg font-semibold text-secondary">Chat Reservasi</SheetTitle>
						{#if unreadCount > 0}
							<Badge variant="destructive" class="h-5 min-w-5 rounded-full px-1.5 text-[10px]">
								{unreadCount}
							</Badge>
						{/if}
					</div>
					<SheetDescription class="text-xs text-secondary/60">
						{reservation.invoice || reservation.reservationID}
					</SheetDescription>
				</div>
			</div>
		</SheetHeader>

		<div class="flex flex-1 overflow-hidden">
			<!-- Reservation Details (Collapsible on mobile maybe? For now keeping it simple or hidden on small screens if needed, but user asked for responsiveness) -->
			<!-- Given the Sheet is usually narrower, we might want to put details in a popover or just show essential info. 
                 The original design had a sidebar. In a Sheet, a sidebar might be too cramped. 
                 Let's put the details in a collapsible section or just above the chat if needed, 
                 but for now let's focus on the chat experience as requested. 
                 If we want to keep the details, we can put them in a top section or a separate tab.
                 However, to keep it clean in a Sheet, let's just show the chat and maybe a button to see details.
                 Wait, the user didn't explicitly ask to remove details, but "change the chat modal into Sheet component".
                 Sheets are typically for side content. 
                 Let's try to keep the details but maybe more compact or as a top bar expansion.
                 Actually, let's just put the chat as the main content and maybe hide details or put them in a "Details" tab if it was a full page.
                 For a Sheet, let's stick to the chat view primarily. 
                 I will add a small details summary at the top or just keep the chat.
                 Let's keep it simple: Chat takes full height.
            -->

			<!-- Chat Area -->
			<div class="flex h-full w-full flex-col bg-black/20">
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
						<div bind:this={messagesContainer} class="h-full overflow-y-auto pr-2">
							<div class="space-y-6 pb-4">
<<<<<<< HEAD
								{#each messages as message, i (message.created_at + message.sender)}
									{#if i === 0 || !isSameDay(message.created_at, messages[i - 1].created_at)}
										<div class="my-4 flex justify-center">
											<span class="rounded-full bg-white/5 px-3 py-1 text-[10px] text-secondary/50">
												{formatDateSeparator(message.created_at)}
											</span>
										</div>
									{/if}
=======
								{#each messages as message (message.created_at + message.sender)}
>>>>>>> ef57d19 (fix admin catalogue and reservation page)
									<div
										class="flex {isCurrentUserMessage(message.sender)
											? 'justify-end'
											: 'justify-start'}"
									>
										<div class="flex max-w-[85%] flex-col gap-1">
											<div
												class="flex items-end gap-2 {isCurrentUserMessage(message.sender)
													? 'flex-row-reverse'
													: 'flex-row'}"
											>
												{#if !isCurrentUserMessage(message.sender)}
													<Avatar class="size-8 flex-shrink-0 border border-white/10">
														<AvatarFallback class="bg-senary/10 text-xs font-bold text-senary">
															A
														</AvatarFallback>
													</Avatar>
												{/if}

												<div
													class={cn(
														'rounded-2xl px-4 py-3 break-words shadow-sm',
														isCurrentUserMessage(message.sender)
															? 'rounded-br-sm bg-senary text-primary'
															: 'rounded-bl-sm bg-white/10 text-secondary backdrop-blur-sm'
													)}
												>
													<p class="text-sm leading-relaxed break-all whitespace-pre-wrap">
														{message.content}
													</p>
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
								<div bind:this={scrollBottomRef}></div>
							</div>
						</div>
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
	</SheetContent>
</Sheet>
