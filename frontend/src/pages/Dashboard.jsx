import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { empresa } = useAuth();
  const [suscripcion, setSuscripcion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/suscripcion/estado')
      .then((res) => setSuscripcion(res.data))
      .catch(() => setSuscripcion(null))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-tinta-100">
        Hola, {empresa} 👋
      </h2>
      <p className="text-tinta-400 mt-1">Aquí tienes un resumen de tu negocio.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-tinta-900 rounded-xl border border-tinta-700 p-5">
          <p className="text-sm text-tinta-400">Tu plan</p>
          {cargando ? (
            <p className="mt-2 text-tinta-700">Cargando...</p>
          ) : suscripcion ? (
            <>
              <p className="font-display text-2xl font-bold text-tinta-100 mt-1">
                {suscripcion.plan}
              </p>
              <p className="text-sm text-tinta-400 mt-1">
                {suscripcion.diasRestantes} días restantes
              </p>
            </>
          ) : (
            <p className="mt-2 text-blue-500">No se pudo cargar</p>
          )}
        </div>
      </div>
    </div>
  );
}