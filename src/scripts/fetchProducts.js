import { config } from "config";
import { showLoader, removeLoader } from "src/utils/loader";

const getApiUrl = config.apiUrl;
const productosUrl = config.endpoints.productos.list;

export async function fetchProductDetails() {
    showLoader();

    const params = new URLSearchParams(window.location.search);
    const idProduct = params.get("id")?.trim();
    if (!idProduct) return;

    try {
        const response = await fetch(`${getApiUrl}${productosUrl}/${idProduct}`);

        if (!response.ok) {
            removeLoader();
            displayError(response.status, response.statusText);
            return;
        }

        const data = await response.json();
        const product = data.data;

        updateProductDetails(product);
        updateProductImages(product.images);
        updateProductSpecs(product.specs);
        updateProductDimensions(product.dimensions);
        updateRelatedProducts(product.relatedProducts);

        removeLoader();
    } catch (error) {
        console.error("Error fetching product:", error);
        displayError("Error", error.message);
    }
}

// Muestra un mensaje de error en la pantalla
function displayError(status, message) {
    const container = document.createElement("div");
    container.className = "fixed z-50 inset-0 text-center bg-gradient-to-b from-teal-700 to-teal-400 flex items-center justify-center";

    const errorMessage = document.createElement("p");
    errorMessage.className = "text-white font-extrabold text-5xl";
    errorMessage.textContent = `Error ${status}: ${message} Producto no encontrado`;

    container.appendChild(errorMessage);
    document.body.appendChild(container);
}

// Actualiza los detalles del producto en la página
function updateProductDetails(product) {
    document.getElementById("product-title").textContent = product.title;
    document.getElementById("product-subtitle").textContent = product.subtitle;
    document.getElementById("product-img").src = product.image;
    document.getElementById("product-viewer").src = product.images[0];
}

// Muestra la galería de imágenes del producto
function updateProductImages(images) {
    const imagesList = document.getElementById("images-list");
    if (!imagesList) return;

    images.slice(0, 4).forEach((image, index) => {
        const alt = `Thumbnail ${index + 1}`;
        const div = document.createElement("div");
        div.className = "aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-in-out";

        const img = document.createElement("img");
        img.src = image;
        img.alt = alt;
        img.className = "w-full h-full object-cover";

        div.appendChild(img);
        imagesList.appendChild(div);

        div.onclick = () => {
            document.getElementById("product-viewer").src = image;
        };
    });
}

// Muestra las especificaciones del producto
function updateProductSpecs(specs) {
    const specsList = document.getElementById("specs-list");
    if (!specsList) return;

    specsList.innerHTML = "";
    Object.entries(specs).forEach(([key, value]) => {
        const li = document.createElement("li");
        li.textContent = `${key}: ${value}`;
        specsList.appendChild(li);
    });
}

// Muestra las dimensiones del producto
function updateProductDimensions(dimensions) {
    const productDimension = document.getElementById("product-dimensions");
    if (!productDimension) return;

    productDimension.innerHTML = "";
    Object.entries(dimensions).forEach(([key, value]) => {
        const li = document.createElement("li");
        li.className = "flex items-center gap-2";

        const span = document.createElement("span");
        span.className = "w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold";
        span.textContent = key.charAt(0).toUpperCase();

        const text = document.createTextNode(`${key}: ${value}`);

        li.appendChild(span);
        li.appendChild(text);
        productDimension.appendChild(li);
    });
}

// Muestra los productos relacionados
async function updateRelatedProducts(relatedProductIds) {
    const relatedProductsContainer = document.getElementById("related-products-container");
    if (!relatedProductsContainer) return;

    relatedProductsContainer.innerHTML = "";

    const relatedProducts = await Promise.all(
        relatedProductIds.map(async (id) => {
            const res = await fetch(`${getApiUrl}${productosUrl}/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.data;
        })
    ).then((results) => results.filter((p) => p !== null));

    relatedProducts.forEach((prod) => {
        const a = document.createElement("a");
        a.href = `/products/details?id=${prod.id}`;
        a.className = "group cursor-pointer";

        const div = document.createElement("div");
        div.className = "aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2";

        const img = document.createElement("img");
        img.src = prod.image;
        img.alt = prod.title;
        img.className = "w-full h-full object-cover group-hover:scale-105 transition";

        const h3 = document.createElement("h3");
        h3.className = "text-center font-bold text-xs md:text-sm";
        h3.textContent = prod.title;

        div.appendChild(img);
        a.appendChild(div);
        a.appendChild(h3);

        relatedProductsContainer.appendChild(a);
    });
}