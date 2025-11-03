import { createRawSnippet } from 'svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';

export function createTextCellSnippet() {
  return createRawSnippet<[string]>((getValue) => {
    const value = getValue();
    return {
      render: () => `<div class="font-medium text-gray-900">${value}</div>`
    };
  });
}

export function createCurrencyCellSnippet(currency = 'IDR') {
  return createRawSnippet<[string]>((getValue) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    const value = getValue();
    return {
      render: () => `<div class="text-right font-semibold text-gray-900">${value}</div>`
    };
  });
}

export function createStatusCellSnippet(statusMap: Record<string, { text: string; class: string }>) {
  return createRawSnippet<[string]>((getStatus) => {
    const status = getStatus();
    const config = statusMap[status] || { text: status, class: 'bg-gray-50 text-gray-700 border border-gray-200' };
    return {
      render: () => `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.class}">${config.text}</span>`
    };
  });
}