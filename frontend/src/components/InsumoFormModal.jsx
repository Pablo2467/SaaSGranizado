import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function InsumoFormModal({ insumo, onClose, onGuardado }) {
  const esEdicion = !!insumo;

  const [form, setForm] = useState({
    nombre: insumo?.nombre ?? '',
    unidadMedida: insumo?.unidadMedida ?? '',
    cantidadActual: insumo?.cantidadActual ?? '',
    stockMinimo: insumo?.stockMinimo ?? '',
    costoUnitario: insumo?.costoUnitario ?? '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);

    const body = {
      ...form,
      cantidadActual: Number(form.cantidadActual),
      stockMinimo: Number(form.stockMinimo),
      costoUnitario: Number(form.costoUnitario),
    };

    try {
      if (esEdicion) {
        await api.put(`/insumos/${insumo.id}`, body);
      } else {
        await api.post('/insumos', body);
      }
      onGuardado();
    } catch (err) {
      const mensaje = err.response?.data?.message ?? 'No se pudo guardar el insumo.';
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-tinta-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-tinta-900">
            {esEdicion ? 'Editar insumo' : 'Nuevo insumo'}
          </h3>
          <button onClick={onClose} className="text-tinta-300 hover:text-tinta-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tinta-600 mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              required
              placeholder="Jarabe de mora"
              className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta-600 mb-1.5">Unidad de medida</label>
            <input
              type="text"
              value={form.unidadMedida}
              onChange={(e) => actualizarCampo('unidadMedida', e.target.value)}
              required
              placeholder="ml, g, unidades..."
              className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tinta-600 mb-1.5">Cantidad actual</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cantidadActual}
                onChange={(e) => actualizarCampo('cantidadActual', e.target.value)}
                required
                className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tinta-600 mb-1.5">Stock mínimo</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.stockMinimo}
                onChange={(e) => actualizarCampo('stockMinimo', e.target.value)}
                required
                className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta-600 mb-1.5">Costo unitario</label>
            <input
              type="number"
              min="0"
              value={form.costoUnitario}
              onChange={(e) => actualizarCampo('costoUnitario', e.target.value)}
              required
              className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
            />
          </div>

          {error && (
            <p className="text-sm text-frambuesa-600 bg-frambuesa-50 border border-frambuesa-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-lg bg-frambuesa-500 text-white font-semibold py-2.5 hover:bg-frambuesa-600 transition disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear insumo'}
          </button>
        </form>
      </div>
    </div>
  );
}