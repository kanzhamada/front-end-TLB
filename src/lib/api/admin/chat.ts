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
<<<<<<< HEAD
	customerPhone?: string; // Added for display
=======
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
};

export type MessageDetail = {
	sender: string;
	content: string;
	created_at: string;
};

export type ChatDetail = {
	chatID: string;
	reservationID: string;
<<<<<<< HEAD
	customerPhone?: string;
=======
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
			customerId: item.customerId || item.customer_id || item.user_id, // Try to capture customer ID
			customerPhone: item.customerPhone || item.customer_phone || item.phone || item.phoneNumber || item.user?.phone || '' // Map phone number aggressively
=======
			customerId: item.customerId || item.customer_id || item.user_id // Try to capture customer ID
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
	const res = await getFromApi<any>(
=======
	return getFromApi<ChatDetail>(
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
		fetch,
		`/shared/view-chat/${reservationId}`,
		token
	);
<<<<<<< HEAD
	
	if (res.success && res.data) {
		const mappedData: ChatDetail = {
			chatID: res.data.chatID || res.data.chat_id,
			reservationID: res.data.reservationID || res.data.reservation_id,
			customerPhone: res.data.customerPhone || res.data.customer_phone || res.data.phone || res.data.phoneNumber || res.data.user?.phone || '', // Map phone
			messagesDetail: res.data.messagesDetail || res.data.messages_detail || []
		};
		return { ...res, data: mappedData };
	}
	return { ...res, data: { chatID: '', reservationID: '', messagesDetail: [] } };
=======
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
};

export const sendMessage = async (
	fetch: typeof window.fetch,
	chatId: string,
	content: string,
	token: string
): Promise<ApiResponse<any>> => {
	return postToApi(fetch, `/shared/create-message/${chatId}`, { content }, token);
};
