import { useState } from 'react';
import { Clock, CheckCircle2, ChefHat, PackageCheck, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axios';

const FLUJO = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'ENTREGADO'];

const CONFIG_ESTADO = {
  PENDIENTE: {
    etiqueta: 'Pendiente',
    icon: Clock,
    clases: 'bg-mango-400/12 text-mango-400 border-mango-400/25',
    siguienteEtiqueta: 'Marcar como confirmado',
  },
  CONFIRMADO: {
    etiqueta: 'Confirmado',
    icon: CheckCircle2,
    clases: 'bg-lima-500/12 text-lima-400 border-lima-500/25',
    siguienteEtiqueta: 'Pasar a preparación',
  },
  EN_PREPARACION: {
    etiqueta: 'En preparación',
    icon: ChefHat,
    clases: 'bg-azul-500/12 text-azul-300 border-azul-500/25',
    siguienteEtiqueta: 'Marcar como entregado',
  },
  ENTREGADO: {
    etiqueta: 'Entregado',
    icon: PackageCheck,
    clases: 'bg-cian-500/12 text-cian-400 border-cian-500/25',
    siguienteEtiqueta: null,
  },
  CANCELADO: {
    etiqueta: 'Cancelado',
    icon: XCircle,
    clases: 'bg-tinta-700/50 text-tinta-400 border-tinta-600/50',
    siguienteEtiqueta: null,
  },
};

export default function EstadoPedidoBadge({ pedido, onCambiado }) {
  const [procesando, setProcesando] = useState(false);
  const config = CONFIG_ESTADO[pedido.estado] ?? CONFIG_ESTADO.PENDIENTE;
  const Icon = config.icon;

  const indiceActual = FLUJO.indexOf(pedido.estado);
  const esFinal = pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO';
  const siguienteEstado = !esFinal && indiceActual >= 0 && indiceActual < FLUJO.length - 1
    ? FLUJO[indiceActual + 1]
    : null;

  async function avanzarEstado(evento) {
    evento.stopPropagation();
    if (!siguienteEstado || procesando) return;
    setProcesando(true);
    try {
      await api.patch(`/pedidos/${pedido.id}/estado`, { estado: siguienteEstado });
      onCambiado?.();
    } catch (err) {
      alert(err.response?.data?.message ?? 'No se pudo actualizar el estado del pedido.');
    } finally {
      setProcesando(false);
    }
  }

  if (esFinal || !siguienteEstado) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.clases}`}>
        <Icon size={12} />
        {config.etiqueta}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={avanzarEstado}
      disabled={procesando}
      title={config.siguienteEtiqueta}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition
                  hover:brightness-110 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-wait ${config.clases}`}
    >
      {procesando ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
      {config.etiqueta}
      {!procesando && <ChevronRight size={12} className="opacity-60" />}
    </button>
  );
}

export { CONFIG_ESTADO };