<script lang="ts">
	import { getChatInbox, getChatMessages, type ChatSession, type MessageDetail } from '$lib/api/admin/chat';
	import ChatSidebar from './ChatSidebar.svelte';
	import ChatWindow from './ChatWindow.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let sessions = $state<ChatSession[]>([]);
	let selectedSession = $state<ChatSession | null>(null);
	let messages = $state<MessageDetail[]>([]);
	let loadingMessages = $state(false);
	
	// Responsive state
	let showSidebar = $state(true);

	onMount(async () => {
		await loadInbox();
	});

	async function loadInbox() {
		const token = data.session?.access_token || '';
		const res = await getChatInbox(fetch, token);
		console.log('Inbox Response:', res);
		if (res.success && res.data) {
			sessions = res.data;
		} else {
			toast.error(res.message || 'Failed to load chat inbox');
		}
	}

	async function selectChat(session: ChatSession) {
		selectedSession = session;
		showSidebar = false; // On mobile, hide sidebar
		loadingMessages = true;
		
		const token = data.session?.access_token || '';
		// Use reservationID as per API docs for fetching messages
		const res = await getChatMessages(fetch, session.reservationID, token);
		console.log('Messages Response:', res);
		
		if (res.success && res.data) {
			messages = res.data.messagesDetail;
			// Mark as read locally (API should handle backend)
			const s = sessions.find(s => s.chatID === session.chatID);
			if (s) {
				s.unreadCount = 0;
				if (res.data.customerPhone) {
					s.customerPhone = res.data.customerPhone;
					// Force update reactivity if needed, usually direct mutation on $state proxy works, 
					// but let's trigger it by reassignment if not showing up
					selectedSession = { ...s }; 
				}
			}
		} else {
			toast.error(res.message || 'Failed to load messages');
		}
		loadingMessages = false;
	}

	function handleBack() {
		selectedSession = null;
		showSidebar = true;
	}

	function handleMessageSent(newMessage: MessageDetail) {
		messages = [...messages, newMessage];
		// Update last message in sidebar
		if (selectedSession) {
			const s = sessions.find(s => s.chatID === selectedSession!.chatID);
			if (s) {
				s.lastMessage = newMessage.content;
				s.lastMessageTime = newMessage.created_at;
				// Move to top
				sessions = [s, ...sessions.filter(x => x.chatID !== s.chatID)];
			}
		}
	}
</script>

<div class="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
	<!-- Sidebar (Always visible on desktop, visible on mobile if no chat selected) -->
	<div class={`${showSidebar ? 'flex' : 'hidden'} w-full md:flex md:w-80 lg:w-96 flex-col border-r border-white/10`}>
		<ChatSidebar 
			{sessions} 
			selectedChatId={selectedSession?.chatID ?? null} 
			onSelect={selectChat} 
		/>
	</div>

	<!-- Chat Window (Visible on desktop, visible on mobile if chat selected) -->
	<div class={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-black/40`}>
		{#if selectedSession}
			{#if loadingMessages}
				<div class="flex h-full items-center justify-center text-secondary/50">
					<div class="flex flex-col items-center gap-2">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-senary border-t-transparent"></div>
						<p class="text-xs tracking-widest uppercase">Loading Chat...</p>
					</div>
				</div>
			{:else}
				<ChatWindow 
					session={selectedSession} 
					{messages} 
					token={data.session?.access_token || ''}
					adminId={data.session?.user?.id || ''}
					onBack={handleBack}
					onMessageSent={handleMessageSent}
				/>
			{/if}
		{:else}
			<div class="hidden md:flex h-full flex-col items-center justify-center text-center p-8">
				<div class="mb-6 rounded-full bg-white/5 p-8 ring-1 ring-white/10">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<h3 class="text-xl font-bold text-secondary">Select a Conversation</h3>
				<p class="mt-2 text-sm text-secondary/50 max-w-xs">
					Choose a chat from the sidebar to start messaging with your customers.
				</p>
			</div>
		{/if}
	</div>
</div>