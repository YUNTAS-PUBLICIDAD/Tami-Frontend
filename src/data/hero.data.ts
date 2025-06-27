import type HeroSlide from "../models/HeroSlide";
import slide1 from "@images/index/hero/zonas-comercial-urbano.webp";
import slide2 from "@images/index/hero/impulso-negocios-tecnologia.webp";
import slide3 from "@images/index/hero/mano-agua-fresca.webp";

const heroArray: HeroSlide[] = [
  {
    image: slide1.src,
    title: "Innovación y\nsoluciones para\ncada proyecto",
    alt: "Zonas comerciales urbanas",
  },
  {
    image: slide2.src,
    title: "Equipos de alta\ntecnología para\nimpulsar tu negocio",
    alt: "Centro comercial tecnológico",
  },
  {
    image: slide3.src,
    title: "Herramientas\ntecnología que\nmarcan la diferencia",
    alt: "Mano sirviendo agua fresca",
  },
];

export default heroArray;
