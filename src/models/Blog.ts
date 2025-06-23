export default interface Blog {
  id: number;
  titulo: string;
  producto_id: number | null;
  link: string;
  subtitulo1: string;
  subtitulo2: string;
  subtitulo3: string;
  video_id: string;
  video_url: string;
  video_titulo: string;
  imagenes: {
    ruta_imagen: string;
    texto_alt: string | null;
  }[];
  parrafos: {
    parrafo: string;
  }[];
}
