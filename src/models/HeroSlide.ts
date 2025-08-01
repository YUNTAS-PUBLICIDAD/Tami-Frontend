export default interface HeroSlide {
  image: HeroImage;
  title: string;
  alt: string;
  items?: string[];
}

interface HeroImage {
  desktop: string;
  mobile: string;
}