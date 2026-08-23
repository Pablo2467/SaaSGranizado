import { useEffect, useState } from 'react';
import { Plus, Eye, ClipboardList } from 'lucide-react';
import api from '../api/axios';
import PedidoFormModal from '../components/PedidoFormModal';
import PedidoDetalleModal from '../components/PedidoDetalleModal';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const estiloEstado = {
  PENDIENTE: 'bg-mango-400/10 text-mango-400',
  CONFIRMADO: 'bg-lima-500/10 text-lima-500',
  EN_PREPARACION: 'bg-frambuesa-50 text-frambuesa-600',
  ENTREGADO: 'bg-lima-500/10 text-lima-500',
  CANCELADO: 'bg-tinta-300/20 text-tinta-600',
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [detalle, setDetalle] = useState(null);

  function cargarPedidos() {
    setCargando(true);
    api.get('/pedidos')
      .then((res) => setPedidos(res.data))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarPedidos();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-900">Pedidos</h2>
          <p className="text-tinta-600 mt-1">Lo que has vendido.</p>
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center gap-2 bg-frambuesa-500 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-frambuesa-600 transition"
        >
          <Plus size={18} />
          Nuevo pedido
        </button>
      </div>

      <div className="bg-white rounded-xl border border-tinta-300/20 overflow-hidden">
        {cargando ? (
          <p className="text-center text-tinta-300 py-16">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="mx-auto text-tinta-300" size={40} />
            <p className="text-tinta-600 mt-3">Todavía no tienes pedidos.</p>
            <button
              onClick={() => setModalNuevo(true)}
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
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Canal</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className="border-b border-tinta-300/10 last:border-0">
                    <td className="px-6 py-3 font-medium text-tinta-900">
                      {p.nombreCliente || 'Sin nombre'}
                    </td>
                    <td className="px-6 py-3 text-tinta-600">{p.canal}</td>
                    <td className="px-6 py-3 text-tinta-900 tabular-nums">
                      {formatoMoneda.format(p.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${estiloEstado[p.estado] ?? ''}`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-tinta-600">
                      {new Date(p.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setDetalle(p)}
                          className="text-tinta-600 hover:text-frambuesa-600 transition p-1"
                        >
                          <Eye size={16} />
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

      {modalNuevo && (
        <PedidoFormModal
          onClose={() => setModalNuevo(false)}
          onGuardado={() => {
            setModalNuevo(false);
            cargarPedidos();
          }}
        />
      )}

      {detalle && <PedidoDetalleModal pedido={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}