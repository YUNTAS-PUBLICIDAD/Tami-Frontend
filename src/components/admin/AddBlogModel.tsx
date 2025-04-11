import { config, getApiUrl } from "config";
import { useState } from "react";

interface ImagenAdicional {
  url_imagen: File | null; // 👈 aquí permitimos File o null
  parrafo_imagen: string;
}

interface BlogPOST {
  titulo: string;
  parrafo: string;
  descripcion: string;
  imagen_principal: File | null; // 👈 aquí permitimos File o null
  titulo_blog: string;
  subtitulo_beneficio: string;
  url_video: string;
  titulo_video: string;
  imagenes: ImagenAdicional[]; // 👈 arreglo con imagen y párrafo
}

const AddBlogModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<BlogPOST>({
    titulo: "",
    parrafo: "",
    descripcion: "",
    imagen_principal: null, // 👈 inicializamos con null
    titulo_blog: "",
    subtitulo_beneficio: "",
    url_video: "",
    titulo_video: "",
    imagenes: [
      {
        url_imagen: null,
        parrafo_imagen: "",
      },
      {
        url_imagen: null,
        parrafo_imagen: "",
      },
    ], // 👈 inicializamos como un arreglo vacío
  });

  // Manejar cambios en los inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar cambios en la imagen (file input)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imagen_principal: e.target.files[0] });
    }
  };

  const handleFileChangeAdicional = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const nuevoArray = [...formData.imagenes];

      // Agregar el archivo y su parrafo
      nuevoArray[index] = {
        ...nuevoArray[index],
        url_imagen: e.target.files[0],
      };

      setFormData({ ...formData, imagenes: nuevoArray });
    }
  };

  const handleParrafoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const nuevoArray = [...formData.imagenes];
    nuevoArray[index] = {
      ...nuevoArray[index],
      parrafo_imagen: e.target.value,
    };
    setFormData({ ...formData, imagenes: nuevoArray });
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({
      titulo: "",
      parrafo: "",
      descripcion: "",
      imagen_principal: null,
      titulo_blog: "",
      subtitulo_beneficio: "",
      url_video: "",
      titulo_video: "",
      imagenes: [
        {
          url_imagen: null,
          parrafo_imagen: "",
        },
        {
          url_imagen: null,
          parrafo_imagen: "",
        },
      ],
    });
  };

  // Enviar los datos a la API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    if (
      !formData.titulo ||
      !formData.parrafo ||
      !formData.descripcion ||
      !formData.subtitulo_beneficio ||
      !formData.titulo_blog ||
      !formData.titulo_video ||
      !formData.url_video ||
      !formData.imagen_principal ||
      !formData.imagenes ||
      formData.imagenes.some((imagen) => !imagen.url_imagen) // Verifica si alguna imagen es null
    ) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("parrafo", formData.parrafo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append(
        "subtitulo_beneficio",
        formData.subtitulo_beneficio
      );
      formDataToSend.append("titulo_blog", formData.titulo_blog);
      formDataToSend.append("titulo_video", formData.titulo_video);
      formDataToSend.append("url_video", formData.url_video);
      formData.imagenes.forEach((item, index) => {
        if (item.url_imagen) {
          formDataToSend.append(
            `imagenes[${index}][url_imagen]`,
            item.url_imagen as File
          ); // Use 'imagen' key
        }
        formDataToSend.append(
          `imagenes[${index}][parrafo_imagen]`,
          item.parrafo_imagen
        );
      });
      formDataToSend.append(
        "imagen_principal",
        formData.imagen_principal as File
      ); // Subir imagen como archivo

      const response = await fetch(getApiUrl(config.endpoints.blogs.create), {
        method: "POST",
        body: formDataToSend, // FormData
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        alert("✅ Blog añadido exitosamente");
        closeModal(); // Cerrar modal
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert(`❌ Error: ${error}`);
    }
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white text-lg px-10 py-1.5 rounded-full flex items-center gap-2"
      >
        Añadir Blog
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="h-3/4 overflow-y-scroll bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
            <h2 className="text-2xl font-bold mb-4">AÑADIR BLOG</h2>

            {/* Formulario */}
            <form
              encType="multipart/form-data"
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 gap-x-12"
            >
              <div>
                <label className="block">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Párrafo</label>
                <input
                  type="text"
                  name="parrafo"
                  value={formData.parrafo}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Subtítulo Beneficio</label>
                <input
                  type="text"
                  name="subtitulo_beneficio"
                  value={formData.subtitulo_beneficio}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Título Blog</label>
                <input
                  type="text"
                  name="titulo_blog"
                  value={formData.titulo_blog}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Título Video</label>
                <input
                  type="text"
                  name="titulo_video"
                  value={formData.titulo_video}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">URL del Video</label>
                <input
                  type="text"
                  name="url_video"
                  value={formData.url_video}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Imagen Principal</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  name="imagen_principal"
                  onChange={handleFileChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>
              {formData.imagenes.map((imagen, index) => (
                <div key={index} className="col-span-2">
                  <label className="block">Imagen {index + 1}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChangeAdicional(e, index);
                    }}
                    required
                    className="w-full bg-white outline-none p-2 rounded-md text-black"
                  />
                  <textarea
                    onChange={(e) => {
                      handleParrafoChange(e, index);
                    }}
                    required
                    placeholder="Descripción de la imagen..."
                    className="w-full bg-white outline-none p-2 rounded-md text-black mt-2 min-h-36"
                  />
                </div>
              ))}

              {/* Botones */}
              <div className="flex gap-2 mt-8">
                <button type="submit" className="admin-act-btn">
                  Añadir Blog
                </button>
                <button
                  onClick={closeModal}
                  type="button"
                  className="cancel-btn"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBlogModal;
