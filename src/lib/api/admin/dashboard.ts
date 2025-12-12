import { getFromApi } from '$lib/api/shared/api';

export interface ReservationItem {
	reservationID: string;
	customerName: string;
	serviceName: string;
	barberName: string;
	date: string;
	time: string;
	status: string;
}

export interface UpcomingItem {
	reservationID: string;
	customerName: string;
	serviceName: string;
	date: string;
	time: string;
}

export interface OperationalStats {
	unread_chat_count: number;
	pending_actions: ReservationItem[];
	ongoing_reservations: ReservationItem[];
	upcoming_reservations: UpcomingItem[];
}

export interface FinanceStats {
	online: number;
	offline: number;
	total: number;
}

export interface FinanceOverview {
	today: FinanceStats;
	week: FinanceStats;
	month: FinanceStats;
}

export interface DashboardData {
	operational: OperationalStats;
	finance_overview: FinanceOverview;
}

export async function getDashboardInfo(fetch: any, token: string) {
	return await getFromApi<DashboardData>(fetch, '/admin/dashboard-info', token);
}
