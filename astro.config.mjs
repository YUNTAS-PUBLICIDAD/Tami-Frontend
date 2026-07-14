// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import path from 'path';

export default defineConfig({
    site: 'https://tamimaquinarias.com/',
    trailingSlash: 'always',
    vite: {
        //@ts-ignore
        plugins: [tailwindcss()],

        resolve: {
            alias: {
                src: path.resolve('./src'),
                '@images': path.resolve('./src/assets/images'),
                '@components': path.resolve('./src/components'),
                '@layouts': path.resolve('./src/layouts'),
                '@styles': path.resolve('./src/styles'),
            },
        },

        build: {
            cssCodeSplit: false,
        },
    },

    integrations: [
        sitemap({
            filter: (page) =>
                !page.includes('/admin') &&
                !page.includes('/auth/') &&
                !page.includes('/blog/details/') &&
                !page.includes('/catalogo-maquinarias/detalle/') &&
                !page.includes('/catalogo-maquinarias/ModalDetalles/') &&
                !page.includes('/buscar/')
        }),

        react(),

        partytown({
            config: {
                forward: ['dataLayer.push'],
            },
        }),
    ],

    build: {
        format: 'directory',
        inlineStylesheets: 'always',
    },

    compressHTML: true,
    scopedStyleStrategy: 'where',

    image: {
        domains: ['localhost', '127.0.0.1'],
    },
});