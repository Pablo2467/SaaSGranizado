import { useEffect, useState } from 'react';
import { X, Minus, Plus, Info } from 'lucide-react';
import api from '../api/axios';

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function PedidoFormModal({ pedido, onClose, onGuardado }) {
  const esEdicion = !!pedido;

  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({}); // { productoId: cantidad }
  const [nombreCliente, setNombreCliente] = useState(pedido?.nombreCliente ?? '');
  const [canal, setCanal] = useState(pedido?.canal ?? 'WHATSAPP');
  const [notas, setNotas] = useState(pedido?.notas ?? '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!esEdicion) {
      api.get('/productos').then((res) => setProductos(res.data));
    }
  }, [esEdicion]);

  function cambiarCantidad(productoId, delta) {
    setCantidades((prev) => {
      const actual = prev[productoId] ?? 0;
      const nueva = Math.max(0, actual + delta);
      return { ...prev, [productoId]: nueva };
    });
  }

  const itemsSeleccionados = productos
    .filter((p) => (cantidades[p.id] ?? 0) > 0)
    .map((p) => ({ ...p, cantidad: cantidades[p.id] }));

  const total = esEdicion
    ? pedido.total
    : itemsSeleccionados.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');

    if (!esEdicion && itemsSeleccionados.length === 0) {
      setError('Agrega al menos un producto al pedido.');
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await api.put(`/pedidos/${pedido.id}`, {
          nombreCliente: nombreCliente || null,
          canal,
          notas: notas || null,
        });
      } else {
        await api.post('/pedidos', {
          nombreCliente: nombreCliente || null,
          canal,
          notas: notas || null,
          detalles: itemsSeleccionados.map((item) => ({
            productoId: item.id,
            cantidad: item.cantidad,
          })),
        });
      }
      onGuardado();
    } catch (err) {
      const mensaje = err.response?.data?.message ?? 'No se pudo guardar el pedido.';
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  }

  const claseInput =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-tinta-100/30 ' +
    'focus:outline-none focus:ring-2 focus:ring-azul-400 focus:border-transparent transition';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-tinta-900 border border-tinta-700 rounded-xl shadow-2xl shadow-black/40 max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="font-display font-bold text-lg text-white">
            {esEdicion ? 'Editar pedido' : 'Nuevo pedido'}
          </h3>
          <button onClick={onClose} className="text-tinta-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Cliente (opcional)</label>
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                  className={claseInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Canal</label>
                <select
                  value={canal}
                  onChange={(e) => setCanal(e.target.value)}
                  className={`${claseInput} [&>option]:bg-tinta-900 [&>option]:text-white`}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="WEB">Web</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Notas (opcional)</label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: sin azúcar, entregar a las 5pm..."
                className={claseInput}
              />
            </div>
          </div>

          {esEdicion ? (
            <div className="px-6 py-4 mt-2 border-y border-tinta-700">
              <div className="flex items-start gap-2 text-xs text-tinta-400 bg-white/[0.03] rounded-lg px-3 py-2.5">
                <Info size={14} className="mt-0.5 shrink-0" />
                Los productos y cantidades no se pueden editar aquí para no descuadrar el inventario ya
                descontado. Si te equivocaste en los productos, cancela el pedido y crea uno nuevo.
              </div>
              <div className="space-y-1.5 mt-3">
                {pedido.detalles.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-tinta-100">{d.cantidad} × {d.productoNombre}</span>
                    <span className="text-tinta-400 tabular-nums">{formatoMoneda.format(d.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-4 mt-2 border-y border-tinta-700">
              <p className="text-sm font-medium text-tinta-100/70 mb-3">Elige los productos</p>
              <div className="space-y-2">
                {productos.length === 0 && (
                  <p className="text-sm text-tinta-400 py-4 text-center">
                    Todavía no tienes productos creados.
                  </p>
                )}
                {productos.map((p) => {
                  const cantidad = cantidades[p.id] ?? 0;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 border transition ${
                        cantidad > 0
                          ? 'bg-azul-800/30 border-azul-600/50'
                          : 'bg-white/[0.03] border-transparent'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{p.nombre}</p>
                        <p className="text-xs text-tinta-400">{formatoMoneda.format(p.precio)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(p.id, -1)}
                          className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums text-white">
                          {cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(p.id, 1)}
                          className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-tinta-100/70">Total</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">
                {formatoMoneda.format(total)}
              </span>
            </div>

            {error && (
              <p className="text-sm text-frambuesa-500 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-lg bg-gradient-to-b from-azul-600 to-azul-800 text-white font-semibold py-2.5
                         shadow-[0_8px_24px_-6px_rgba(11,22,51,0.9)] border border-white/10
                         hover:from-azul-500 hover:to-azul-700
                         transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}