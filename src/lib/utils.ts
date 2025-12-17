import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Optimizes an image URL by appending Supabase storage transformation parameters.
 * Converts format to WebP and resizes if width is provided.
 */
export function optimizeImage(url: string, width?: number): string {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    const separator = url.includes('?') ? '&' : '?';
    let params = `format=webp&resize=cover`;
    
    if (width) {
        params += `&width=${width}`;
    }

    return `${url}${separator}${params}`;
}