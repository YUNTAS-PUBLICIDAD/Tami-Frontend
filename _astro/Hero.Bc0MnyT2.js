import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as s}from"./index.6otl1p8d.js";const x={src:"/_astro/hc_1.BuGzYPWL.webp"},m={src:"/_astro/hc_2.PLXvSAd5.webp"},d={src:"/_astro/hc_3.BJCaWm-S.webp"},l=[{image:x.src,title:`Innovación y
soluciones para
cada proyecto`},{image:m.src,title:`Equipos de alta
tecnología para
impulsar tu negocio`},{image:d.src,title:`Herramientas
tecnología que
marcan la diferencia`}],g=()=>{const[r,i]=s.useState(0),[n,o]=s.useState(!0);function c(){document.getElementById("bienvenida")?.scrollIntoView({behavior:"smooth"})}return s.useEffect(()=>{const a=setInterval(()=>{o(!1),setTimeout(()=>{i(e=>(e+1)%l.length),o(!0)},1e3)},7500);return()=>clearInterval(a)},[]),t.jsxs("section",{className:"relative h-screen",children:[l.map((a,e)=>t.jsx("img",{src:a.image,className:`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${e===r?"opacity-100":"opacity-0"}`},e)),t.jsxs("div",{className:"relative pt-20 px-8 lg:pl-32 z-10 bg-gradient-to-b from-teal-700/75 to-black/75 h-full content-center",children:[t.jsx("h1",{className:`mb-8 xl:mb-12 2xl:mb-16 text-white text-3xl md:text-5xl lg:text-7xl 2xl:text-7xl lg:leading-22 2xl:leading-24  font-extrabold whitespace-pre-line transition-all duration-1000 ${n?"opacity-100 translate-y-0":"opacity-0 translate-y-10"}`,children:l[r].title}),l[r].items&&t.jsx("ul",{className:`mt-3 md:mt-8 transition-all duration-1000 ${n?"opacity-100 translate-y-0":"opacity-0 translate-y-5"}`,children:l[r].items.map((a,e)=>t.jsx("li",{className:"text-sm md:text-lg",children:a},e))}),t.jsx("button",{onClick:c,className:`cursor-pointer bg-white rounded-3xl border-2 border-slate-300 
         font-bold text-teal-700 hover:text-white 
         hover:bg-gradient-to-t hover:from-teal-600 hover:to-teal-800 
         transition-all ease-in-out duration-500 
         px-4 py-3 lg:px-6 lg:py-2 2xl:px-10 2xl:py-4 
         text-lg lg:text-xl xl:text-2xl 2xl:text-3xl`,children:"Descubre más"})]})]})};export{g as default};
