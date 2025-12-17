<script lang="ts">
	import { page } from '$app/stores';
	import { getChatMessages, sendMessage, type Message } from '$lib/api/admin/chat';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Send, ArrowLeft } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';

	const chatId = $page.params.id ?? '';
	let response = getChatMessages(chatId);
	let messages = $state<Message[]>(response.data);
	let newMessage = $state('');
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

	const handleSend = async () => {
		if (!newMessage.trim()) return;

		const result = sendMessage(chatId, newMessage);
		if (result.success) {
			messages = [...messages, result.data];
			newMessage = '';
			scrollToBottom();
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};
</script>

<div class="flex h-screen w-full flex-col bg-slate-950">
	<div class="flex items-center gap-4 border-b border-white/10 bg-slate-950 p-4">
		<Button
			variant="ghost"
			size="icon"
			href="/a1-portal-a16-tlb/Chat"
			class="text-secondary hover:bg-white/10 hover:text-senary"
		>
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h2 class="text-lg font-medium text-secondary">Customer Name</h2>
			<p class="text-xs text-secondary/60">Online</p>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto p-4" bind:this={chatContainer}>
		<div class="mx-auto flex max-w-3xl flex-col gap-4">
			{#each messages as message}
				<div class={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
					<div
						class={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
							message.isMe
								? 'bg-senary text-primary rounded-br-none'
								: 'bg-white/10 text-secondary rounded-bl-none'
						}`}
					>
						<p>{message.text}</p>
						<p
							class={`mt-1 text-[10px] ${message.isMe ? 'text-primary/70' : 'text-secondary/50'}`}
						>
							{new Date(message.timestamp).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="border-t border-white/10 bg-slate-950 p-4">
		<div class="mx-auto flex max-w-3xl gap-2">
			<Input
				placeholder="Type a message..."
				bind:value={newMessage}
				onkeydown={handleKeydown}
				class="border-white/10 bg-white/5 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary"
			/>
			<Button
				onclick={handleSend}
				size="icon"
				class="bg-senary text-primary hover:bg-senary/90"
			>
				<Send class="h-4 w-4" />
			</Button>
		</div>
	</div>
</div>