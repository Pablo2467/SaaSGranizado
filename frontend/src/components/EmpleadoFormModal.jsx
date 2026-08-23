import { useState } from 'react';
import { X, Plus, XCircle } from 'lucide-react';
import api from '../api/axios';
import { ETIQUETAS_ROL } from '../context/AuthContext';

const ROLES = ['DUENO', 'ENCARGADO_PRODUCCION', 'OPERADOR_MAQUINA', 'CAJERO'];

export default function EmpleadoFormModal({ empleado, onClose, onGuardado }) {
  const esEdicion = !!empleado;

  const [form, setForm] = useState({
    nombre: empleado?.nombre ?? '',
    email: empleado?.email ?? '',
    password: '',
    rol: empleado?.rol ?? 'CAJERO',
    sabores: empleado?.sabores ?? [],
  });
  const [saborNuevo, setSaborNuevo] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function agregarSabor() {
    const valor = saborNuevo.trim();
    if (!valor || form.sabores.includes(valor)) return;
    actualizarCampo('sabores', [...form.sabores, valor]);
    setSaborNuevo('');
  }

  function quitarSabor(sabor) {
    actualizarCampo('sabores', form.sabores.filter((s) => s !== sabor));
  }

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);

    try {
      if (esEdicion) {
        await api.put(`/empleados/${empleado.id}`, {
          nombre: form.nombre,
          rol: form.rol,
          sabores: form.rol === 'OPERADOR_MAQUINA' ? form.sabores : [],
        });
      } else {
        await api.post('/empleados', {
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          sabores: form.rol === 'OPERADOR_MAQUINA' ? form.sabores : [],
        });
      }
      onGuardado();
    } catch (err) {
      const mensaje = err.response?.data?.message ?? 'No se pudo guardar el empleado.';
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
      <div className="bg-tinta-900 border border-tinta-700 rounded-xl shadow-2xl shadow-black/40 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-white">
            {esEdicion ? 'Editar empleado' : 'Nuevo empleado'}
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
              className={claseInput}
            />
          </div>

          {!esEdicion && (
            <>
              <div>
                <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => actualizarCampo('email', e.target.value)}
                  required
                  className={claseInput}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => actualizarCampo('password', e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className={claseInput}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">Rol</label>
            <select
              value={form.rol}
              onChange={(e) => actualizarCampo('rol', e.target.value)}
              className={`${claseInput} [&>option]:bg-tinta-900 [&>option]:text-white`}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ETIQUETAS_ROL[r]}</option>
              ))}
            </select>
          </div>

          {form.rol === 'OPERADOR_MAQUINA' && (
            <div>
              <label className="block text-sm font-medium text-tinta-100/70 mb-1.5">
                Sabores que atiende
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saborNuevo}
                  onChange={(e) => setSaborNuevo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); agregarSabor(); }
                  }}
                  placeholder="Ej: Mango"
                  className={`flex-1 ${claseInput}`}
                />
                <button
                  type="button"
                  onClick={agregarSabor}
                  className="rounded-lg bg-gradient-to-b from-azul-600 to-azul-800 border border-white/10 text-white px-3 hover:from-azul-500 hover:to-azul-700 transition"
                >
                  <Plus size={16} />
                </button>
              </div>

              {form.sabores.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.sabores.map((sabor) => (
                    <span
                      key={sabor}
                      className="inline-flex items-center gap-1 bg-mango-400/15 text-mango-400 px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {sabor}
                      <button type="button" onClick={() => quitarSabor(sabor)} className="hover:text-frambuesa-500">
                        <XCircle size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {form.sabores.length === 0 && (
                <p className="text-xs text-tinta-400 mt-2">
                  Agrega al menos un sabor y presiona Enter o el botón +.
                </p>
              )}
            </div>
          )}

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
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear empleado'}
          </button>
        </form>
      </div>
    </div>
  );
}