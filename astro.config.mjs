// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
// import criticalCSS from 'astro-critical-css';
import sitemap from '@astrojs/sitemap';
import path from 'path';

export default defineConfig({
    site: 'https://tamimaquinarias.com/',
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
    integrations: [
        sitemap({
            filter: (page) =>
                !page.includes('/admin') &&
                !page.includes('/auth/') &&
                !page.includes('/blog/details') &&
                !page.includes('/productos/detalle')
        }),
        react(),
        // criticalCSS({
        //     dimensions: [
        //         { width: 375, height: 812 },  
        //         { width: 1440, height: 1024 }  
        //     ]
        // })
        // No usar critical CSS por ahora, causa algunos problemas con los styles CSS
    ],
    build: {
        format: 'directory',
        inlineStylesheets: 'auto',
    },
    compressHTML: true,
    scopedStyleStrategy: 'where'
});
