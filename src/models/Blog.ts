export default interface Blog {
  id: string;
  titulo: string;
  parrafo: string;
  descripcion: string;
  imagenPrincipal: string;
  tituloBlog: string;
  subTituloBlog: string;
  imagenesBlog: string[]; // Un array de strings (URLs de imágenes)
  parrafoImagenesBlog: string[]; // Un array de párrafos
  videoBlog: string;
  tituloVideoBlog: string;
}
