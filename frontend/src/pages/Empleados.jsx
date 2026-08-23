import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Power, IceCreamCone } from 'lucide-react';
import api from '../api/axios';
import EmpleadoFormModal from '../components/EmpleadoFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { ETIQUETAS_ROL } from '../context/AuthContext';

const ESTILO_ROL = {
  DUENO: 'bg-frambuesa-500/10 text-frambuesa-600',
  ENCARGADO_PRODUCCION: 'bg-mango-400/15 text-orange-600',
  OPERADOR_MAQUINA: 'bg-blue-500/10 text-blue-600',
  CAJERO: 'bg-lima-500/10 text-lima-600',
};

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nuevo' | empleado a editar
  const [aEliminar, setAEliminar] = useState(null);
  const [error, setError] = useState('');

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-tinta-100">Empleados</h2>
          <p className="text-tinta-400 mt-1">
            Crea cuentas para tu equipo y asígnales su rol dentro del negocio.
          </p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-frambuesa-500 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-frambuesa-600 transition"
        >
          <Plus size={18} />
          Nuevo empleado
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-frambuesa-500 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-tinta-900 border border-tinta-700 rounded-xl overflow-hidden">
        {cargando ? (
          <p className="text-center text-tinta-400 py-16">Cargando...</p>
        ) : empleados.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto text-tinta-700" size={40} />
            <p className="text-tinta-400 mt-3">Todavía no has agregado empleados.</p>
            <button
              onClick={() => setModal('nuevo')}
              className="text-frambuesa-500 font-medium text-sm mt-2 hover:underline"
            >
              Agrega el primero
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tinta-700 text-left text-tinta-400">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Correo</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Sabores</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id} className="border-b border-tinta-700/60 last:border-0">
                  <td className="px-6 py-3 font-medium text-tinta-100">{e.nombre}</td>
                  <td className="px-6 py-3 text-tinta-400">{e.email}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTILO_ROL[e.rol] ?? ''}`}>
                      {ETIQUETAS_ROL[e.rol] ?? e.rol}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-tinta-400">
                    {e.sabores && e.sabores.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <IceCreamCone size={13} className="text-mango-400" />
                        {e.sabores.join(', ')}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.activo ? 'bg-lima-500/10 text-lima-500' : 'bg-tinta-700 text-tinta-400'
                      }`}
                    >
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => alternarEstado(e)}
                        title={e.activo ? 'Desactivar' : 'Activar'}
                        className="text-tinta-400 hover:text-mango-400 transition p-1"
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => setModal(e)}
                        className="text-tinta-400 hover:text-frambuesa-500 transition p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setAEliminar(e.id)}
                        className="text-tinta-400 hover:text-frambuesa-500 transition p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}