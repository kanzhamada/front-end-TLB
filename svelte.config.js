import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		alias: {
			'@/*': './path/to/lib/*'
		},
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		adapter: adapter()
	},
	// Vite configuration should be at the top level
	vite: {
		resolve: {
			dedupe: ['@fullcalendar/common']
		},
		optimizeDeps: {
			include: ['@fullcalendar/common']
		}
	},
	paths: {
		'*': '$lib/blocks',
		ui: '$lib/components/ui',
		hooks: '$lib/hooks',
		actions: '$lib/actions',
		utils: '$lib/utils'
	}
};

export default config;
