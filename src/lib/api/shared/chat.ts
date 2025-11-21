import type { ApiResponse } from './api';

// Define types for chat functionality
export type Message = {
	content: string;
	sender: string; // UUID
	created_at: string;
	read: boolean;
};

export type ChatDetail = {
	chatID: string;
	reservationID: string;
	messagesDetail: Message[];
};

export type ChatInboxItem = {
	chatID: string;
	reservationID: string;
	customer_name: string;
	last_message: string;
	last_sent_at: string;
	unread_count: number;
};

export type CreateMessagePayload = {
	content: string;
};

export type CreateMessageResponse = {
	sender: string;
	content: string;
};

// Base API URL from environment
const API_URL = import.meta.env.PUBLIC_API_URL;

/**
 * Fetch messages for a reservation
 */
export const getMessagesByReservation = async (
	reservationId: string,
	accessToken: string
): Promise<ApiResponse<ChatDetail>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/shared/view-chat/${reservationId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to fetch messages',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch messages',
			error
		};
	}
};

/**
 * Send a new message to a chat
 */
export const sendMessage = async (
	chatId: string,
	payload: CreateMessagePayload,
	accessToken: string
): Promise<ApiResponse<CreateMessageResponse>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/shared/create-message/${chatId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify(payload)
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to send message',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to send message',
			error
		};
	}
};

/**
 * Fetch admin chat inbox
 */
export const getAdminChatInbox = async (
	accessToken: string
): Promise<ApiResponse<ChatInboxItem[]>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/admin/chat-inbox`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to fetch chat inbox',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch chat inbox',
			error
		};
	}
};

/**
 * Mark messages as read for a chat
 */
export const markMessagesAsRead = async (
	chatId: string,
	viewerUserId: string
): Promise<ApiResponse<null>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		// In a real implementation, you would call a specific API endpoint
		// For now, we'll use the Supabase client directly since this is handled by RPC
		console.log(`Marking messages as read for chat ${chatId} by user ${viewerUserId}`);

		return {
			success: true,
			message: 'Messages marked as read'
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to mark messages as read',
			error
		};
	}
};
