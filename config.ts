export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    environment: import.meta.env.MODE || 'development',
    endpoints: {
        auth: {
          login: '/api/v1/auth/login',
          logout: '/api/v1/auth/logout',
        },
        users: {
          list: '/api/v1/users',
          detail: (id: number | string) => `/api/v1/users/${id}`,
          create: '/api/v1/users',
          update: (id: number | string) => `/api/v1/users/${id}`,
          delete: (id: number | string) => `/api/v1/users/${id}`,
        },
        clientes: {
          list: '/api/v1/clientes',
          detail: (id: number | string) => `/api/v1/clientes/${id}`,
          create: '/api/v1/clientes',
          update: (id: number | string) => `/api/v1/clientes/${id}`,
          delete: (id: number | string) => `/api/v1/clientes/${id}`,
        },
        productos: {
          list: '/api/v1/productos',
          detail: (id: number | string) => `/api/v1/productos/${id}`,
          create: '/api/v1/productos',
          update: (id: number | string) => `/api/v1/productos/${id}`,
          delete: (id: number | string) => `/api/v1/productos/${id}`,
        },
        blogs: {
          list: '/api/v1/blogs',
          detail: (id: number | string) => `/api/v1/blogs/${id}`,
          create: '/api/v1/blogs',
          update: (id: number | string) => `/api/v1/blogs/${id}`,
          delete: (id: number | string) => `/api/v1/blogs/${id}`,
        },
      }
  };
  
  export const getApiUrl = (endpoint: string) => {
    const url = `${config.apiUrl}${endpoint}`;
    console.log(`[${config.environment}] Requesting:`, url);
    return url;
  };
  