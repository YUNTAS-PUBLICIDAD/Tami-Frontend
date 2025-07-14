export default interface Blog {
  id: number;
  titulo: string;
  producto_id: number | null;
  link: string; // nuevo video_id
  subtitulo1: string; // antes: parrafo
  subtitulo2: string; // antes: descripcion
  subtitulo3: string; // antes: subititulo_beneficio
  video_id: string; // tiene espacios, cuidado en postman
  video_url: string;
  video_titulo: string;
  miniatura: string;
  imagenes: {
    ruta_imagen: string;
    texto_alt: string | null;
  }[];
  parrafos: {
    parrafo: string;
  }[];
}
