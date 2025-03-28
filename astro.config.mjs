// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                '@images': path.resolve('./src/assets/images'),
                '@components': path.resolve('./src/components'),
                '@layouts': path.resolve('./src/layouts'),
                '@styles': path.resolve('./src/styles')
            }
        }
    },
    integrations: [react()]
});