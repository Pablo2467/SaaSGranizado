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

  const claseInput =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-tinta-100/30 ' +
    'focus:outline-none focus:ring-2 focus:ring-azul-400 focus:border-transparent transition';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-tinta-900 border border-tinta-700 rounded-xl shadow-2xl shadow-black/40 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-white">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <button onClick={onClose} className="text-tinta-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              required
              placeholder="Granizado tamarindo"
              className={claseInput}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => actualizarCampo('descripcion', e.target.value)}
              placeholder="12 oz"
              className={claseInput}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Precio</label>
              <input
                type="number"
                min="0"
                value={form.precio}
                onChange={(e) => actualizarCampo('precio', e.target.value)}
                required
                placeholder="5000"
                className={claseInput}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Categoría</label>
              <input
                type="text"
                value={form.categoria}
                onChange={(e) => actualizarCampo('categoria', e.target.value)}
                placeholder="Granizados"
                className={claseInput}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-frambuesa-500 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  );
}