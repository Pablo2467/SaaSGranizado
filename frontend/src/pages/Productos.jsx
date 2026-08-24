import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, IceCreamCone, Search, Tag } from 'lucide-react';
import api from '../api/axios';
import ProductoFormModal from '../components/ProductoFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const PALETA_CATEGORIAS = [
  'bg-azul-500/12 text-azul-300 border-azul-500/25',
  'bg-cian-500/12 text-cian-400 border-cian-500/25',
  'bg-mango-400/12 text-mango-400 border-mango-400/25',
  'bg-lima-500/12 text-lima-400 border-lima-500/25',
  'bg-frambuesa-500/12 text-frambuesa-500 border-frambuesa-500/25',
];

function colorParaCategoria(categoria) {
  if (!categoria) return PALETA_CATEGORIAS[0];
  let hash = 0;
  for (let i = 0; i < categoria.length; i++) hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
  return PALETA_CATEGORIAS[Math.abs(hash) % PALETA_CATEGORIAS.length];
}

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nuevo' | producto a editar
  const [aEliminar, setAEliminar] = useState(null); // id del producto a borrar
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  function cargarProductos() {
    setCargando(true);
    api.get('/productos')
      .then((res) => setProductos(res.data))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function confirmarEliminar() {
    setError('');
    try {
      await api.delete(`/productos/${aEliminar}`);
      setAEliminar(null);
      cargarProductos();
    } catch (err) {
      setAEliminar(null);
      setError(err.response?.data?.message ?? 'No se pudo eliminar el producto.');
    }
  }

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(q) || (p.categoria ?? '').toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-100">Productos</h2>
          <p className="text-tinta-400 mt-1">Lo que vendes en tu granizadero.</p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-gradient-to-b from-azul-500 to-azul-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold
                     shadow-[0_8px_20px_-6px_rgba(47,102,240,0.7)] border border-white/10 hover:from-azul-400 hover:to-azul-600 transition"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-frambuesa-400 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-tinta-900/70 border border-tinta-700/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-tinta-700/60 bg-tinta-850/40">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto o categoría..."
              className="w-full rounded-lg border border-tinta-700 bg-tinta-950/50 pl-9 pr-3 py-2 text-sm text-tinta-100
                         placeholder:text-tinta-400/60 focus:outline-none focus:ring-2 focus:ring-azul-500/50 focus:border-transparent transition"
            />
          </div>
          <span className="text-xs text-tinta-400 whitespace-nowrap">
            {productos.length} producto{productos.length === 1 ? '' : 's'}
          </span>
        </div>

        {cargando ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-tinta-800/60 animate-shimmer" />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-azul-500/10 flex items-center justify-center">
              <IceCreamCone className="text-azul-400" size={26} />
            </div>
            <p className="text-tinta-400 mt-3">
              {productos.length === 0 ? 'Todavía no tienes productos.' : 'Sin resultados para tu búsqueda.'}
            </p>
            {productos.length === 0 && (
              <button
                onClick={() => setModal('nuevo')}
                className="text-azul-400 font-medium text-sm mt-2 hover:underline"
              >
                Crea el primero
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tinta-700/60 text-left text-tinta-400 bg-tinta-850/30">
                  <th className="px-6 py-3.5 font-medium">Producto</th>
                  <th className="px-6 py-3.5 font-medium">Categoría</th>
                  <th className="px-6 py-3.5 font-medium">Precio</th>
                  <th className="px-6 py-3.5 font-medium">Estado</th>
                  <th className="px-6 py-3.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b border-tinta-700/30 last:border-0 hover:bg-white/[0.03] transition ${
                      idx % 2 === 1 ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-azul-500/20 to-cian-500/20 flex items-center justify-center border border-azul-500/20">
                          <IceCreamCone size={16} className="text-azul-300" />
                        </div>
                        <div>
                          <p className="font-medium text-tinta-100">{p.nombre}</p>
                          {p.descripcion && <p className="text-xs text-tinta-400">{p.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      {p.categoria ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorParaCategoria(p.categoria)}`}
                        >
                          <Tag size={11} />
                          {p.categoria}
                        </span>
                      ) : (
                        <span className="text-tinta-400/60">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-tinta-100 font-semibold tabular-nums">
                      {formatoPrecio.format(p.precio)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.disponible
                            ? 'bg-lima-500/10 text-lima-400'
                            : 'bg-tinta-700/40 text-tinta-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.disponible ? 'bg-lima-400' : 'bg-tinta-400'}`} />
                        {p.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setModal(p)}
                          title="Editar producto"
                          className="text-tinta-400 hover:text-azul-400 hover:bg-azul-500/10 transition p-2 rounded-lg"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setAEliminar(p.id)}
                          title="Eliminar producto"
                          className="text-tinta-400 hover:text-frambuesa-500 hover:bg-frambuesa-500/10 transition p-2 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ProductoFormModal
          producto={modal === 'nuevo' ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            cargarProductos();
          }}
        />
      )}

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar producto"
        mensaje="Esta acción no se puede deshacer. El producto dejará de aparecer en tu catálogo."
        textoConfirmar="Sí, eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}