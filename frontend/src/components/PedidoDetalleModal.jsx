import { X, User, Radio, StickyNote, Calendar } from 'lucide-react';
import EstadoPedidoBadge from './EstadoPedidoBadge';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const ETIQUETAS_CANAL = {
  WHATSAPP: 'WhatsApp',
  PRESENCIAL: 'Presencial',
  WEB: 'Web',
};

export default function PedidoDetalleModal({ pedido, onClose, onCambiado }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-tinta-900 border border-tinta-700 rounded-xl shadow-2xl shadow-black/40 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-white">
            Pedido {pedido.nombreCliente ? `de ${pedido.nombreCliente}` : ''}
          </h3>
          <button onClick={onClose} className="text-tinta-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <EstadoPedidoBadge pedido={pedido} onCambiado={onCambiado} />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-tinta-400 border border-white/10">
            <Radio size={11} />
            {ETIQUETAS_CANAL[pedido.canal] ?? pedido.canal}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-tinta-400 border border-white/10">
            <Calendar size={11} />
            {new Date(pedido.createdAt).toLocaleDateString('es-CO')}
          </span>
        </div>

        {pedido.nombreCliente && (
          <div className="flex items-center gap-2 text-sm text-tinta-100 mb-2">
            <User size={14} className="text-azul-400" />
            {pedido.nombreCliente}
          </div>
        )}
        {pedido.notas && (
          <div className="flex items-start gap-2 text-sm text-tinta-400 mb-4 bg-white/[0.03] rounded-lg px-3 py-2">
            <StickyNote size={14} className="mt-0.5 shrink-0 text-mango-400" />
            {pedido.notas}
          </div>
        )}

        <div className="space-y-2 mt-2">
          {pedido.detalles.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5">
              <span className="text-tinta-100">
                {d.cantidad} × {d.productoNombre}
              </span>
              <span className="text-tinta-400 tabular-nums">{formatoMoneda.format(d.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-tinta-700 mt-4 pt-4">
          <span className="font-medium text-tinta-100">Total</span>
          <span className="font-display text-lg font-bold text-white tabular-nums">
            {formatoMoneda.format(pedido.total)}
          </span>
        </div>
      </div>
    </div>
  );
}