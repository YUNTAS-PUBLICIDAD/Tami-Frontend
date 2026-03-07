import { z } from "zod";
import { config } from "../../../../config.ts";
import apiClient from "../../../services/apiClient";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const MAX_IMAGE_MB = 2;
const ACCEPT_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
/* ====== Límites centralizados ====== */
const LENGTHS = {
  titulo: 120,
  parrafo: 100, // subtitulo1
  descripcion: 255, // subtitulo2
  videoTitulo: 125,
  videoUrl: 255,
  metaTitulo: 60, // recomendado (no bloqueante)
  metaDescripcion: 160, // recomendado (no bloqueante)
};

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_MB * 1024 * 1024, "Máx 2MB")
  .refine(
    (file) => ACCEPT_IMAGE_TYPES.includes(file.type),
    "Formato inválido (JPG, PNG, WEBP)",
  );

const imagenSchema = z
  .object({
    imagen: fileSchema.optional(),
    url: z.string().optional(),
    parrafo: z.string().min(1, "El párrafo es obligatorio"),
    text_alt: z.string().min(1, "El texto ALT es obligatorio"),
  })
  .refine((data) => data.imagen instanceof File || !!data.url, {
    message: "Debes subir una imagen",
    path: ["imagen"],
  });
const blogSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio").max(LENGTHS.titulo),
  link: z.string().min(1, "El link es obligatorio"),
  subtitulo1: z
    .string()
    .min(1, "El párrafo corto es obligatorio")
    .max(LENGTHS.parrafo),
  subtitulo2: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(LENGTHS.descripcion),
  video_titulo: z
    .string()
    .min(1, "El título del video es obligatorio")
    .max(LENGTHS.videoTitulo),
  video_url: z.string().url("Debe ser una URL válida").max(LENGTHS.videoUrl),
  producto_id: z.string().min(1, "Selecciona un producto"),
  miniatura: z
    // .instanceof(File)
    .union([z.instanceof(File), z.string()])
    // .optional()
    .refine((value) => value !== undefined, "La miniatura es obligatoria"),
  // .refine(
  //   (file, ctx) => file || blogToEdit?.miniatura,
  //   "La miniatura es obligatoria",
  // )
  // .refine(
  //   (file) => !file || file.size <= MAX_IMAGE_MB * 1024 * 1024,
  //   "Máx 2MB",
  // )
  // .refine(
  //   (file) => !file || ACCEPT_IMAGE_TYPES.includes(file.type),
  //   "Formato inválido",
  // ),
  imagenes: z.array(imagenSchema).min(1, "Debe existir al menos una imagen"),
  etiqueta: z.object({
    meta_titulo: z.string().max(LENGTHS.metaTitulo).optional(),
    meta_descripcion: z.string().max(LENGTHS.metaDescripcion).optional(),
  }),
});
type BlogFormData = z.infer<typeof blogSchema>;

interface AddBlogModalProps {
  onBlogAdded: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  blogToEdit?: any;
}

const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

const AddBlogModal: React.FC<AddBlogModalProps> = ({
  onBlogAdded,
  isOpen: propIsOpen,
  onClose,
  blogToEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [miniPreview, setMiniPreview] = useState<string | undefined>(undefined);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedText, setSelectedText] = useState("");
  const [link, setLink] = useState("");
  const [initialValues, setInitialValues] = useState<BlogFormData | null>(null);

  const mapBlogToForm = (blog: any): BlogFormData => {
    return {
      titulo: blog.titulo ?? "",
      link: blog.link ?? "",
      subtitulo1: blog.subtitulo1 ?? "",
      subtitulo2: blog.subtitulo2 ?? "",
      video_titulo: blog.video_titulo ?? "",
      video_url: blog.video_url ?? "",
      producto_id: String(blog.producto_id ?? ""),
      miniatura: blog.miniatura ?? "",

      imagenes: blog.imagenes?.map((img: any, index: number) => ({
        imagen: undefined,
        url: img.ruta_imagen
          ? img.ruta_imagen.startsWith("http")
            ? img.ruta_imagen
            : `${import.meta.env.PUBLIC_API_URL}${img.ruta_imagen}`
          : "",
        parrafo: blog.parrafos?.[index]?.parrafo || "",
        text_alt: img.text_alt || "",
      })) || [{ imagen: undefined, url: "", parrafo: "", text_alt: "" }],

      etiqueta: {
        meta_titulo: blog.etiqueta?.meta_titulo ?? "",
        meta_descripcion: blog.etiqueta?.meta_descripcion ?? "",
      },
    };
  };

  const EMPTY_BLOG: BlogFormData = {
    titulo: "",
    link: "",
    subtitulo1: "",
    subtitulo2: "",
    video_titulo: "",
    video_url: "",
    producto_id: "",
    // miniatura: undefined,
    miniatura: "",
    imagenes: [{ imagen: undefined, parrafo: "", text_alt: "" }],
    etiqueta: { meta_titulo: "", meta_descripcion: "" },
  };
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<BlogFormData>({
    // resolver: zodResolver(blogSchema),
    resolver: zodResolver(blogSchema),
    defaultValues: EMPTY_BLOG,
    // defaultValues: {
    //   titulo: "",
    //   link: "",
    //   subtitulo1: "",
    //   subtitulo2: "",
    //   video_titulo: "",
    //   video_url: "",
    //   producto_id: "",
    //   miniatura: undefined,
    //   imagenes: [
    //     {
    //       imagen: undefined,
    //       parrafo: "",
    //       text_alt: "",
    //     },
    //   ],
    //   etiqueta: {
    //     meta_titulo: "",
    //     meta_descripcion: "",
    //   },
    // },
  });
  useEffect(() => {
    if (blogToEdit) {
      const mapped = mapBlogToForm(blogToEdit);
      reset(mapped);
      setInitialValues(mapped);
    } else {
      reset(EMPTY_BLOG);
      setInitialValues(EMPTY_BLOG);
    }
  }, [blogToEdit, reset]);
  // const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // const [isProductLinkModalOpen, setIsProductLinkModalOpen] = useState(false);
  const [linking, setLinking] = useState<{
    index: number;
    text: string;
    type: "manual" | "producto";
  } | null>(null);

  const schema = blogSchema.refine(
    (data) => data.miniatura || !!blogToEdit?.miniatura,
    {
      message: "La miniatura es obligatoria",
      path: ["miniatura"],
    },
  );

  const handleLinkInsert = (url: string) => {
    if (!linking) return;

    const imagenes = getValues("imagenes");
    const linked = `<a href="${url}" style="font-weight:bold">${linking.text}</a>`;
    const parrafo = imagenes[linking.index].parrafo.replace(
      linking.text,
      linked,
    );
    setValue(`imagenes.${linking.index}.parrafo`, parrafo);

    setLinking(null);
  };

  useEffect(() => {
    const file = watch("miniatura");
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setMiniPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (blogToEdit?.miniatura) {
      setMiniPreview(
        blogToEdit.miniatura.startsWith("http")
          ? blogToEdit.miniatura
          : `${import.meta.env.PUBLIC_API_URL}${blogToEdit.miniatura}`,
      );
    } else {
      setMiniPreview(undefined);
    }

    // setMiniPreview(undefined);
  }, [watch("miniatura"), blogToEdit]);

  useEffect(() => {
    if (!blogToEdit) {
      reset(EMPTY_BLOG);
      setMiniPreview(undefined);
      return;
    }
    // console.log("blogToEdit completo:", blogToEdit);
    // console.log("📦 imagenes:", blogToEdit?.imagenes);
    // console.log("📦 parrafos:", blogToEdit?.parrafos);

    const imagenes =
      blogToEdit.imagenes?.map((img: any, index: number) => {
        const raw = img.ruta_imagen || "";

        return {
          imagen: undefined,
          parrafo: blogToEdit.parrafos?.[index]?.parrafo || "",
          text_alt: img.text_alt || "",
          // url: raw
          //   ? raw.startsWith("http")
          //     ? raw
          //     : `${import.meta.env.PUBLIC_API_URL}${raw}`
          //   : "",
          url: img.ruta_imagen
            ? img.ruta_imagen.startsWith("http")
              ? img.ruta_imagen
              : `${import.meta.env.PUBLIC_API_URL}${img.ruta_imagen}`
            : "",
        };
      }) || [];

    reset({
      titulo: blogToEdit.titulo ?? "",
      link: blogToEdit.link ?? "",
      subtitulo1: blogToEdit.subtitulo1 ?? "",
      subtitulo2: blogToEdit.subtitulo2 ?? "",
      video_titulo: blogToEdit.video_titulo ?? "",
      video_url: blogToEdit.video_url ?? "",
      producto_id: String(blogToEdit.producto_id ?? ""),
      // miniatura: undefined,
      miniatura: blogToEdit?.miniatura || "",
      imagenes: imagenes.length
        ? imagenes
        : [{ imagen: undefined, parrafo: "", text_alt: "" }],
      etiqueta: {
        meta_titulo:
          blogToEdit.etiqueta?.meta_titulo ?? blogToEdit.meta_titulo ?? "",
        meta_descripcion:
          blogToEdit.etiqueta?.meta_descripcion ??
          blogToEdit.meta_description ??
          "",
      },
    });

    if (blogToEdit.miniatura) {
      setMiniPreview(
        blogToEdit.miniatura.startsWith("http")
          ? blogToEdit.miniatura
          : `${import.meta.env.PUBLIC_API_URL}${blogToEdit.miniatura}`,
      );
    } else {
      setMiniPreview(undefined);
    }
  }, [blogToEdit, reset]);

  const [productos, setProductos] = useState<any[]>([]);

  const currentValues = getValues();
  // const isChanged =
  //   JSON.stringify(currentValues) !== JSON.stringify(initialValues);

  // const isChanged = useMemo(() => {
  //   if (!initialValues) return false;
  //   return JSON.stringify(getValues()) !== JSON.stringify(initialValues);
  // }, [initialValues, watch()]);

  const watched = watch();

  const isChanged = useMemo(() => {
    if (!initialValues) return false;

    return JSON.stringify(watched) !== JSON.stringify(initialValues);
  }, [initialValues, watched]);

  useEffect(() => {
    const fetchProductos = async () => {
      const response = await apiClient.get(config.endpoints.productos.list);

      const data = response.data;

      let lista: any[] = [];

      if (Array.isArray(data)) lista = data;
      else if (Array.isArray(data?.data)) lista = data.data;
      else if (Array.isArray(data?.data?.productos))
        lista = data.data.productos;

      setProductos(lista);
    };

    fetchProductos();
  }, []);

  const handleFileChangeAdicional = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPT_IMAGE_TYPES.includes(file.type)) {
      Swal.fire("Formato no válido", "Solo JPG, PNG o WEBP.", "warning");
      return;
    }

    if (bytesToMB(file.size) > MAX_IMAGE_MB) {
      Swal.fire("Imagen muy pesada", `Máx ${MAX_IMAGE_MB} MB`, "warning");
      return;
    }

    setValue(`imagenes.${index}.imagen`, file);
  };

  const handleAltTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    // const value = e.target.value;

    // const newImages = [...control._formValues.imagenes];
    // newImages[index].text_alt = value;

    // reset({
    //   ...control._formValues,
    //   imagenes: newImages,
    // });

    setValue(`imagenes.${index}.text_alt`, e.target.value);
  };

  const handleParrafoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    // const value = e.target.value;

    // const newImages = [...control._formValues.imagenes];
    // newImages[index].parrafo = value;

    // reset({
    //   ...control._formValues,
    //   imagenes: newImages,
    // });
    setValue(`imagenes.${index}.parrafo`, e.target.value);
  };

  const handleInsertLinkClick = (index: number) => {
    const textarea = document.getElementById(
      `crear_descripcion_antes_${index}`,
    ) as HTMLTextAreaElement;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    if (!selected) {
      Swal.fire(
        "Selecciona texto",
        "Selecciona texto para enlazar.",
        "warning",
      );
      return;
    }

    // setActiveIndex(index);
    // setSelectedText(selected);
    // setIsModalOpen(true);
    setLinking({
      index,
      text: selected,
      type: "manual",
    });
  };

  const handleProductLinkClick = (index: number) => {
    const textarea = document.getElementById(
      `crear_descripcion_antes_${index}`,
    ) as HTMLTextAreaElement;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    if (!selected) {
      Swal.fire(
        "Selecciona texto",
        "Selecciona texto para enlazar.",
        "warning",
      );
      return;
    }

    // setActiveIndex(index);
    // setSelectedText(selected);
    // setIsProductLinkModalOpen(true);
    setLinking({
      index,
      text: selected,
      type: "producto",
    });
  };

  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    reset();

    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  const { fields, append, remove } = useFieldArray<BlogFormData>({
    control,
    name: "imagenes",
  });

  const onSubmit = async (data: BlogFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      const isEdit = Boolean(blogToEdit);

      // Object.entries(data).forEach(([key, value]) => {
      //   formData.append(key, value as string);
      // });

      formData.append("titulo", data.titulo);
      formData.append("link", data.link);
      formData.append("subtitulo1", data.subtitulo1);
      formData.append("subtitulo2", data.subtitulo2);
      formData.append("video_url", data.video_url);
      formData.append("producto_id", data.producto_id);

      if (data.miniatura instanceof File) {
        formData.append("miniatura", data.miniatura);
      }

      data.imagenes.forEach((img) => {
        if (img.imagen instanceof File) {
          formData.append("imagenes[]", img.imagen);
        }

        formData.append("parrafos[]", img.parrafo);
        formData.append("text_alt[]", img.text_alt);
      });

      formData.append("meta_titulo", data.etiqueta.meta_titulo || "");
      formData.append("meta_descripcion", data.etiqueta.meta_descripcion || "");

      formData.append("video_titulo", data.video_titulo);

      // console.log("FORM DATA:", data);

      // Object.entries(data).forEach(([k, v]) => {
      //   console.log(k, v);
      // });

      // console.log("FORM DATA:", data);

      // Object.entries(data).forEach(([k, v]) => {
      //   console.log(k, v);
      // });

      // Endpoint dinámico
      // const endpoint = isEdit
      //   ? config.endpoints.blogs.update(blogToEdit.id)
      //   : config.endpoints.blogs.create;

      // const method = isEdit ? "put" : "post";

      // await apiClient[method](endpoint, formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      const endpoint = isEdit
        ? config.endpoints.blogs.update(blogToEdit.id)
        : config.endpoints.blogs.create;

      if (isEdit) {
        formData.append("_method", "PUT");
      }

      await apiClient.post(endpoint, formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });

      await Swal.fire(
        "Éxito",
        isEdit ? "Blog actualizado correctamente" : "Blog creado correctamente",
        "success",
      );

      closeModal();
      onBlogAdded();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo crear el blog", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(isOpen || propIsOpen) && (
        <div className="dialog-overlay">
          <div className="max-h-[90vh] dialog">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-teal-600">
                {blogToEdit ? "Editar Blog" : "Añadir Nuevo Blog"}
              </h2>
              <button
                type="button"
                onClick={onClose ? onClose : closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form
              encType="multipart/form-data"
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              noValidate
            >
              {/* TITULO */}
              <div className="form-input">
                <label className="font-medium">Título para web*</label>
                <input
                  type="text"
                  {...register("titulo")}
                  // value={formData.titulo}
                  // onChange={handleChange}
                  // maxLength={LENGTHS.titulo}
                  // required
                  className={` ${errors.titulo ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.titulo && (
                  <p className="text-red-500 text-sm">
                    {errors.titulo.message}
                  </p>
                )}
              </div>

              {/* LINK */}

              <div className="form-input">
                <label className="font-medium">Link*</label>
                <input
                  type="text"
                  // name="link"
                  // value={formData.link}
                  // onChange={handleChange}

                  // maxLength={LENGTHS.titulo}
                  // required

                  {...register("link")}
                  className={`${errors.link ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.link && (
                  <p className="text-red-500 text-sm">{errors.link.message}</p>
                )}
              </div>

              {/* Meta Titulo */}
              <div className="form-input">
                <label className="font-medium">Meta título</label>
                <input
                  type="text"
                  {...register("etiqueta.meta_titulo")}

                  // name="meta_titulo"
                  // value={formData.etiqueta.meta_titulo}
                  // onChange={(e) =>
                  //   setFormData({
                  //     ...formData,
                  //     etiqueta: {
                  //       ...formData.etiqueta,
                  //       meta_titulo: e.target.value.slice(
                  //         0,
                  //         LENGTHS.metaTitulo,
                  //       ),
                  //     },
                  //   })
                  // }
                  // maxLength={LENGTHS.metaTitulo}
                />
                <small className="text-gray-500">
                  Sugerido {LENGTHS.metaTitulo} caracteres
                </small>
              </div>

              <div className="form-input">
                <label className="font-medium">Meta descripción</label>
                <input
                  type="text"
                  {...register("etiqueta.meta_descripcion")}
                  // name="meta_descripcion"
                  // value={formData.etiqueta.meta_descripcion}
                  // onChange={(e) =>
                  //   setFormData({
                  //     ...formData,
                  //     etiqueta: {
                  //       ...formData.etiqueta,
                  //       meta_descripcion: e.target.value.slice(
                  //         0,
                  //         LENGTHS.metaDescripcion,
                  //       ),
                  //     },
                  //   })
                  // }
                  maxLength={LENGTHS.metaDescripcion}
                />
                <small className="text-gray-500">
                  Sugerido {LENGTHS.metaDescripcion} caracteres
                </small>
              </div>
              {/* SUBTITULO 1 */}
              <div className="form-input">
                <label className="font-medium">
                  Párrafo corto (100 palabras)*
                </label>
                <textarea
                  // name="subtitulo1"
                  {...register("subtitulo1")}
                  className={` ${errors.subtitulo1 ? "border-red-500" : "border-gray-300"}`}
                  // value={formData.subtitulo1}
                  // onChange={handleChange}
                  // maxLength={LENGTHS.parrafo}
                  // required
                  rows={3}
                />
                {/* <small className="text-gray-500 text-end block">
                  {contarPalabras(formData.subtitulo1)} palabras (Máx{" "}
                  {LENGTHS.parrafo})
                </small> */}
                {errors.subtitulo1 && (
                  <p className="text-red-500 text-sm">
                    {errors.subtitulo1.message}
                  </p>
                )}
              </div>

              <div className="form-input">
                <label className="font-medium">
                  Descripción (255 palabras)*
                </label>
                <textarea
                  // name="subtitulo2"
                  {...register("subtitulo2")}
                  className={` ${errors.subtitulo2 ? "border-red-500" : "border-gray-300"}`}
                  // value={formData.subtitulo2}
                  // onChange={handleChange}
                  // maxLength={LENGTHS.descripcion}
                  // required
                  rows={3}
                />
                {/* <small className="text-gray-500 text-end block">
                  {contarPalabras(formData.subtitulo2)} palabras (Máx{" "}
                  {LENGTHS.descripcion})
                </small> */}
                {errors.subtitulo2 && (
                  <p className="text-red-500 text-sm">
                    {errors.subtitulo2.message}
                  </p>
                )}
              </div>

              {/* VIDEO TITULO */}
              <div className="form-input">
                <label className="font-medium">
                  Título del video para YouTube*
                </label>
                <input
                  type="text"
                  // name="video_titulo"
                  {...register("video_titulo")}
                  className={`${errors.video_titulo ? "border-red-500" : "border-gray-300"}`}
                  // value={formData.video_titulo}
                  // onChange={handleChange}
                  // maxLength={LENGTHS.videoTitulo}
                  // required
                />
                {errors.video_titulo && (
                  <p className="text-red-500 text-sm">
                    {errors.video_titulo.message}
                  </p>
                )}
              </div>

              {/* Video URL */}
              <div className="form-input">
                <label className="font-medium">URL del video*</label>
                <input
                  type="text"
                  {...register("video_url")}
                  className={`${errors.video_url ? "border-red-500" : "border-gray-300"}`}
                  // name="video_url"
                  // value={formData.video_url}
                  // onChange={handleChange}
                  // maxLength={LENGTHS.videoUrl}
                  // required
                />
                {errors.video_url && (
                  <p className="text-red-500 text-sm">
                    {errors.video_url.message}
                  </p>
                )}
              </div>

              {/* PRODUCTO */}
              <div className="form-input">
                <label className="font-medium">Relacionar con producto*</label>
                <select
                  // name="producto_id"
                  // value={formData.producto_id}
                  // onChange={handleChange}
                  // required
                  {...register("producto_id")}
                  className={`${errors.producto_id ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto: any) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
                {errors.producto_id && (
                  <p className="text-red-500 text-sm">
                    {errors.producto_id.message}
                  </p>
                )}
              </div>

              <div className="form-input">
                <label className="font-medium block mb-2">
                  Miniatura del Blog*
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("miniatura")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("miniatura", file);
                  }}
                  // onChange={handleFileChange}
                  className="hidden"
                  id="miniatura-upload"
                />
                <label
                  htmlFor="miniatura-upload"
                  className="cursor-pointer flex flex-col items-center border-2 border-dashed border-teal-300 dark:border-teal-600 p-4 rounded-lg  text-center hover:bg-teal-50 transition relative overflow-hidden dark:hover:bg-gray-700"
                >
                  {/* {(watch("miniatura") as File) ? (
                    <span className="text-teal-600 font-medium">
                      {(watch("miniatura") as File).name || "Imagen cargada"}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Click para subir miniatura
                    </span>
                  )} */}
                  {watch("miniatura") ? (
                    <img
                      src={miniPreview}
                      alt="Miniatura preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : blogToEdit?.miniatura ? (
                    <img
                      src={
                        blogToEdit.miniatura.startsWith("http")
                          ? blogToEdit.miniatura
                          : `${import.meta.env.PUBLIC_API_URL}${blogToEdit.miniatura}`
                      }
                      alt="Miniatura actual"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      Click para subir miniatura
                    </span>
                  )}
                </label>
                {errors.miniatura && (
                  <p className="text-red-500 text-sm">
                    {errors.miniatura.message}
                  </p>
                )}
              </div>

              {/* CONTENIDO DEL BLOG */}
              <div className="col-span-1 md:col-span-2 mt-4">
                <h3 className="text-xl font-bold text-teal-600 mb-4">
                  Contenido del Blog
                </h3>

                {fields.map((field, index) => {
                  const imagen = watch(
                    `imagenes.${index}`,
                  ) as BlogFormData["imagenes"][number];
                  return (
                    <div
                      key={field.id}
                      className="mb-6 p-4  border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-teal-700">
                          Sección {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Eliminar sección
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-400">
                            Imagen*
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileChangeAdicional(e, index)
                            }
                            className="hidden"
                            id={`imagen-seccion-${index}`}
                          />

                          <label
                            htmlFor={`imagen-seccion-${index}`}
                            className="cursor-pointer border-2 border-dashed border-teal-300 dark:border-teal-600 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-teal-50 dark:hover:bg-gray-700 transition"
                          >
                            {imagen?.imagen ? (
                              <span className="text-teal-600 font-medium">
                                {imagen.imagen.name}
                              </span>
                            ) : imagen.url ? (
                              <span className="text-teal-600 font-medium">
                                Imagen Cargada
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                Click para subir imagen
                              </span>
                            )}
                          </label>
                          {errors.imagenes?.[index]?.imagen && (
                            <p className="text-red-500 text-xs">
                              {errors.imagenes[index]?.imagen?.message}
                            </p>
                          )}

                          <div className="mt-3 flex justify-center">
                            {imagen?.imagen ? (
                              <div className="flex flex-col items-center">
                                <img
                                  src={URL.createObjectURL(imagen.imagen)}
                                  alt={`Seccion ${index + 1}`}
                                  className="w-28 h-28 object-cover rounded-xl shadow-md"
                                />
                                <span className="text-xs text-gray-500 mt-2">
                                  {imagen.imagen.name}
                                </span>
                              </div>
                            ) : imagen.url ? (
                              <div className="flex flex-col items-center">
                                <img
                                  src={imagen.url}
                                  alt={`Seccion ${index + 1}`}
                                  className="w-28 h-28 object-cover rounded-xl shadow-md"
                                />
                                <span className="text-xs text-gray-500 mt-2">
                                  Imagen cargada
                                </span>
                              </div>
                            ) : (
                              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-400 text-center px-2">
                                  Sin imagen
                                </span>
                              </div>
                            )}
                          </div>

                          {/* <div className="mt-2">
                            {imagen?.imagen ? (
                              <img
                                src={URL.createObjectURL(imagen.imagen)}
                                alt={`Seccion ${index + 1}`}
                                className="w-28 h-28 object-cover rounded-xl shadow-md"
                              />
                            ) : imagen.url ? (
                              <img
                                src={imagen.url}
                                alt=""
                                className="w-24 h-24 object-cover rounded"
                              />
                            ) : null}
                          </div> */}
                          <div className="mt-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1 dark:text-gray-400">
                              Texto Alternativo (SEO)*
                            </label>
                            <input
                              type="text"
                              // value={imagen.text_alt}
                              // onChange={(e) => handleAltTextChange(e, index)}
                              {...register(`imagenes.${index}.text_alt`)}
                              placeholder="Descripción de la imagen"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E2939] dark:text-gray-100 rounded-lg  p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                              required
                            />
                          </div>
                          {/* <div className="mt-2">
                            {imagen?.imagen ? (
                              <img
                                src={URL.createObjectURL(imagen.imagen)}
                                alt={`Sección ${index + 1}`}
                                className="w-20 h-20 object-cover rounded"
                              />
                            ) : imagen?.url ? (
                              <img
                                src={imagen.url}
                                className="w-20 h-20 object-cover rounded"
                                alt=""
                              />
                            ) : null}
                          </div> */}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-400">
                              Párrafo de la sección*
                            </label>
                            <div className="space-x-2">
                              <button
                                type="button"
                                onClick={() => handleInsertLinkClick(index)}
                                className="text-xs text-teal-600 hover:text-teal-800 underline"
                              >
                                Insertar Link
                              </button>
                              <button
                                type="button"
                                onClick={() => handleProductLinkClick(index)}
                                className="text-xs text-teal-600 hover:text-teal-800 underline"
                              >
                                Link Producto
                              </button>
                            </div>
                          </div>
                          <textarea
                            id={`crear_descripcion_antes_${index}`}
                            {...register(`imagenes.${index}.parrafo`)}
                            // value={imagen.parrafo}
                            // onChange={(e) => handleParrafoChange(e, index)}
                            className="w-full resize-none border border-gray-300 bg-white dark:border-gray-600 dark:bg-[#1E2939] text-gray-900 dark:text-gray-100  rounded p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            rows={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4">
                  <button
                    className="px-4 py-2 bg-teal-600 text-white rounded-2xl flex gap-2 justify-center hover:bg-teal-700 items-center"
                    type="button"
                    onClick={() =>
                      append({
                        imagen: undefined,
                        url: "",
                        parrafo: "",
                        text_alt: "",
                      })
                    }
                  >
                    + Añadir sección
                  </button>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={onClose ? onClose : closeModal}
                  className="px-6 py-2 border rounded-full text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (blogToEdit && !isChanged)}
                  // disabled={isSaving || isSubmitting}
                  className="px-8 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:bg-gray-400 shadow-lg"
                >
                  {/* {isSaving || isSubmitting ? "Guardando..." : "Guardar Blog"} */}
                  {loading ? "Guardando..." : "Crear Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {linking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">
              {linking.type === "manual"
                ? "Insertar Enlace"
                : "Enlace a Producto"}
            </h3>

            {linking.type === "manual" && (
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full border p-2 rounded mb-4"
              />
            )}

            {linking.type === "producto" && (
              <p className="text-sm text-gray-600 mb-4">
                Se enlazará texto: <strong>{linking.text}</strong>
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLinking(null)}
                className="px-4 py-2 text-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleLinkInsert(
                    linking.type === "manual"
                      ? link
                      : `/productos/detalle?link=${getValues("producto_id")}`,
                  )
                }
                className="px-4 py-2 bg-teal-600 text-white rounded"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .dialog-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 999;
          padding: 20px;
        }
        .dialog {
          background: #fff;
          width: 100%;
          max-width: 900px;
          padding: 30px;
          border-radius: 20px;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .form-input {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .form-input input, .form-input select, .form-input textarea {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input input:focus, .form-input select:focus, .form-input textarea:focus {
          border-color: #0d9488;
        }
      `,
        }}
      />
    </>
  );
};

export default AddBlogModal;
