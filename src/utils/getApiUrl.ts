// Utilidad para construir la URL de imagen de producto
export function getApiImageUrl(path: string, apiUrl: string): string {
  if (!path) return "";
  if (typeof path === "string" && !path.startsWith("http")) {
    return `${apiUrl}${path}`;
  }
  return path;
}
