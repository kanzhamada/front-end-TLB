import { getFromApi } from '$lib/api/shared/api';

export interface RecentReservation {
	reservationID: string;
	customerName: string;
	serviceName: string;
	barberName: string;
	date: string;
	time: string;
	status: string;
	created_at: string;
}

export interface PendingCorrection {
	reservationID: string;
	customerName: string;
	status: string;
	date: string;
	time: string;
}

export interface UpcomingReservation {
	reservationID: string;
	customerName: string;
	serviceName: string;
	date: string;
	time: string;
}

export interface RevenueItem {
	day?: string;
	week?: string;
	month?: string;
	revenue: number;
}

export interface DashboardData {
	general: {
		totalReservation: number;
		activeBarbers: number;
		recentReservations: RecentReservation[];
		pendingCorrections: PendingCorrection[];
		upcomingReservations: UpcomingReservation[];
	};
	revenue: {
		totalRevenue: number;
		overview: {
			weekly: RevenueItem[];
			monthly: RevenueItem[];
			yearly: RevenueItem[];
		};
	};
}

export async function getDashboardInfo(fetch: any, token: string) {
	return await getFromApi<DashboardData>(fetch, '/admin/dashboard-info', token);
}
