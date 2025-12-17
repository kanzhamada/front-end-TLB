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
			'/customer': {
				target: process.env.PUBLIC_API_URL,
				changeOrigin: true,
				secure: false
			},
			'/shared': {
				target: process.env.PUBLIC_API_URL,
				changeOrigin: true,
				secure: false
			},
			'/payments': {
				target: process.env.PUBLIC_API_URL,
				changeOrigin: true,
				secure: false
			}
		}
	},
	build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  esbuild: {
        drop: ['console', 'debugger'],
    },
});
