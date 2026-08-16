import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wheat, TriangleAlert } from 'lucide-react';
import api from '../api/axios';
import InsumoFormModal from '../components/InsumoFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  function cargarInsumos() {
    setCargando(true);
    api.get('/insumos')
      .then((res) => setInsumos(res.data))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarInsumos();
  }, []);

  async function confirmarEliminar() {
    await api.delete(`/insumos/${aEliminar}`);
    setAEliminar(null);
    cargarInsumos();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-900">Insumos</h2>
          <p className="text-tinta-600 mt-1">Tu materia prima e inventario.</p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-frambuesa-500 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-frambuesa-600 transition"
        >
          <Plus size={18} />
          Nuevo insumo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-tinta-300/20 overflow-hidden">
        {cargando ? (
          <p className="text-center text-tinta-300 py-16">Cargando...</p>
        ) : insumos.length === 0 ? (
          <div className="text-center py-16">
            <Wheat className="mx-auto text-tinta-300" size={40} />
            <p className="text-tinta-600 mt-3">Todavía no tienes insumos.</p>
            <button
              onClick={() => setModal('nuevo')}
              className="text-frambuesa-600 font-medium text-sm mt-2 hover:underline"
            >
              Crea el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tinta-300/20 text-left text-tinta-600">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Stock actual</th>
                  <th className="px-6 py-3 font-medium">Stock mínimo</th>
                  <th className="px-6 py-3 font-medium">Costo unitario</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((i) => (
                  <tr key={i.id} className="border-b border-tinta-300/10 last:border-0">
                    <td className="px-6 py-3 font-medium text-tinta-900">{i.nombre}</td>
                    <td className="px-6 py-3 text-tinta-900 tabular-nums">
                      {i.cantidadActual} {i.unidadMedida}
                    </td>
                    <td className="px-6 py-3 text-tinta-600 tabular-nums">
                      {i.stockMinimo} {i.unidadMedida}
                    </td>
                    <td className="px-6 py-3 text-tinta-900 tabular-nums">
                      {formatoMoneda.format(i.costoUnitario)}
                    </td>
                    <td className="px-6 py-3">
                      {i.alertaStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-frambuesa-50 text-frambuesa-600">
                          <TriangleAlert size={12} />
                          Stock bajo
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-lima-500/10 text-lima-500">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setModal(i)}
                          className="text-tinta-600 hover:text-frambuesa-600 transition p-1"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setAEliminar(i.id)}
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
          </div>
        )}
      </div>

      {modal && (
        <InsumoFormModal
          insumo={modal === 'nuevo' ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            cargarInsumos();
          }}
        />
      )}

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar insumo"
        mensaje="Esta acción no se puede deshacer. El insumo dejará de estar disponible para tus recetas."
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}