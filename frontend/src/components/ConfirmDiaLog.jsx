import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Sí, continuar',
  variante = 'peligro', // 'peligro' | 'azul'
  onConfirmar,
  onCancelar,
}) {
  const [procesando, setProcesando] = useState(false);

  if (!abierto) return null;

  async function manejarConfirmar() {
    setProcesando(true);
    try {
      await onConfirmar();
    } finally {
      setProcesando(false);
    }
  }

  const colorIcono = variante === 'azul' ? 'text-azul-400 bg-azul-500/10' : 'text-frambuesa-500 bg-frambuesa-500/10';
  const colorBoton =
    variante === 'azul'
      ? 'bg-gradient-to-b from-azul-600 to-azul-800 hover:from-azul-500 hover:to-azul-700'
      : 'bg-gradient-to-b from-frambuesa-500 to-frambuesa-600 hover:from-frambuesa-400 hover:to-frambuesa-600';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-tinta-900 border border-tinta-700 rounded-xl shadow-2xl shadow-black/40 max-w-sm w-full p-6 animate-fade-in-up">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colorIcono}`}>
          <AlertTriangle size={22} />
        </div>
        <h3 className="font-display font-bold text-lg text-white">{titulo}</h3>
        <p className="text-tinta-400 text-sm mt-2 leading-relaxed">{mensaje}</p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            className="flex-1 rounded-lg border border-tinta-700 py-2.5 text-sm font-medium text-tinta-100 hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={manejarConfirmar}
            disabled={procesando}
            className={`flex-1 rounded-lg text-white py-2.5 text-sm font-semibold border border-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed ${colorBoton}`}
          >
            {procesando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}