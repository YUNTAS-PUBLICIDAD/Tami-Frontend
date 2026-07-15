// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import path from 'path';

import partytown from '@astrojs/partytown';

export default defineConfig({
    site: 'https://tamimaquinarias.com/',
    vite: {
        // @ts-ignore
        plugins: [tailwindcss()], // Tu Tailwind v4 limpio
        resolve: {
            alias: {
                'src': path.resolve('./src'),
                '@images': path.resolve('./src/assets/images'),
                '@components': path.resolve('./src/components'),
                '@layouts': path.resolve('./src/layouts'),
                '@styles': path.resolve('./src/styles')
            }
        },
        build: {
            // 🚀 LA CLAVE AQUÍ: Cambiamos de true a false
            // Al no dividir el CSS, obligamos a que se unifique y Astro pueda inyectarlo
            cssCodeSplit: false, 
        },
    },
    integrations: [sitemap({
        filter: (page) =>
            !page.includes('/admin') &&
            !page.includes('/auth/') &&
            !page.includes('/blog/details') &&
            !page.includes('/catalogo-maquinarias/detalle') &&
            !page.includes('/catalogo-maquinarias/ModalDetalles') &&
            !page.includes('/buscar/')
    }), // criticalCSS({
    //     dimensions: [
    //         { width: 375, height: 812 },  
    //         { width: 1440, height: 1024 }  
    //     ]
    // })
    // No usar critical CSS por ahora, causa algunos problemas con los styles CSS
    react(), 
    partytown({
        config: {
          forward: ['dataLayer.push'],
        },
      })],
    build: {
        format: 'directory',
        // 🚀 Forzamos a Astro a inyectar el stylesheet unificado en el HTML
        inlineStylesheets: 'always', 
    },
    compressHTML: true,
    scopedStyleStrategy: 'where',
    image: {
        domains: ['localhost', '127.0.0.1'],
    },
});