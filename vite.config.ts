import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	build: {
		sourcemap: true,
	},
	plugins: [tailwindcss(), enhancedImages(), sveltekit()],
});