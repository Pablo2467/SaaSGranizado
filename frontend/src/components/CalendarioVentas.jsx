import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import api from '../api/axios';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarioVentas() {
  const hoyReal = useMemo(() => new Date(), []);
  const [anio, setAnio] = useState(hoyReal.getFullYear());
  const [mes, setMes] = useState(hoyReal.getMonth() + 1); // 1-12
  const [dias, setDias] = useState([]); // [{ dia, total, pedidos }]
  const [cargando, setCargando] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const esMesActual = anio === hoyReal.getFullYear() && mes === hoyReal.getMonth() + 1;

  useEffect(() => {
    setCargando(true);
    setDiaSeleccionado(null);
    api.get('/estadisticas/ganancias/serie', { params: { periodo: 'mes', anio, mes } })
      .then((res) => setDias(res.data))
      .finally(() => setCargando(false));
  }, [anio, mes]);

  function irMesAnterior() {
    if (mes === 1) {
      setMes(12);
      setAnio((a) => a - 1);
    } else {
      setMes((m) => m - 1);
    }
  }

  function irMesSiguiente() {
    if (esMesActual) return; // no navegar al futuro
    if (mes === 12) {
      setMes(1);
      setAnio((a) => a + 1);
    } else {
      setMes((m) => m + 1);
    }
  }

  const maximoDia = Math.max(...dias.map((d) => Number(d.total)), 1);

  // Alinear el día 1 del mes con su día de la semana real (semana empieza en lunes)
  const primerDiaSemana = useMemo(() => {
    const d = new Date(anio, mes - 1, 1).getDay(); // 0=Dom..6=Sáb
    return (d + 6) % 7; // 0=Lun..6=Dom
  }, [anio, mes]);

  const celdas = useMemo(() => {
    const arr = [];
    for (let i = 0; i < primerDiaSemana; i++) arr.push(null);
    dias.forEach((d) => arr.push(d));
    return arr;
  }, [dias, primerDiaSemana]);

  const totalMes = dias.reduce((acc, d) => acc + Number(d.total), 0);
  const pedidosMes = dias.reduce((acc, d) => acc + Number(d.pedidos), 0);

  function intensidad(total) {
    if (total <= 0) return 0;
    return Math.max(0.16, Math.min(1, total / maximoDia));
  }

  return (
    <div className="bg-tinta-900/70 border border-tinta-700/60 rounded-2xl shadow-xl shadow-black/20 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-azul-500/10 flex items-center justify-center">
            <CalendarDays className="text-azul-400" size={16} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-tinta-100">Calendario de ventas</h3>
            <p className="text-xs text-tinta-400">
              {NOMBRES_MES[mes - 1]} {anio}
              {esMesActual && <span className="text-lima-400 ml-1.5">· mes en curso</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={irMesAnterior}
            className="w-8 h-8 rounded-lg border border-tinta-700 flex items-center justify-center text-tinta-400 hover:text-tinta-100 hover:bg-white/5 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={irMesSiguiente}
            disabled={esMesActual}
            className="w-8 h-8 rounded-lg border border-tinta-700 flex items-center justify-center text-tinta-400 hover:text-tinta-100 hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-baseline gap-4 mt-3 mb-5 text-sm">
        <span className="text-tinta-400">
          Total del mes:{' '}
          <span className="text-tinta-100 font-semibold tabular-nums">{formatoMoneda.format(totalMes)}</span>
        </span>
        <span className="text-tinta-400">
          <span className="text-tinta-100 font-semibold tabular-nums">{pedidosMes}</span> pedido{pedidosMes === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-tinta-400 mb-2">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {cargando ? (
        <div className="grid grid-cols-7 gap-1.5">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-tinta-800/60 animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {celdas.map((d, i) => {
            if (!d) return <div key={`vacio-${i}`} />;
            const esHoy = esMesActual && Number(d.dia) === hoyReal.getDate();
            const tieneVentas = Number(d.total) > 0;
            const alpha = intensidad(Number(d.total));
            const seleccionado = diaSeleccionado?.dia === d.dia;
            return (
              <button
                key={d.dia}
                type="button"
                onClick={() => setDiaSeleccionado(seleccionado ? null : d)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition
                            border ${esHoy ? 'border-azul-400' : 'border-transparent'}
                            ${seleccionado ? 'ring-2 ring-cian-400' : ''}
                            hover:brightness-125`}
                style={{
                  background: tieneVentas
                    ? `linear-gradient(145deg, rgba(47,102,240,${alpha}), rgba(6,182,212,${alpha * 0.7}))`
                    : 'rgba(255,255,255,0.03)',
                }}
                title={tieneVentas ? `${formatoMoneda.format(d.total)} · ${d.pedidos} pedido(s)` : 'Sin ventas'}
              >
                <span className={tieneVentas ? 'text-white' : 'text-tinta-400'}>{d.dia}</span>
                {tieneVentas && <span className="w-1 h-1 rounded-full bg-white/80 mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-tinta-700/50">
        <div className="flex items-center gap-2 text-[11px] text-tinta-400">
          <span>Menos ventas</span>
          <div className="flex gap-0.5">
            {[0.18, 0.4, 0.65, 1].map((a) => (
              <span
                key={a}
                className="w-4 h-4 rounded"
                style={{ background: `linear-gradient(145deg, rgba(47,102,240,${a}), rgba(6,182,212,${a * 0.7}))` }}
              />
            ))}
          </div>
          <span>Más ventas</span>
        </div>

        {diaSeleccionado && (
          <div className="text-xs text-tinta-100 bg-white/5 border border-tinta-700 rounded-lg px-3 py-1.5">
            <span className="text-tinta-400">{NOMBRES_MES[mes - 1]} {diaSeleccionado.dia}:</span>{' '}
            <span className="font-semibold tabular-nums">{formatoMoneda.format(diaSeleccionado.total)}</span>
            <span className="text-tinta-400"> · {diaSeleccionado.pedidos} pedido{diaSeleccionado.pedidos === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>
    </div>
  );
}