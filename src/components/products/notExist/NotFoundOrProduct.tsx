import ProductPage from "../ProductPage";

const isProductRoute = () =>
  /^\/catalogo-maquinarias\/[^/]+\/?$/.test(window.location.pathname);


const customStyles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

export default function NotFoundOrProduct() {
  if (isProductRoute()) return <ProductPage />;

  return (
    <section className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50 relative overflow-hidden px-4 pt-24 pb-20">

      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Blobs de fondo decorativos */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center py-12">
        {/* Huge Animated 404 Text */}
        <h1 className="text-[6rem] md:text-[9rem] font-black text-teal-700 leading-none drop-shadow-lg select-none mb-6">
          404
        </h1>

        {/* Glassmorphism Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/60 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4 font-montserrat">
            Página no encontrada
          </h2>

          <p className="text-gray-600 mb-8 text-lg">
            Parece que te has perdido. La página que buscas no existe, ha sido
            movida o está temporalmente inhabilitada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-700 text-white rounded-xl font-bold text-lg hover:bg-[#097b6f] hover:shadow-lg transition-all duration-300 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al Inicio
            </a>

            <a
              href="/catalogo-maquinarias"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-teal-700 text-teal-700 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300"
            >
              Ver Productos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}