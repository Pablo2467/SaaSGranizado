import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, IceCreamCone } from 'lucide-react';
import api from '../api/axios';
import ProductoFormModal from '../components/ProductoFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nuevo' | producto a editar
  const [aEliminar, setAEliminar] = useState(null); // id del producto a borrar

  function cargarProductos() {
    setCargando(true);
    api.get('/productos')
      .then((res) => setProductos(res.data))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function confirmarEliminar() {
    await api.delete(`/productos/${aEliminar}`);
    setAEliminar(null);
    cargarProductos();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-900">Productos</h2>
          <p className="text-tinta-600 mt-1">Lo que vendes en tu granizadero.</p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-frambuesa-500 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-frambuesa-600 transition"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-tinta-300/20 overflow-hidden">
        {cargando ? (
          <p className="text-center text-tinta-300 py-16">Cargando...</p>
        ) : productos.length === 0 ? (
          <div className="text-center py-16">
            <IceCreamCone className="mx-auto text-tinta-300" size={40} />
            <p className="text-tinta-600 mt-3">Todavía no tienes productos.</p>
            <button
              onClick={() => setModal('nuevo')}
              className="text-frambuesa-600 font-medium text-sm mt-2 hover:underline"
            >
              Crea el primero
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tinta-300/20 text-left text-tinta-600">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Categoría</th>
                <th className="px-6 py-3 font-medium">Precio</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-tinta-300/10 last:border-0">
                  <td className="px-6 py-3 font-medium text-tinta-900">{p.nombre}</td>
                  <td className="px-6 py-3 text-tinta-600">{p.categoria}</td>
                  <td className="px-6 py-3 text-tinta-900 tabular-nums">
                    {formatoPrecio.format(p.precio)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.disponible
                          ? 'bg-lima-500/10 text-lima-500'
                          : 'bg-tinta-300/20 text-tinta-600'
                      }`}
                    >
                      {p.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModal(p)}
                        className="text-tinta-600 hover:text-frambuesa-600 transition p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setAEliminar(p.id)}
                        className="text-tinta-600 hover:text-frambuesa-600 transition p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}