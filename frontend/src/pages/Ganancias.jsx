import { useEffect, useState } from 'react';
import { TrendingUp, Receipt, Wallet, IceCreamCone, Info, CircleCheck } from 'lucide-react';
import api from '../api/axios';
import GraficoBarras, { formatoMoneda } from '../components/GraficoBarras';
import CalendarioVentas from '../components/CalendarioVentas';

const CORTES = [
  { id: 'dia', label: 'Día', descripcion: 'ventas de hoy, hora por hora' },
  { id: 'semana', label: 'Semana', descripcion: 'esta semana, día por día' },
  { id: 'mes', label: 'Mes', descripcion: 'este mes, día por día' },
  { id: 'anio', label: 'Año', descripcion: 'este año, mes por mes' },
];

const TARJETAS = [
  { clave: 'hoy', titulo: 'Hoy', icon: Wallet },
  { clave: 'semana', titulo: 'Esta semana', icon: TrendingUp },
  { clave: 'mes', titulo: 'Este mes', icon: Receipt },
  { clave: 'anio', titulo: 'Este año', icon: TrendingUp },
];

export default function Ganancias() {
  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);

  const [corte, setCorte] = useState('dia');
  const [serie, setSerie] = useState([]);
  const [porProducto, setPorProducto] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);

  useEffect(() => {
    api.get('/estadisticas/ganancias/resumen')
      .then((res) => setResumen(res.data))
      .finally(() => setCargandoResumen(false));
  }, []);

  useEffect(() => {
    setCargandoDetalle(true);
    Promise.all([
      api.get('/estadisticas/ganancias/serie', { params: { periodo: corte } }),
      api.get('/estadisticas/ganancias/por-producto', { params: { periodo: corte } }),
    ])
      .then(([resSerie, resProducto]) => {
        setSerie(resSerie.data);
        setPorProducto(resProducto.data);
      })
      .finally(() => setCargandoDetalle(false));
  }, [corte]);

  const totalPeriodo = porProducto.reduce((acc, p) => acc + Number(p.total), 0);
  const maximoProducto = Math.max(...porProducto.map((p) => Number(p.total)), 1);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-tinta-100">Ganancias</h2>
      <p className="text-tinta-400 mt-1">
        Cómo va tu negocio en el tiempo — para que administres la plata con datos, no a ojo.
      </p>

      <div className="mt-4 flex items-start gap-2.5 text-sm text-azul-300 bg-azul-500/8 border border-azul-500/20 rounded-lg px-4 py-3">
        <CircleCheck size={16} className="mt-0.5 shrink-0" />
        <p>
          Aquí solo se cuentan como venta los pedidos <strong className="text-azul-200">confirmados</strong>,{' '}
          <strong className="text-azul-200">en preparación</strong> o <strong className="text-azul-200">entregados</strong>.
          Un pedido <em>pendiente</em> todavía no es una venta segura y uno <em>cancelado</em> nunca lo fue, así que no
          inflan tus números.
        </p>
      </div>

      {/* Tarjetas resumen: hoy / semana / mes / año, siempre visibles */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TARJETAS.map(({ clave, titulo, icon: Icon }) => {
          const dato = resumen?.[clave];
          return (
            <div
              key={clave}
              className="bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-5 shadow-lg shadow-black/10 hover:border-azul-500/30 transition"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-tinta-400">{titulo}</p>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-azul-500/15 to-cian-500/15 flex items-center justify-center">
                  <Icon className="text-azul-400" size={16} />
                </div>
              </div>

              {cargandoResumen ? (
                <div className="h-8 mt-2 w-24 bg-tinta-700/40 rounded animate-soft-pulse" />
              ) : (
                <>
                  <p className="font-display text-2xl font-bold text-tinta-100 mt-1 tabular-nums">
                    {formatoMoneda.format(dato?.total ?? 0)}
                  </p>
                  <p className="text-xs text-tinta-400 mt-1">
                    {dato?.pedidos ?? 0} pedido{(dato?.pedidos ?? 0) === 1 ? '' : 's'}
                    {' · '}
                    ticket prom. {formatoMoneda.format(dato?.ticketPromedio ?? 0)}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selector de corte + gráfico */}
      <div className="mt-8 bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-tinta-100">Evolución de ventas</h3>
            <p className="text-xs text-tinta-400 mt-0.5">
              {CORTES.find((c) => c.id === corte)?.descripcion}
            </p>
          </div>
          <div className="flex bg-tinta-950/50 rounded-lg p-1 border border-tinta-700">
            {CORTES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCorte(c.id)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
                  corte === c.id
                    ? 'bg-azul-500 text-white shadow'
                    : 'text-tinta-400 hover:text-tinta-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {cargandoDetalle ? (
            <div className="h-[220px] flex items-center justify-center text-tinta-400 text-sm">
              Cargando...
            </div>
          ) : serie.every((p) => Number(p.total) === 0) ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-center gap-2">
              <Info size={20} className="text-tinta-400" />
              <p className="text-tinta-400 text-sm">
                Todavía no hay ventas confirmadas en este periodo.
              </p>
            </div>
          ) : (
            <GraficoBarras puntos={serie} />
          )}
        </div>
      </div>

      {/* Calendario de ventas en tiempo real */}
      <div className="mt-8">
        <CalendarioVentas />
      </div>

      {/* Desglose por sabor, para el corte seleccionado */}
      <div className="mt-8 bg-tinta-900/70 rounded-2xl border border-tinta-700/60 p-6 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2 mb-5">
          <IceCreamCone className="text-azul-400" size={18} />
          <h3 className="font-display text-lg font-bold text-tinta-100">
            Ventas por sabor — {CORTES.find((c) => c.id === corte)?.label.toLowerCase()}
          </h3>
        </div>

        {cargandoDetalle ? (
          <p className="text-tinta-400 text-sm py-6 text-center">Cargando...</p>
        ) : porProducto.length === 0 ? (
          <p className="text-tinta-400 text-sm py-6 text-center">
            Todavía no hay ventas registradas en este periodo.
          </p>
        ) : (
          <div className="space-y-3">
            {porProducto.map((p) => {
              const pct = totalPeriodo > 0 ? (Number(p.total) / totalPeriodo) * 100 : 0;
              const anchoBarra = (Number(p.total) / maximoProducto) * 100;
              return (
                <div key={p.productoNombre}>
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <span className="font-medium text-tinta-100">{p.productoNombre}</span>
                    <span className="text-tinta-400 tabular-nums">
                      {p.unidadesVendidas} und · {formatoMoneda.format(p.total)}
                      <span className="text-tinta-700 mx-1.5">·</span>
                      <span className="text-azul-400 font-semibold">{pct.toFixed(0)}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-tinta-700/60 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(anchoBarra, 2)}%`,
                        background: 'linear-gradient(90deg, #2f66f0, #22d3ee)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}