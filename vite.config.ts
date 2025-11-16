import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	envPrefix: 'PUBLIC_',
	server: {
		proxy: {
			// Proxy API requests to the backend server
			'/auth': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			},
			'/customer': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			},
			'/admin': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			},
			'/shared': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			},
			'/payments': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			}
		}
	}
});
