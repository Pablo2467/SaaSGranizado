import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Power, IceCreamCone, Search, Mail } from 'lucide-react';
import api from '../api/axios';
import EmpleadoFormModal from '../components/EmpleadoFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { ETIQUETAS_ROL } from '../context/AuthContext';

const ESTILO_ROL = {
  DUENO: 'bg-frambuesa-500/12 text-frambuesa-500 border-frambuesa-500/25',
  ENCARGADO_PRODUCCION: 'bg-mango-400/12 text-mango-400 border-mango-400/25',
  OPERADOR_MAQUINA: 'bg-azul-500/12 text-azul-300 border-azul-500/25',
  CAJERO: 'bg-lima-500/12 text-lima-400 border-lima-500/25',
};

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nuevo' | empleado a editar
  const [aEliminar, setAEliminar] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  function cargarEmpleados() {
    setCargando(true);
    api.get('/empleados')
      .then((res) => setEmpleados(res.data))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarEmpleados();
  }, []);

  async function alternarEstado(empleado) {
    setError('');
    try {
      await api.patch(`/empleados/${empleado.id}/estado`, { activo: !empleado.activo });
      cargarEmpleados();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo cambiar el estado.');
    }
  }

  async function confirmarEliminar() {
    setError('');
    try {
      await api.delete(`/empleados/${aEliminar}`);
      setAEliminar(null);
      cargarEmpleados();
    } catch (err) {
      setAEliminar(null);
      setError(err.response?.data?.message ?? 'No se pudo eliminar el empleado.');
    }
  }

  const empleadosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) => e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );
  }, [empleados, busqueda]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-100">Empleados</h2>
          <p className="text-tinta-400 mt-1">
            Crea cuentas para tu equipo y asígnales su rol dentro del negocio.
          </p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-gradient-to-b from-azul-500 to-azul-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold
                     shadow-[0_8px_20px_-6px_rgba(47,102,240,0.7)] border border-white/10 hover:from-azul-400 hover:to-azul-600 transition"
        >
          <Plus size={18} />
          Nuevo empleado
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-frambuesa-400 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-tinta-900/70 border border-tinta-700/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-tinta-700/60 bg-tinta-850/40">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full rounded-lg border border-tinta-700 bg-tinta-950/50 pl-9 pr-3 py-2 text-sm text-tinta-100
                         placeholder:text-tinta-400/60 focus:outline-none focus:ring-2 focus:ring-azul-500/50 focus:border-transparent transition"
            />
          </div>
          <span className="text-xs text-tinta-400 whitespace-nowrap">
            {empleados.length} empleado{empleados.length === 1 ? '' : 's'}
          </span>
        </div>

        {cargando ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-tinta-800/60 animate-shimmer" />
            ))}
          </div>
        ) : empleadosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-azul-500/10 flex items-center justify-center">
              <Users className="text-azul-400" size={26} />
            </div>
            <p className="text-tinta-400 mt-3">
              {empleados.length === 0 ? 'Todavía no has agregado empleados.' : 'Sin resultados para tu búsqueda.'}
            </p>
            {empleados.length === 0 && (
              <button
                onClick={() => setModal('nuevo')}
                className="text-azul-400 font-medium text-sm mt-2 hover:underline"
              >
                Agrega el primero
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tinta-700/60 text-left text-tinta-400 bg-tinta-850/30">
                  <th className="px-6 py-3.5 font-medium">Empleado</th>
                  <th className="px-6 py-3.5 font-medium">Rol</th>
                  <th className="px-6 py-3.5 font-medium">Sabores</th>
                  <th className="px-6 py-3.5 font-medium">Estado</th>
                  <th className="px-6 py-3.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosFiltrados.map((e, idx) => (
                  <tr
                    key={e.id}
                    className={`border-b border-tinta-700/30 last:border-0 hover:bg-white/[0.03] transition ${
                      idx % 2 === 1 ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-azul-500 to-cian-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {e.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-tinta-100">{e.nombre}</p>
                          <p className="text-xs text-tinta-400 flex items-center gap-1">
                            <Mail size={11} />
                            {e.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${ESTILO_ROL[e.rol] ?? ''}`}>
                        {ETIQUETAS_ROL[e.rol] ?? e.rol}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-tinta-400">
                      {e.sabores && e.sabores.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
                          <IceCreamCone size={13} className="text-mango-400 shrink-0" />
                          {e.sabores.join(', ')}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          e.activo ? 'bg-lima-500/10 text-lima-400' : 'bg-tinta-700/40 text-tinta-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${e.activo ? 'bg-lima-400' : 'bg-tinta-400'}`} />
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => alternarEstado(e)}
                          title={e.activo ? 'Desactivar' : 'Activar'}
                          className="text-tinta-400 hover:text-mango-400 hover:bg-mango-400/10 transition p-2 rounded-lg"
                        >
                          <Power size={15} />
                        </button>
                        <button
                          onClick={() => setModal(e)}
                          title="Editar empleado"
                          className="text-tinta-400 hover:text-azul-400 hover:bg-azul-500/10 transition p-2 rounded-lg"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setAEliminar(e.id)}
                          title="Eliminar empleado"
                          className="text-tinta-400 hover:text-frambuesa-500 hover:bg-frambuesa-500/10 transition p-2 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <EmpleadoFormModal
          empleado={modal === 'nuevo' ? null : modal}
          onClose={() => setModal(null)}
          onGuardado={() => {
            setModal(null);
            cargarEmpleados();
          }}
        />
      )}

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar empleado"
        mensaje="Esta acción no se puede deshacer. El empleado perderá acceso al sistema."
        textoConfirmar="Sí, eliminar"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}