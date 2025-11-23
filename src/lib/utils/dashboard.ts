import type { Reservation } from '$lib/types/adminTypes';

export type Period = 'weekly' | 'monthly' | 'yearly';

export interface ChartDataPoint {
    xAxis: string;
    income: number;
    customer: number;
}

export interface DashboardStats {
    totalIncome: number;
    totalCustomers: number;
    incomeTrend: number;
    customerTrend: number;
}

// --- Helper Functions ---

export function parseDate(dateTimeStr: string): Date {
    return new Date(dateTimeStr.replace(' ', 'T'));
}

export function formatCurrency(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

function getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long' });
}

// --- Core Logic ---

/**
 * Calculates the start and end dates for the current and previous periods.
 */
function getPeriodRanges(period: Period, now: Date = new Date()) {
    let currentStart: Date, currentEnd: Date;
    let prevStart: Date, prevEnd: Date;

    // Clone now to avoid mutation side effects
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (period === 'weekly') {
        // Current: Last 7 days (including today)
        currentEnd = new Date(now);
        currentStart = new Date(today);
        currentStart.setDate(today.getDate() - 6);

        // Previous: The 7 days before that
        prevEnd = new Date(currentStart);
        prevEnd.setDate(prevEnd.getDate() - 1);
        prevEnd.setHours(23, 59, 59, 999);

        prevStart = new Date(prevEnd);
        prevStart.setDate(prevEnd.getDate() - 6);
        prevStart.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
        // Current: This Month (1st to end)
        currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Previous: Last Month
        prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        prevEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    } else {
        // Current: This Year
        currentStart = new Date(today.getFullYear(), 0, 1);
        currentEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

        // Previous: Last Year
        prevStart = new Date(today.getFullYear() - 1, 0, 1);
        prevEnd = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    }

    return { currentStart, currentEnd, prevStart, prevEnd };
}

/**
 * Generates the initial empty chart data structure with correct labels.
 */
function initializeChartData(period: Period, currentStart: Date, currentEnd: Date): { labelOrder: string[], grouped: Record<string, { income: number; customer: number }> } {
    const grouped: Record<string, { income: number; customer: number }> = {};
    const labelOrder: string[] = [];

    if (period === 'weekly') {
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentStart);
            d.setDate(currentStart.getDate() + i);
            const label = getDayName(d);
            grouped[label] = { income: 0, customer: 0 };
            labelOrder.push(label);
        }
    } else if (period === 'monthly') {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        for (const month of months) {
            grouped[month] = { income: 0, customer: 0 };
            labelOrder.push(month);
        }
    } else {
        // For yearly, we might want a dynamic range, but typically for "Yearly" view 
        // in this context, it often implies "This Year" vs "Last Year" trend, 
        // but the chart usually shows a range of years. 
        // However, the original code showed *all* years from the first reservation.
        // We will handle dynamic year keys in the aggregation loop if they don't exist, 
        // but for a clean chart, let's pre-fill a reasonable range or just let it grow.
        // To keep it simple and robust: we'll let the aggregation fill the years, 
        // then sort them.
    }

    return { labelOrder, grouped };
}

/**
 * Main function to process reservations into chart data and statistics.
 * Optimizes by doing a single pass over the data.
 */
export function processChartData(reservations: Reservation[], period: Period): { chartData: ChartDataPoint[], stats: DashboardStats } {
    const now = new Date();
    const { currentStart, currentEnd, prevStart, prevEnd } = getPeriodRanges(period, now);

    // Initialize chart buckets
    // Note: For 'yearly', we'll determine the range dynamically or based on input.
    // The original code scanned all reservations to find the first year.
    // We can do that efficiently.

    let labelOrder: string[] = [];
    let grouped: Record<string, { income: number; customer: number }> = {};

    if (period === 'yearly') {
        // We need to find the min year first to initialize properly if we want a continuous axis
        // Or we can just collect all years.
        // Let's collect all years encountered in the loop for the chart.
    } else {
        const init = initializeChartData(period, currentStart, currentEnd);
        labelOrder = init.labelOrder;
        grouped = init.grouped;
    }

    // Stats accumulators
    let currentIncome = 0;
    let currentCustomers = 0;
    let prevIncome = 0;
    let prevCustomers = 0;

    // Single pass aggregation
    for (const res of reservations) {
        if (!['completed', 'on-going'].includes(res.status)) continue;

        const date = parseDate(res.dateTime);
        const amount = res.amount || 0;

        // 1. Calculate Stats (Current vs Previous Period)
        if (date >= currentStart && date <= currentEnd) {
            currentIncome += amount;
            currentCustomers += 1;
        } else if (date >= prevStart && date <= prevEnd) {
            prevIncome += amount;
            prevCustomers += 1;
        }

        // 2. Populate Chart Data
        // Only populate chart data if it falls within the "Current" view range 
        // (or for Yearly, if it's any year)

        let key: string | null = null;

        if (period === 'weekly') {
            if (date >= currentStart && date <= currentEnd) {
                key = getDayName(date);
            }
        } else if (period === 'monthly') {
            // For monthly view, we usually show the breakdown of the *current year*
            if (date.getFullYear() === now.getFullYear()) {
                key = getMonthName(date);
            }
        } else if (period === 'yearly') {
            key = date.getFullYear().toString();
        }

        if (key) {
            if (!grouped[key]) {
                grouped[key] = { income: 0, customer: 0 };
                // For yearly, maintain order
                if (period === 'yearly' && !labelOrder.includes(key)) {
                    labelOrder.push(key);
                }
            }
            grouped[key].income += amount;
            grouped[key].customer += 1;
        }
    }

    // Post-process for Yearly to ensure sorted order
    if (period === 'yearly') {
        labelOrder.sort();
        // Fill gaps if necessary? The original code did. 
        // Let's fill gaps between min and max year.
        if (labelOrder.length > 0) {
            const minYear = parseInt(labelOrder[0]);
            const maxYear = parseInt(labelOrder[labelOrder.length - 1]);
            const newOrder: string[] = [];
            const newGrouped: Record<string, { income: number; customer: number }> = {};

            for (let y = minYear; y <= maxYear; y++) {
                const k = y.toString();
                newOrder.push(k);
                newGrouped[k] = grouped[k] || { income: 0, customer: 0 };
            }
            labelOrder = newOrder;
            grouped = newGrouped;
        } else {
            // If no data, show current year at least
            const currentYear = now.getFullYear().toString();
            labelOrder = [currentYear];
            grouped = { [currentYear]: { income: 0, customer: 0 } };
        }
    }

    // Calculate Trends
    const calculateTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    return {
        chartData: labelOrder.map(xAxis => ({
            xAxis,
            income: grouped[xAxis].income,
            customer: grouped[xAxis].customer
        })),
        stats: {
            totalIncome: currentIncome,
            totalCustomers: currentCustomers,
            incomeTrend: calculateTrend(currentIncome, prevIncome),
            customerTrend: calculateTrend(currentCustomers, prevCustomers)
        }
    };
}
