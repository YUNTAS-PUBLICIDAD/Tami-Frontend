import { useState } from "react";

const AddBlogModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<{
        titulo: string;
        parrafo: string;
        descripcion: string;
        subtitulo_beneficio: string;
        titulo_blog: string;
        titulo_video: string;
        url_video: string;
        imagen_principal: File | null; // 👈 aquí permitimos File o null
    }>({
        titulo: "",
        parrafo: "",
        descripcion: "",
        subtitulo_beneficio: "",
        titulo_blog: "",
        titulo_video: "",
        url_video: "",
        imagen_principal: null,
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
            !formData.imagen_principal
        ) {
            alert("⚠️ Todos los campos son obligatorios.");
            return;
        }

        try {
            const token = "6|YxWK8EZ7QPMliRGNht0E6jpxPDtSmUnNMGDI417A412857e8";
            const formDataToSend = new FormData();

            formDataToSend.append("titulo", formData.titulo);
            formDataToSend.append("parrafo", formData.parrafo);
            formDataToSend.append("descripcion", formData.descripcion);
            formDataToSend.append("subtitulo_beneficio", formData.subtitulo_beneficio);
            formDataToSend.append("titulo_blog", formData.titulo_blog);
            formDataToSend.append("titulo_video", formData.titulo_video);
            formDataToSend.append("url_video", formData.url_video);
            formDataToSend.append("imagen_principal", formData.imagen_principal); // Subir imagen como archivo

            const response = await fetch("/api/blogs", {
                method: "POST",
                body: formDataToSend, // FormData
            });

            const data = await response.json();
            console.log("Respuesta del servidor:", data);

            if (response.ok) {
                alert("✅ Blog añadido exitosamente");
                setIsOpen(false); // Cerrar modal
            } else {
                alert(`❌ Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            alert("❌ Hubo un error en la conexión con la API.");
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
                    <div className="bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
                        <h2 className="text-2xl font-bold mb-4">AÑADIR BLOG</h2>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 gap-x-12">
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
                                    name="imagen_principal"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full bg-white outline-none p-2 rounded-md text-black"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2 mt-8">
                                <button
                                    type="submit"
                                    className="px-10 bg-teal-400 py-1 rounded-full text-lg hover:bg-teal-500"
                                >
                                    Añadir Blog
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    type="button"
                                    className="px-10 bg-gray-400 py-1 rounded-full text-lg hover:bg-gray-500"
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