import { useEffect, useState } from 'react';
import { Calendar, Sparkles, Check, Ban, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const estiloEstado = {
  ACTIVA: 'bg-lima-500/10 text-lima-500',
  VENCIDA: 'bg-frambuesa-500/10 text-frambuesa-500',
  CANCELADA: 'bg-tinta-700 text-tinta-400',
  PAUSADA: 'bg-mango-400/15 text-mango-400',
};

const PLANES = [
  { id: 'TRIAL', nombre: 'Prueba', precio: 'Gratis', limite: 'Hasta 5 productos' },
  { id: 'BASICO', nombre: 'Básico', precio: '$39.900/mes', limite: 'Hasta 30 productos' },
  { id: 'PRO', nombre: 'Pro', precio: '$79.900/mes', limite: 'Productos ilimitados' },
];

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Suscripcion() {
  const { esDueno } = useAuth();
  const [suscripcion, setSuscripcion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  function cargar() {
    setCargando(true);
    setError('');
    api.get('/suscripcion/estado')
      .then((res) => setSuscripcion(res.data))
      .catch((err) => {
        setError(err.response?.data?.message ?? 'No se pudo cargar tu suscripción.');
      })
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarPlan(plan) {
    setError('');
    setProcesando(true);
    try {
      const res = await api.post('/suscripcion/cambiar-plan', { plan });
      setSuscripcion(res.data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo activar el plan.');
    } finally {
      setProcesando(false);
    }
  }

  async function cancelar() {
    setError('');
    setProcesando(true);
    try {
      const res = await api.post('/suscripcion/cancelar');
      setSuscripcion(res.data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo cancelar el plan.');
    } finally {
      setProcesando(false);
    }
  }

  async function reactivar() {
    setError('');
    setProcesando(true);
    try {
      const res = await api.post('/suscripcion/reactivar');
      setSuscripcion(res.data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo reactivar el plan.');
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return <p className="text-tinta-400">Cargando...</p>;
  }

  if (!suscripcion) {
    return (
      <div className="max-w-md">
        <p className="text-frambuesa-500 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2 text-sm">
          {error || 'No se pudo cargar tu suscripción.'}
        </p>
        <button
          onClick={cargar}
          className="mt-3 text-sm text-tinta-400 hover:text-tinta-100 transition underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const estaCancelada = suscripcion.estado === 'CANCELADA' || suscripcion.estado === 'PAUSADA';

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-tinta-100">Suscripción</h2>
      <p className="text-tinta-400 mt-1">
        {esDueno
          ? 'Activa, cambia o cancela el plan de tu negocio.'
          : 'Estado del plan actual de tu empresa (solo el Dueño puede modificarlo).'}
      </p>

      {error && (
        <p className="mt-4 max-w-lg text-sm text-frambuesa-500 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Estado actual */}
      <div className="mt-6 max-w-lg bg-tinta-900 rounded-xl border border-tinta-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-frambuesa-500/10 flex items-center justify-center">
              <Sparkles className="text-frambuesa-500" size={20} />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-tinta-100">{suscripcion.plan}</p>
              {suscripcion.esTrial && <p className="text-xs text-tinta-400">Periodo de prueba</p>}
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estiloEstado[suscripcion.estado] ?? ''}`}>
            {suscripcion.estado}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-tinta-700 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-tinta-400" size={16} />
            <span className="text-tinta-400">Vence el</span>
            <span className="text-tinta-100 font-medium ml-auto">
              {formatoFecha.format(new Date(suscripcion.fechaVencimiento))}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-tinta-400">Días restantes</span>
              <span className="text-tinta-100 font-medium">{suscripcion.diasRestantes} días</span>
            </div>
            <div className="h-2 rounded-full bg-tinta-700 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (suscripcion.diasRestantes / 30) * 100)}%`,
                  background: 'linear-gradient(90deg, #e11d74, #fb923c)',
                }}
              />
            </div>
          </div>
        </div>

        {esDueno && estaCancelada && (
          <button
            onClick={reactivar}
            disabled={procesando}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-azul-600 to-azul-800 text-white font-semibold py-2.5
                       shadow-[0_8px_24px_-6px_rgba(11,22,51,0.9)] border border-white/10
                       hover:from-azul-500 hover:to-azul-700 transition disabled:opacity-60"
          >
            <RotateCcw size={16} />
            Reactivar plan
          </button>
        )}
      </div>

      {/* Planes disponibles: solo el Dueño puede activarlos/cambiarlos */}
      {esDueno && (
        <div className="mt-8">
          <h3 className="font-display text-lg font-bold text-tinta-100 mb-4">Planes disponibles</h3>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
            {PLANES.map((p) => {
              const esActual = p.id === suscripcion.plan && suscripcion.estado === 'ACTIVA';
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-5 flex flex-col ${
                    esActual ? 'border-frambuesa-500 bg-frambuesa-500/5' : 'border-tinta-700 bg-tinta-900'
                  }`}
                >
                  <p className="font-display font-bold text-tinta-100">{p.nombre}</p>
                  <p className="text-2xl font-extrabold text-tinta-100 mt-2">{p.precio}</p>
                  <p className="text-xs text-tinta-400 mt-1">{p.limite}</p>

                  <button
                    onClick={() => cambiarPlan(p.id)}
                    disabled={procesando || esActual}
                    className={`mt-5 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                      esActual
                        ? 'bg-frambuesa-500/15 text-frambuesa-500'
                        : 'bg-gradient-to-b from-azul-600 to-azul-800 text-white border border-white/10 shadow-[0_8px_24px_-6px_rgba(11,22,51,0.9)] hover:from-azul-500 hover:to-azul-700'
                    }`}
                  >
                    {esActual ? (
                      <>
                        <Check size={15} /> Plan actual
                      </>
                    ) : (
                      'Activar este plan'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {!estaCancelada && suscripcion.estado === 'ACTIVA' && (
            <button
              onClick={cancelar}
              disabled={procesando}
              className="mt-6 flex items-center gap-2 text-sm text-tinta-400 hover:text-frambuesa-500 transition disabled:opacity-60"
            >
              <Ban size={15} />
              Cancelar suscripción
            </button>
          )}
        </div>
      )}
    </div>
  );
}