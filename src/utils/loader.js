export function showLoader() {
    const loader = document.createElement("div");
    loader.id = "page-loader";
    loader.className =
        "fixed inset-0 z-50 flex items-center justify-center bg-white";
    loader.innerHTML = `
    <div class="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
  `;
    document.body.appendChild(loader);
}
export const showLoaderString = `
  function showLoader() {
    const loader = document.createElement("div");
    loader.id = "page-loader";
    loader.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-white";
    loader.innerHTML = \`
      <div class="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    \`;
    document.body.appendChild(loader);
  }
`;

// Función para eliminar el loader
export function removeLoader() {
    const loader = document.getElementById("page-loader");
    if (loader) loader.remove();
}
export const removeLoaderString = `
  function removeLoader() {
    const loader = document.getElementById("page-loader");
    if (loader) loader.remove();
  }
`;