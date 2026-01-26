/**
 * @abstract Config file
 * @description Este archivo contiene la configuración de la aplicación.
 * para esto, se ha creado un objeto config que contiene la url de la api y los endpoints.
 * Los endpoints estan divididos por secciones, como auth, users, clientes, productos y blogs.
 **/
export const config = {
  apiUrl: import.meta.env.PUBLIC_API_URL, // URL de la API
  environment: import.meta.env.MODE || "development", // Entorno de la aplicación, por defecto development
  endpoints: {
    auth: {
      // Endpoints de autenticación
      login: "/api/v1/auth/login",
      logout: "/api/v1/auth/logout",
    },
    users: {
      // Endpoints de usuarios
      list: "/api/v1/users",
      detail: (id: number | string) => `/api/v1/users/${id}`,
      create: "/api/v1/users",
      update: (id: number | string) => `/api/v1/users/${id}`,
      delete: (id: number | string) => `/api/v1/users/${id}`,
    },
    clientes: {
      // Endpoints de clientes
      list: "/api/v1/clientes",
      detail: (id: number | string) => `/api/v1/clientes/${id}`,
      create: "/api/v1/clientes",
      update: (id: number | string) => `/api/v1/clientes/${id}`,
      delete: (id: number | string) => `/api/v1/clientes/${id}`,
    },
    productos: {
      // Endpoints de productos
      // Cambiar a v2 cuando sea necesario
      list: "/api/v1/productos",
      all: "/api/v1/productos/all", // Endpoint específico para productos tipo 'a'
      detail: (id: number | string) => `/api/v1/productos/${id}`,
      create: "/api/v1/productos",
      update: (id: number | string) => `/api/v1/productos/${id}`,
      delete: (id: number | string) => `/api/v1/productos/${id}`,
    },
    blogs: {
      // Endpoints de blogs
      list: "/api/v1/blogs",
      detail: (id: number | string) => `/api/v1/blogs/${id}`,
      create: "/api/v1/blogs",
      update: (id: number | string) => `/api/v1/blogs/${id}`,
      delete: (id: number | string) => `/api/v1/blogs/${id}`,
    },
    email: {
      //Endpoints de emails
      sendEmailByProductLink: "/api/v1/emails/product-link",
    },
    whatsapp: {
      //Endpoints de whatsapp
      info: "/api/v1/whatsapp/solicitar-info-producto",
      requestQR: "/api/v1/whatsapp/request-qr",
      resetSession: "/api/v1/whatsapp/reset",
    },
  },
  socket: {
    whatsapp: import.meta.env.PUBLIC_WHATSAPP_SOCKET_URL || "https://apitami.tamimaquinarias.com",
  }
};

export const getApiUrl = (endpoint: string) => {
  const url = `${config.apiUrl}${endpoint}`;
  console.log(`[${config.environment}] Requesting:`, url);
  return url;
};
