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
    <div className="min-h-screen grid lg:grid-cols-2 bg-tinta-950">
      {/* Panel izquierdo: imagen de fondo + marca, con overlay oscuro para legibilidad */}
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center">
        {/* Capa 0: color base por si la imagen no carga */}
        <div className="absolute inset-0 bg-tinta-900" />

        {/* Capa 1: la imagen de fondo (reemplaza /public/login-bg.jpg por la que busques en Pinterest) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/graniz.jpeg')" }}
        />

        {/* Capa 2: velo oscuro degradado — esto es lo que garantiza que el texto se lea
            sin importar qué imagen pongas encima */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(13,12,20,0.92) 0%, rgba(13,12,20,0.75) 45%, rgba(13,12,20,0.88) 100%)',
          }}
        />

        {/* Capa 3: acentos de marca (blobs de color) por encima del velo, muy sutiles */}
        <div
          className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full opacity-40 blur-3xl animate-float-slow"
          style={{ background: 'radial-gradient(circle, #e11d74, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full opacity-30 blur-3xl animate-float-slow"
          style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)', animationDelay: '1.5s' }}
        />
        <div
          className="absolute top-1/3 right-10 w-72 h-72 rounded-full opacity-25 blur-3xl animate-float-slow"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent 70%)', animationDelay: '3s' }}
        />

        {/* Capa 4: contenido de marca */}
        <div className="relative z-10 text-center px-12 animate-fade-in-up">
          <h1 className="font-display text-5xl font-extrabold text-white leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]">
            Granizado<span className="text-blue-400">Express</span>
          </h1>
          <p className="text-white/80 mt-4 text-lg font-body drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            El negocio de tu granizadero, en un solo lugar.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {['Pedidos en tiempo real', 'Control de inventario', 'Ganancias día a día'].map((texto) => (
              <div key={texto} className="flex items-center gap-3 text-white/90">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]" />
                <span className="text-sm font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho: fondo oscuro, texto blanco legible, formulario con efecto */}
      <div className="flex items-center justify-center px-6 py-12 bg-tinta-950 relative overflow-hidden">
        {/* Resplandor sutil detrás de la tarjeta para dar profundidad */}
        <div
          className="absolute w-[26rem] h-[26rem] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent 70%)' }}
        />

        <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
          <h2 className="font-display text-3xl font-bold text-white">Inicia sesión</h2>
          <p className="text-tinta-400 mt-2 mb-8">Entra a tu panel para seguir vendiendo.</p>

          <form onSubmit={manejarSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/[0.07]
                           transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/[0.07]
                           transition"
              />
            </div>

            {error && (
              <p className="text-sm text-frambuesa-400 bg-frambuesa-500/10 border border-frambuesa-500/25 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg text-white font-semibold py-2.5 transition-all duration-300
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:animate-none
                         hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0
                         animate-glow-pulse"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 55%, #172554 100%)',
              }}
            >
              {cargando ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}