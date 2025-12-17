import { getFromApi, postToApi, type ApiResponse } from '$lib/api/shared/api';

export type ChatSession = {
	chatID: string;
	reservationID: string;
	customerName: string;
	customerPhoto: string;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
	customerId?: string; // Added for message alignment
};

export type MessageDetail = {
	sender: string;
	content: string;
	created_at: string;
};

export type ChatDetail = {
	chatID: string;
	reservationID: string;
	messagesDetail: MessageDetail[];
};

export const getChatInbox = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<ChatSession[]>> => {
	const res = await getFromApi<any[]>(fetch, '/admin/chat-inbox', token);
	if (res.success && res.data) {
		// Map snake_case to camelCase
		const mappedData = res.data.map((item: any) => ({
			chatID: item.chatID || item.chat_id || item.id,
			reservationID: item.reservationID || item.reservation_id,
			customerName: item.customerName || item.customer_name || 'Unknown',
			customerPhoto: item.customerPhoto || item.customer_photo || '',
			lastMessage: item.lastMessage || item.last_message || '',
			lastMessageTime: item.lastMessageTime || item.last_message_time || item.created_at || '',
			unreadCount: item.unreadCount || item.unread_count || 0,
			customerId: item.customerId || item.customer_id || item.user_id // Try to capture customer ID
		}));
		return { ...res, data: mappedData };
	}
	return { ...res, data: [] };
};

export const getChatMessages = async (
	fetch: typeof window.fetch,
	reservationId: string,
	token: string
): Promise<ApiResponse<ChatDetail>> => {
	return getFromApi<ChatDetail>(
		fetch,
		`/shared/view-chat/${reservationId}`,
		token
	);
};

export const sendMessage = async (
	fetch: typeof window.fetch,
	chatId: string,
	content: string,
	token: string
): Promise<ApiResponse<any>> => {
	return postToApi(fetch, `/shared/create-message/${chatId}`, { content }, token);
};
