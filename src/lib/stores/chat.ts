import { writable, type Writable } from 'svelte/store';
import type { ChatInboxItem } from '$lib/api/shared/chat';

// Store for chat-related data
export const unreadChatCount: Writable<number> = writable(0);
export const chatInbox: Writable<ChatInboxItem[]> = writable([]);

// Function to update unread count
export function updateUnreadCount(count: number) {
	unreadChatCount.set(count);
}

// Function to update chat inbox
export function updateChatInbox(inbox: ChatInboxItem[]) {
	chatInbox.set(inbox);
}

// Function to increment unread count
export function incrementUnreadCount() {
	unreadChatCount.update(n => n + 1);
}

// Function to decrement unread count
export function decrementUnreadCount() {
	unreadChatCount.update(n => Math.max(0, n - 1));
}