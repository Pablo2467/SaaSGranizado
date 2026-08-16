import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function ProductoFormModal({ producto, onClose, onGuardado }) {
  const esEdicion = !!producto;

  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio: producto?.precio ?? '',
    categoria: producto?.categoria ?? '',
    imagenUrl: producto?.imagenUrl ?? '',
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

    const body = { ...form, precio: Number(form.precio) };

    try {
      if (esEdicion) {
        await api.put(`/productos/${producto.id}`, body);
      } else {
        await api.post('/productos', body);
      }
      onGuardado();
    } catch (err) {
      const mensaje = err.response?.data?.message ?? 'No se pudo guardar el producto.';
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
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
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
              className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta-600 mb-1.5">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => actualizarCampo('descripcion', e.target.value)}
              className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tinta-600 mb-1.5">Precio</label>
              <input
                type="number"
                min="0"
                value={form.precio}
                onChange={(e) => actualizarCampo('precio', e.target.value)}
                required
                className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tinta-600 mb-1.5">Categoría</label>
              <input
                type="text"
                value={form.categoria}
                onChange={(e) => actualizarCampo('categoria', e.target.value)}
                placeholder="Granizados"
                className="w-full rounded-lg border border-tinta-300/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-frambuesa-500"
              />
            </div>
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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  );
}