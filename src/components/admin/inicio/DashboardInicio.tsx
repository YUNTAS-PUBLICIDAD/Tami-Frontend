import React, { useEffect, useState } from 'react';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getProducts } from 'src/hooks/admin/productos/productos';
import useClientes from 'src/hooks/admin/seguimiento/useClientes';
import { config, getApiUrl } from 'config';

const data = [
  { name: 'Inicio', visitas: 1200 },
  { name: 'Productos', visitas: 900 },
  { name: 'Blog', visitas: 700 },
  { name: 'Nosotros', visitas: 500 },
  { name: 'Contacto', visitas: 300 },
];

const clientesRecientes = [
  { id: 1, name: 'Dayana Karim', email: 'dayandao2203@gmail.com', color: 'bg-blue-500' },
  { id: 2, name: 'hylari', email: 'hilarydamian3@gmail.com', color: 'bg-green-500' },
  { id: 3, name: 'Joaquin', email: 'joaquinpm178@gmail.com', color: 'bg-purple-500' },
  { id: 4, name: 'Alisson Torres', email: 'alissontorres1606@gmail.com', color: 'bg-yellow-500' },
  { id: 5, name: 'jukalii', email: 'ventasneonhouse@gmail.com', color: 'bg-pink-500' },
];

const DashboardInicio: React.FC = () => {
  const [totalProductos, setTotalProductos] = useState<number>(0);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);


  const { clientes, loading: loadingClientes } = useClientes(false);

  useEffect(() => {
    getProducts()
      .then((data) => {
        if (data) setTotalProductos(data.length);
      })
      .finally(() => setLoadingProductos(false));
  }, []);

  useEffect(() => {
    fetch(getApiUrl(config.endpoints.blogs.list))
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result?.data)) {
          setTotalBlogs(result.data.length);
        }
      })
      .finally(() => setLoadingBlogs(false));
  }, []);

  const isLoading = loadingProductos || loadingBlogs || loadingClientes;

  return (
    <div className="w-full">
  
      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-1 font-medium">
          Administración <span className="mx-1 font-normal">&gt;</span>{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">General</span>
        </p>
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white">General</h1>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
          <div className="bg-[#4b7bec] text-white p-4 rounded-2xl flex-shrink-0 shadow-sm">
            <Users size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-400 text-sm font-medium mb-1">Total de clientes</p>
            <p className="text-3xl font-bold text-[#1e293b] dark:text-white">
              {loadingClientes ? '...' : clientes.length}
            </p>
          </div>
        </div>

        {/* Card productos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
          <div className="bg-[#e5fcf5] text-[#20bf6b] dark:bg-green-900/30 dark:text-green-400 p-4 rounded-2xl flex-shrink-0">
            <Package size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-400 text-sm font-medium mb-1">Total de productos</p>
            <p className="text-3xl font-bold text-[#1e293b] dark:text-white">
              {loadingProductos ? '...' : totalProductos}
            </p>
          </div>
        </div>

        {/* Card blogs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5">
          <div className="bg-[#f3e8ff] text-[#a55eea] dark:bg-purple-900/30 dark:text-purple-400 p-4 rounded-2xl flex-shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-400 text-sm font-medium mb-1">Total de blogs</p>
            <p className="text-3xl font-bold text-[#1e293b] dark:text-white">
              {loadingBlogs ? '...' : totalBlogs}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h2 className="text-[17px] font-semibold text-[#1e293b] dark:text-white">Páginas más vistas</h2>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} ticks={[0, 300, 600, 900, 1200]} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="visitas" stroke="#a855f7" strokeWidth={3}
                  dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-[17px] font-semibold text-[#1e293b] dark:text-white">Clientes recientes</h2>
            </div>
            <button className="bg-[#1e293b] hover:bg-slate-800 text-white text-[13px] font-medium py-1.5 px-4 rounded-lg transition-colors">
              Ver todos
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {clientesRecientes.map((cliente) => (
              <div key={cliente.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${cliente.color}`}>
                  {cliente.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[14px] font-semibold text-[#1e293b] dark:text-white truncate">{cliente.name}</p>
                  <p className="text-[13px] text-gray-400 dark:text-gray-400 truncate">{cliente.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInicio;