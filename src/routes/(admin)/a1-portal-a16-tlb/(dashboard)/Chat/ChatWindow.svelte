<script lang="ts">
	import { sendMessage, type ChatSession, type MessageDetail } from '$lib/api/admin/chat';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Send, ArrowLeft, Loader2 } from 'lucide-svelte';
	import * as AvatarPrimitive from '$lib/components/ui/avatar';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { session, messages, token, adminId, onBack, onMessageSent } = $props<{
		session: ChatSession;
		messages: MessageDetail[];
		token: string;
		adminId: string;
		onBack: () => void;
		onMessageSent: (newMessage: MessageDetail) => void;
	}>();

	let newMessage = $state('');
	let sending = $state(false);
	let chatContainer: HTMLDivElement;

	const scrollToBottom = async () => {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	};

	onMount(() => {
		scrollToBottom();
	});

	// Scroll to bottom when messages change
	$effect(() => {
		if (messages) {
			scrollToBottom();
		}
	});

	const handleSend = async () => {
		if (!newMessage.trim() || sending) return;
		sending = true;

		const result = await sendMessage(fetch, session.chatID, newMessage, token);

		if (result.success) {
			const sentMsg: MessageDetail = {
				sender: adminId, // Use the actual admin ID
				content: newMessage, // Optimistic update
				created_at: new Date().toISOString()
			};

			onMessageSent(sentMsg);
			newMessage = '';
		} else {
			toast.error(result.message || 'Failed to send message');
		}
		sending = false;
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// Helper to format date for separator
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			// DD/MM/YYYY format
			day: 'numeric',
			month: 'numeric',
			year: 'numeric'
		});
	}

	// Helper to format time for message
	function formatTime(dateString: string) {
		return new Date(dateString).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Group messages by date
	// We need to do this reactively
	let groupedMessages = $derived.by(() => {
		const groups: { date: string; msgs: MessageDetail[] }[] = [];
		let currentDate = '';
		let currentGroup: MessageDetail[] = [];

		messages.forEach((msg) => {
			const msgDate = formatDate(msg.created_at);
			if (msgDate !== currentDate) {
				if (currentGroup.length > 0) {
					groups.push({ date: currentDate, msgs: currentGroup });
				}
				currentDate = msgDate;
				currentGroup = [msg];
			} else {
				currentGroup.push(msg);
			}
		});
		if (currentGroup.length > 0) {
			groups.push({ date: currentDate, msgs: currentGroup });
		}
		return groups;
	});
</script>

<div class="flex h-full w-full flex-col bg-slate-950/50">
	<!-- Header -->
	<div class="flex items-center gap-4 border-b border-white/10 bg-white/5 p-4 backdrop-blur-md">
		<Button
			variant="ghost"
			size="icon"
			onclick={onBack}
			class="md:hidden text-secondary hover:bg-white/10 hover:text-senary"
		>
			<ArrowLeft class="h-5 w-5" />
		</Button>

		<AvatarPrimitive.Root class="h-10 w-10 rounded-full border border-white/10">
			<AvatarPrimitive.Image
				src={session.customerPhoto}
				alt={session.customerName}
				class="aspect-square h-full w-full object-cover"
			/>
			<AvatarPrimitive.Fallback
				class="flex h-full w-full items-center justify-center bg-slate-800 text-secondary"
			>
				{(session.customerName || '?').charAt(0)}
			</AvatarPrimitive.Fallback>
		</AvatarPrimitive.Root>

		<div>
			<h2 class="text-lg font-bold text-secondary">{session.customerName || 'Unknown Customer'}</h2>
		</div>
	</div>

	<!-- Messages -->
	<div class="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar" bind:this={chatContainer}>
		{#each groupedMessages as group}
			<!-- Date Separator -->
			<div class="flex justify-center my-4">
				<span
					class="px-3 py-1 rounded-full bg-white/5 text-[10px] font-medium text-secondary/50 border border-white/5"
				>
					{group.date}
				</span>
			</div>

			{#each group.msgs as message}
				<!-- 
					Alignment Logic:
					If sender matches adminId, it's the Admin -> Right.
					Otherwise -> Left (Customer).
				-->
				{@const isAdmin = message.sender === adminId || message.sender === 'admin'}

				<div class={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
					<div
						class={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm break-words whitespace-pre-wrap ${
							isAdmin
								? 'bg-senary text-primary rounded-br-none'
								: 'bg-white/10 text-secondary rounded-bl-none border border-white/5'
						}`}
					>
						<p class="leading-relaxed">{message.content}</p>
						<p
							class={`mt-1 text-[10px] text-right ${
								isAdmin ? 'text-primary/60' : 'text-secondary/40'
							}`}
						>
							{formatTime(message.created_at)}
						</p>
					</div>
				</div>
			{/each}
		{/each}
	</div>

	<!-- Input -->
	<div class="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
		<div class="flex gap-3 items-end max-w-4xl mx-auto">
			<Input
				placeholder="Type a message..."
				bind:value={newMessage}
				onkeydown={handleKeydown}
				class="min-h-[50px] py-3 rounded-2xl border-white/10 bg-black/20 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary shadow-inner"
			/>
			<Button
				onclick={handleSend}
				disabled={sending || !newMessage.trim()}
				size="icon"
				class="h-[50px] w-[50px] rounded-2xl bg-senary text-primary hover:bg-senary/90 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)] transition-all hover:scale-105 active:scale-95"
			>
				{#if sending}
					<Loader2 class="h-5 w-5 animate-spin" />
				{:else}
					<Send class="h-5 w-5" />
				{/if}
			</Button>
		</div>
	</div>
</div>
