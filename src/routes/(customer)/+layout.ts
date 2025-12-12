import { browser } from '$app/environment';
import { getCompanySettings } from '$lib/api/shared/api';

export const load = async ({ fetch }) => {
    if (browser) {
        const response = await getCompanySettings(fetch);
        return {
            companySettings: response.success ? response.data : null
        };
    }

    return {
        companySettings: null
    };
};
