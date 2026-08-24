import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Wheat, TriangleAlert, Search } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  function cargarInsumos() {
    setCargando(true);
    api.get('/insumos')
      .then((res) => setInsumos(res.data))
      .catch(() => setError('No se pudieron cargar los insumos.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarInsumos();
  }, []);

  async function confirmarEliminar() {
    setError('');
    try {
      await api.delete(`/insumos/${aEliminar}`);
      setAEliminar(null);
      cargarInsumos();
    } catch (err) {
      setAEliminar(null);
      setError(err.response?.data?.message ?? 'No se pudo eliminar el insumo.');
    }
  }

  const insumosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return insumos;
    return insumos.filter((i) => i.nombre.toLowerCase().includes(q));
  }, [insumos, busqueda]);

  const conAlerta = insumos.filter((i) => i.alertaStock).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-100">Insumos</h2>
          <p className="text-tinta-400 mt-1">Tu materia prima e inventario.</p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-gradient-to-b from-azul-500 to-azul-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold
                     shadow-[0_8px_20px_-6px_rgba(47,102,240,0.7)] border border-white/10 hover:from-azul-400 hover:to-azul-600 transition"
        >
          <Plus size={18} />
          Nuevo insumo
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-frambuesa-400 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {conAlerta > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm text-mango-400 bg-mango-400/10 border border-mango-400/25 rounded-lg px-3 py-2">
          <TriangleAlert size={15} />
          Tienes {conAlerta} insumo{conAlerta === 1 ? '' : 's'} con stock por debajo del mínimo.
        </div>
      )}

      <div className="bg-tinta-900/70 border border-tinta-700/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-tinta-700/60 bg-tinta-850/40">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar insumo..."
              className="w-full rounded-lg border border-tinta-700 bg-tinta-950/50 pl-9 pr-3 py-2 text-sm text-tinta-100
                         placeholder:text-tinta-400/60 focus:outline-none focus:ring-2 focus:ring-azul-500/50 focus:border-transparent transition"
            />
          </div>
          <span className="text-xs text-tinta-400 whitespace-nowrap">
            {insumos.length} insumo{insumos.length === 1 ? '' : 's'}
          </span>
        </div>

        {cargando ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-tinta-800/60 animate-shimmer" />
            ))}
          </div>
        ) : insumosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-azul-500/10 flex items-center justify-center">
              <Wheat className="text-azul-400" size={26} />
            </div>
            <p className="text-tinta-400 mt-3">
              {insumos.length === 0 ? 'Todavía no tienes insumos.' : 'Sin resultados para tu búsqueda.'}
            </p>
            {insumos.length === 0 && (
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
                  <th className="px-6 py-3.5 font-medium">Insumo</th>
                  <th className="px-6 py-3.5 font-medium">Nivel de stock</th>
                  <th className="px-6 py-3.5 font-medium">Costo unitario</th>
                  <th className="px-6 py-3.5 font-medium">Estado</th>
                  <th className="px-6 py-3.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map((i, idx) => {
                  const pct = i.stockMinimo > 0
                    ? Math.min(100, (Number(i.cantidadActual) / (Number(i.stockMinimo) * 2)) * 100)
                    : 100;
                  return (
                    <tr
                      key={i.id}
                      className={`border-b border-tinta-700/30 last:border-0 hover:bg-white/[0.03] transition ${
                        idx % 2 === 1 ? 'bg-white/[0.015]' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-mango-400/20 to-lima-500/20 flex items-center justify-center border border-mango-400/20">
                            <Wheat size={16} className="text-mango-400" />
                          </div>
                          <p className="font-medium text-tinta-100">{i.nombre}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 min-w-[180px]">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-tinta-100 font-medium tabular-nums">
                            {i.cantidadActual} {i.unidadMedida}
                          </span>
                          <span className="text-tinta-400 tabular-nums">mín. {i.stockMinimo}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-tinta-700/50 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.max(pct, 4)}%`,
                              background: i.alertaStock
                                ? 'linear-gradient(90deg, #e11d74, #fb923c)'
                                : 'linear-gradient(90deg, #2f66f0, #22d3ee)',
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-tinta-100 font-semibold tabular-nums">
                        {formatoMoneda.format(i.costoUnitario)}
                      </td>
                      <td className="px-6 py-3.5">
                        {i.alertaStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-frambuesa-500/10 text-frambuesa-500">
                            <TriangleAlert size={12} />
                            Stock bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-lima-500/10 text-lima-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-lima-400" />
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setModal(i)}
                            title="Editar insumo"
                            className="text-tinta-400 hover:text-azul-400 hover:bg-azul-500/10 transition p-2 rounded-lg"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setAEliminar(i.id)}
                            title="Eliminar insumo"
                            className="text-tinta-400 hover:text-frambuesa-500 hover:bg-frambuesa-500/10 transition p-2 rounded-lg"
                          >
                            <Trash2 size={15} />
                          </button>
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
        textoConfirmar="Sí, eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}