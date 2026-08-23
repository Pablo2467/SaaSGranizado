import { useState } from 'react';

const formatoMonedaCorto = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/**
 * Gráfico de barras minimalista, sin librerías externas: solo SVG.
 * puntos: [{ etiqueta, total, pedidos }]
 */
export default function GraficoBarras({ puntos }) {
  const [activo, setActivo] = useState(null);

  const alto = 220;
  const maximo = Math.max(...puntos.map((p) => Number(p.total)), 1);

  if (!puntos.length) {
    return <p className="text-tinta-400 text-sm py-12 text-center">Todavía no hay datos para este periodo.</p>;
  }

  return (
    <div className="relative">
      {/* Líneas guía horizontales */}
      <div className="relative" style={{ height: alto }}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-tinta-700/60" />
          ))}
        </div>

        <div className="absolute inset-0 flex items-end gap-1.5 px-1">
          {puntos.map((p, i) => {
            const alturaPct = (Number(p.total) / maximo) * 100;
            const esActivo = activo === i;
            return (
              <div
                key={i}
                className="flex-1 h-full flex items-end justify-center relative"
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
              >
                {esActivo && (
                  <div className="absolute -top-2 -translate-y-full bg-tinta-800 border border-tinta-700 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-xl z-10">
                    <p className="font-semibold text-tinta-100">{formatoMoneda.format(p.total)}</p>
                    <p className="text-tinta-400">
                      {p.pedidos} pedido{p.pedidos === 1 ? '' : 's'}
                    </p>
                  </div>
                )}
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max(alturaPct, Number(p.total) > 0 ? 3 : 1)}%`,
                    background: esActivo
                      ? 'linear-gradient(180deg, #22d3ee, #2f66f0)'
                      : 'linear-gradient(180deg, #2f66f0, #1a3fae)',
                    opacity: Number(p.total) === 0 ? 0.25 : 1,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Etiquetas del eje X */}
      <div className="flex gap-1.5 px-1 mt-2">
        {puntos.map((p, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-[11px] leading-tight ${
              activo === i ? 'text-azul-400 font-semibold' : 'text-tinta-400'
            }`}
          >
            {p.etiqueta}
          </div>
        ))}
      </div>
    </div>
  );
}

export { formatoMonedaCorto, formatoMoneda };