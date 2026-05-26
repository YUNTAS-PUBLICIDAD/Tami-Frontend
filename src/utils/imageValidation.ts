import Swal from "sweetalert2";

type ImageRule = "basic" | "miniatura" | "webpOnly";

const RULES: Record<ImageRule, { types: string[]; maxSizeMB: number }> = {
  basic: {
    types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxSizeMB: 2,
  },
  miniatura: {
    types: ["image/webp", "image/gif"],
    maxSizeMB: 2,
  },
  webpOnly: {
    types: ["image/webp"],
    maxSizeMB: 2,
  },
};

export const validateImage = (
  file: File | null | undefined,
  rule: ImageRule = "basic"
): boolean => {
  if (!file) return false;

  const config = RULES[rule];

  // validar tipo
  if (!config.types.includes(file.type)) {
    Swal.fire({
      icon: "error",
      title: "Formato inválido",
      text:
        rule === "miniatura"
          ? "Solo WEBP o GIF."
          : rule === "webpOnly"
          ? "Solo formato WEBP y máximo 2 MB"
          : "Solo JPG, PNG o WEBP.",
      confirmButtonColor: "#0f766e",
    });
    return false;
  }

  // validar tamaño
  if (file.size > config.maxSizeMB * 1024 * 1024) {
    Swal.fire({
      icon: "warning",
      title: rule === "webpOnly" ? "Imagen demasiado grande" : "Archivo demasiado grande",
      text: rule === "webpOnly" 
        ? "Solo formato WEBP y máximo 2 MB"
        : `Máximo ${config.maxSizeMB}MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      confirmButtonColor: "#0f766e",
    });
    return false;
  }

  return true;
};