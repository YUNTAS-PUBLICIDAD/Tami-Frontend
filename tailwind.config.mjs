import typography from '@tailwindcss/typography'
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        'text-align': 'justify',
                        'text-justify': 'inter-word',
                    },
                },
            }),
        },
    },
    plugins: [typography],
}