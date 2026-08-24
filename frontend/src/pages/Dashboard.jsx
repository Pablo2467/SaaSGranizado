import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, ClipboardList, TriangleAlert, Sparkles, ArrowRight,
  Clock, Wheat, Plus, IceCreamCone,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EstadoPedidoBadge from '../components/EstadoPedidoBadge';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const ETIQUETAS_CANAL = { WHATSAPP: 'WhatsApp', PRESENCIAL: 'Presencial', WEB: 'Web' };

export default function Dashboard() {
  const { empresa, rol, esDueno } = useAuth();
  const puedeVerGanancias = rol === 'DUENO' || rol === 'ENCARGADO_PRODUCCION';
  const puedeVerInsumos = rol === 'DUENO' || rol === 'ENCARGADO_PRODUCCION';

  const [suscripcion, setSuscripcion] = useState(null);
  const [resumenGanancias, setResumenGanancias] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [insumosAlerta, setInsumosAlerta] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const peticiones = [
      api.get('/suscripcion/estado').catch(() => ({ data: null })),
      api.get('/pedidos').catch(() => ({ data: [] })),
      puedeVerGanancias
        ? api.get('/estadisticas/ganancias/resumen').catch(() => ({ data: null }))
        : Promise.resolve({ data: null }),
      puedeVerInsumos
        ? api.get('/insumos').catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ];

    Promise.all(peticiones).then(([resSus, resPedidos, resGanancias, resInsumos]) => {
      setSuscripcion(resSus.data);
      setPedidos(resPedidos.data ?? []);
      setResumenGanancias(resGanancias.data);
      setInsumosAlerta((resInsumos.data ?? []).filter((i) => i.alertaStock));
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoy = new Date().toDateString();
  const pedidosHoy = pedidos.filter((p) => new Date(p.createdAt).toDateString() === hoy);
  const pedidosPendientes = pedidos.filter((p) => p.estado === 'PENDIENTE');
  const pedidosRecientes = pedidos.slice(0, 5);

  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-100">
            {saludo}, {empresa} 👋
          </h2>
          <p className="text-tinta-400 mt-1">Aquí tienes un resumen de tu negocio.</p>
        </div>
        {suscripcion && (
          <Link
            to="/dashboard/suscripcion"
            className="flex items-center gap-2.5 bg-tinta-900/70 border border-tinta-700/60 rounded-xl px-4 py-2.5 hover:border-azul-500/40 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-azul-500/10 flex items-center justify-center">
              <Sparkles className="text-azul-400" size={15} />
            </div>
            <div className="text-left">
              <p className="text-[11px] text-tinta-400 leading-tight">Plan {suscripcion.plan}</p>
              <p className="text-xs text-tinta-100 font-medium leading-tight">
                {suscripcion.diasRestantes} días restantes
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Tarjetas KPI */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {puedeVerGanancias && (
          <Link
            to="/dashboard/ganancias"
            className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-5 shadow-lg shadow-black/10 hover:border-azul-500/30 transition group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-tinta-400">Ventas de hoy</p>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-azul-500/15 to-cian-500/15 flex items-center justify-center">
                <Wallet className="text-azul-400" size={16} />
              </div>
            </div>
            {cargando ? (
              <div className="h-8 mt-2 w-24 bg-tinta-700/40 rounded animate-soft-pulse" />
            ) : (
              <p className="font-display text-2xl font-bold text-tinta-100 mt-1 tabular-nums">
                {formatoMoneda.format(resumenGanancias?.hoy?.total ?? 0)}
              </p>
            )}
            <p className="text-xs text-azul-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              Ver ganancias <ArrowRight size={11} />
            </p>
          </Link>
        )}

        <Link
          to="/dashboard/pedidos"
          className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-5 shadow-lg shadow-black/10 hover:border-azul-500/30 transition group"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-tinta-400">Pedidos de hoy</p>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cian-500/15 to-azul-500/15 flex items-center justify-center">
              <ClipboardList className="text-cian-400" size={16} />
            </div>
          </div>
          {cargando ? (
            <div className="h-8 mt-2 w-16 bg-tinta-700/40 rounded animate-soft-pulse" />
          ) : (
            <p className="font-display text-2xl font-bold text-tinta-100 mt-1 tabular-nums">
              {pedidosHoy.length}
            </p>
          )}
          <p className="text-xs text-azul-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            Ver pedidos <ArrowRight size={11} />
          </p>
        </Link>

        <Link
          to="/dashboard/pedidos"
          className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-5 shadow-lg shadow-black/10 hover:border-mango-400/30 transition group"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-tinta-400">Pedidos pendientes</p>
            <div className="w-8 h-8 rounded-lg bg-mango-400/12 flex items-center justify-center">
              <Clock className="text-mango-400" size={16} />
            </div>
          </div>
          {cargando ? (
            <div className="h-8 mt-2 w-16 bg-tinta-700/40 rounded animate-soft-pulse" />
          ) : (
            <p className="font-display text-2xl font-bold text-tinta-100 mt-1 tabular-nums">
              {pedidosPendientes.length}
            </p>
          )}
          <p className="text-xs text-mango-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            Confirmar pedidos <ArrowRight size={11} />
          </p>
        </Link>

        {puedeVerInsumos && (
          <Link
            to="/dashboard/insumos"
            className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-5 shadow-lg shadow-black/10 hover:border-frambuesa-500/30 transition group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-tinta-400">Alertas de stock</p>
              <div className="w-8 h-8 rounded-lg bg-frambuesa-500/12 flex items-center justify-center">
                <TriangleAlert className="text-frambuesa-500" size={16} />
              </div>
            </div>
            {cargando ? (
              <div className="h-8 mt-2 w-16 bg-tinta-700/40 rounded animate-soft-pulse" />
            ) : (
              <p className="font-display text-2xl font-bold text-tinta-100 mt-1 tabular-nums">
                {insumosAlerta.length}
              </p>
            )}
            <p className="text-xs text-frambuesa-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              Revisar insumos <ArrowRight size={11} />
            </p>
          </Link>
        )}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 bg-tinta-900/70 rounded-2xl border border-tinta-700/60 shadow-xl shadow-black/20 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-tinta-700/60">
            <h3 className="font-display text-lg font-bold text-tinta-100">Pedidos recientes</h3>
            <Link to="/dashboard/pedidos" className="text-xs text-azul-400 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {cargando ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-tinta-800/60 animate-shimmer" />
              ))}
            </div>
          ) : pedidosRecientes.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-azul-500/10 flex items-center justify-center">
                <ClipboardList className="text-azul-400" size={22} />
              </div>
              <p className="text-tinta-400 mt-3 text-sm">Todavía no tienes pedidos.</p>
              <Link
                to="/dashboard/pedidos"
                className="inline-flex items-center gap-1.5 text-azul-400 font-medium text-sm mt-2 hover:underline"
              >
                <Plus size={14} /> Crear el primero
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-tinta-700/30">
              {pedidosRecientes.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.03] transition">
                  <div>
                    <p className="text-sm font-medium text-tinta-100">{p.nombreCliente || 'Sin nombre'}</p>
                    <p className="text-xs text-tinta-400">
                      {ETIQUETAS_CANAL[p.canal] ?? p.canal} · {new Date(p.createdAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-tinta-100 tabular-nums">
                      {formatoMoneda.format(p.total)}
                    </span>
                    <EstadoPedidoBadge pedido={p} onCambiado={() => api.get('/pedidos').then((r) => setPedidos(r.data))} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de stock + accesos rápidos */}
        <div className="space-y-6">
          {puedeVerInsumos && (
            <div className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 shadow-xl shadow-black/20 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-tinta-700/60">
                <h3 className="font-display text-sm font-bold text-tinta-100">Stock bajo</h3>
                <Link to="/dashboard/insumos" className="text-xs text-azul-400 hover:underline">
                  Ver todos
                </Link>
              </div>
              {cargando ? (
                <div className="p-5 space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-tinta-800/60 animate-shimmer" />
                  ))}
                </div>
              ) : insumosAlerta.length === 0 ? (
                <p className="text-tinta-400 text-sm px-5 py-6 text-center">
                  Todo tu inventario está en buen nivel ✓
                </p>
              ) : (
                <div className="divide-y divide-tinta-700/30">
                  {insumosAlerta.slice(0, 5).map((i) => (
                    <div key={i.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                      <div className="flex items-center gap-2 text-tinta-100">
                        <Wheat size={13} className="text-frambuesa-500 shrink-0" />
                        {i.nombre}
                      </div>
                      <span className="text-xs text-frambuesa-400 tabular-nums">
                        {i.cantidadActual} {i.unidadMedida}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 shadow-xl shadow-black/20 p-5">
            <h3 className="font-display text-sm font-bold text-tinta-100 mb-3">Accesos rápidos</h3>
            <div className="space-y-2">
              <Link
                to="/dashboard/pedidos"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-tinta-100
                           bg-gradient-to-b from-azul-500 to-azul-700 hover:from-azul-400 hover:to-azul-600 transition"
              >
                <Plus size={15} /> Nuevo pedido
              </Link>
              {esDueno && (
                <Link
                  to="/dashboard/productos"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-tinta-100
                             bg-white/5 border border-tinta-700 hover:bg-white/10 transition"
                >
                  <IceCreamCone size={15} className="text-azul-400" /> Nuevo producto
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}