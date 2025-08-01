import type HeroSlide from "../models/HeroSlide";
import slide1 from "@images/index/hero/zonas-comercial-urbano.webp";
import slide1Mobile from "@images/index/hero/mobile/zonas-comercial-urbano-750.webp";

import slide2 from "@images/index/hero/impulso-negocios-tecnologia.webp";
import slide2Mobile from "@images/index/hero/mobile/impulso-negocios-tecnologia-750.webp";

import slide3 from "@images/index/hero/mano-agua-fresca.webp";
import slide3Mobile from "@images/index/hero/mobile/mano-agua-fresca-750.webp";

const heroArray: HeroSlide[] = [
  {
    image: {
      desktop: slide1.src,
      mobile: slide1Mobile.src,
    },
    title: "Innovación y\nsoluciones para\ncada proyecto",
    alt: "Zonas comerciales urbanas",
  },
  {
    image: {
      desktop: slide2.src,
      mobile: slide2Mobile.src,
    },
    title: "Equipos de alta\ntecnología para\nimpulsar tu negocio",
    alt: "Centro comercial tecnológico",
  },
  {
    image: {
      desktop: slide3.src,
      mobile: slide3Mobile.src,
    },
    title: "Herramientas\ntecnología que\nmarcan la diferencia",
    alt: "Mano sirviendo agua fresca",
  },
];

export default heroArray;
