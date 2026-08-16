import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Panel izquierdo: el elemento de firma, el "jarabe" de marca */}
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center bg-tinta-900">
        <div
          className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full opacity-70 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e11d74, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 right-10 w-72 h-72 rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #84cc16, transparent 70%)' }}
        />
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display text-5xl font-extrabold text-white leading-tight">
            Granizado<span className="text-frambuesa-500">Express</span>
          </h1>
          <p className="text-tinta-300 mt-4 text-lg font-body">
            El negocio de tu granizadero, en un solo lugar.
          </p>
        </div>
      </div>

      {/* Panel derecho: el formulario, limpio y funcional */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl font-bold text-tinta-900">Inicia sesión</h2>
          <p className="text-tinta-600 mt-2 mb-8">Entra a tu panel para seguir vendiendo.</p>

          <form onSubmit={manejarSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-tinta-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-lg border border-tinta-300/40 px-4 py-2.5 text-tinta-900
                           focus:outline-none focus:ring-2 focus:ring-frambuesa-500 focus:border-transparent
                           transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tinta-600 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-tinta-300/40 px-4 py-2.5 text-tinta-900
                           focus:outline-none focus:ring-2 focus:ring-frambuesa-500 focus:border-transparent
                           transition"
              />
            </div>

            {error && (
              <p className="text-sm text-frambuesa-600 bg-frambuesa-50 border border-frambuesa-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-frambuesa-500 text-white font-semibold py-2.5
                         hover:bg-frambuesa-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}