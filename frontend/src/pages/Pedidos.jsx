import { useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Pencil, XCircle, ClipboardList, Search, MessageCircle, Store, Globe } from 'lucide-react';
import api from '../api/axios';
import PedidoFormModal from '../components/PedidoFormModal';
import PedidoDetalleModal from '../components/PedidoDetalleModal';
import EstadoPedidoBadge from '../components/EstadoPedidoBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const ICONO_CANAL = {
  WHATSAPP: MessageCircle,
  PRESENCIAL: Store,
  WEB: Globe,
};

const ETIQUETAS_CANAL = {
  WHATSAPP: 'WhatsApp',
  PRESENCIAL: 'Presencial',
  WEB: 'Web',
};

const FILTROS_ESTADO = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDIENTE', label: 'Pendientes' },
  { id: 'CONFIRMADO', label: 'Confirmados' },
  { id: 'EN_PREPARACION', label: 'En preparación' },
  { id: 'ENTREGADO', label: 'Entregados' },
  { id: 'CANCELADO', label: 'Cancelados' },
];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nuevo' | pedido a editar
  const [detalle, setDetalle] = useState(null);
  const [aCancelar, setACancelar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [error, setError] = useState('');

  function cargarPedidos() {
    setCargando(true);
    api.get('/pedidos')
      .then((res) => setPedidos(res.data))
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function confirmarCancelar() {
    setError('');
    try {
      await api.delete(`/pedidos/${aCancelar}`);
      setACancelar(null);
      cargarPedidos();
    } catch (err) {
      setACancelar(null);
      setError(err.response?.data?.message ?? 'No se pudo cancelar el pedido.');
    }
  }

  function refrescarDetalle() {
    cargarPedidos();
    if (detalle) {
      api.get(`/pedidos/${detalle.id}`).then((res) => setDetalle(res.data));
    }
  }

  const pedidosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pedidos.filter((p) => {
      const coincideBusqueda = !q || (p.nombreCliente ?? '').toLowerCase().includes(q);
      const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }, [pedidos, busqueda, filtroEstado]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-100">Pedidos</h2>
          <p className="text-tinta-400 mt-1">Lo que has vendido. Haz clic en el estado para avanzarlo.</p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-gradient-to-b from-azul-500 to-azul-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold
                     shadow-[0_8px_20px_-6px_rgba(47,102,240,0.7)] border border-white/10 hover:from-azul-400 hover:to-azul-600 transition"
        >
          <Plus size={18} />
          Nuevo pedido
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-frambuesa-400 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-tinta-900/70 border border-tinta-700/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-tinta-700/60 bg-tinta-850/40 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente..."
              className="w-full rounded-lg border border-tinta-700 bg-tinta-950/50 pl-9 pr-3 py-2 text-sm text-tinta-100
                         placeholder:text-tinta-400/60 focus:outline-none focus:ring-2 focus:ring-azul-500/50 focus:border-transparent transition"
            />
          </div>
          <div className="flex bg-tinta-950/50 rounded-lg p-1 border border-tinta-700 overflow-x-auto">
            {FILTROS_ESTADO.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroEstado(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  filtroEstado === f.id
                    ? 'bg-azul-500 text-white shadow'
                    : 'text-tinta-400 hover:text-tinta-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-tinta-800/60 animate-shimmer" />
            ))}
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-azul-500/10 flex items-center justify-center">
              <ClipboardList className="text-azul-400" size={26} />
            </div>
            <p className="text-tinta-400 mt-3">
              {pedidos.length === 0 ? 'Todavía no tienes pedidos.' : 'Sin resultados para este filtro.'}
            </p>
            {pedidos.length === 0 && (
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
                  <th className="px-6 py-3.5 font-medium">Cliente</th>
                  <th className="px-6 py-3.5 font-medium">Canal</th>
                  <th className="px-6 py-3.5 font-medium">Total</th>
                  <th className="px-6 py-3.5 font-medium">Estado</th>
                  <th className="px-6 py-3.5 font-medium">Fecha</th>
                  <th className="px-6 py-3.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((p, idx) => {
                  const IconoCanal = ICONO_CANAL[p.canal] ?? Store;
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-tinta-700/30 last:border-0 hover:bg-white/[0.03] transition ${
                        idx % 2 === 1 ? 'bg-white/[0.015]' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5 font-medium text-tinta-100">
                        {p.nombreCliente || 'Sin nombre'}
                      </td>
                      <td className="px-6 py-3.5 text-tinta-400">
                        <span className="inline-flex items-center gap-1.5">
                          <IconoCanal size={13} className="text-azul-400" />
                          {ETIQUETAS_CANAL[p.canal] ?? p.canal}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-tinta-100 font-semibold tabular-nums">
                        {formatoMoneda.format(p.total)}
                      </td>
                      <td className="px-6 py-3.5">
                        <EstadoPedidoBadge pedido={p} onCambiado={cargarPedidos} />
                      </td>
                      <td className="px-6 py-3.5 text-tinta-400">
                        {new Date(p.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setDetalle(p)}
                            title="Ver detalle"
                            className="text-tinta-400 hover:text-azul-400 hover:bg-azul-500/10 transition p-2 rounded-lg"
                          >
                            <Eye size={15} />
                          </button>
                          {p.estado !== 'CANCELADO' && (
                            <button
                              onClick={() => setModal(p)}
                              title="Editar cliente / canal / notas"
                              className="text-tinta-400 hover:text-azul-400 hover:bg-azul-500/10 transition p-2 rounded-lg"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && (
                            <button
                              onClick={() => setACancelar(p.id)}
                              title="Cancelar pedido"
                              className="text-tinta-400 hover:text-frambuesa-500 hover:bg-frambuesa-500/10 transition p-2 rounded-lg"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <PedidoFormModal
          pedido={modal === 'nuevo' ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            cargarPedidos();
          }}
        />
      )}

      {detalle && (
        <PedidoDetalleModal
          pedido={detalle}
          onClose={() => setDetalle(null)}
          onCambiado={refrescarDetalle}
        />
      )}

      <ConfirmDialog
        abierto={!!aCancelar}
        titulo="Cancelar pedido"
        mensaje="El pedido se marcará como cancelado y el inventario que había descontado se repondrá automáticamente."
        textoConfirmar="Sí, cancelar pedido"
        onConfirmar={confirmarCancelar}
        onCancelar={() => setACancelar(null)}
      />
    </div>
  );
}