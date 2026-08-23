import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, ETIQUETAS_ROL } from '../context/AuthContext';
import { LayoutDashboard, IceCreamCone, Wheat, ClipboardList, LineChart, Users, CreditCard, LogOut, Snowflake } from 'lucide-react';

const enlaces = [
  { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true, roles: null },
  { to: '/dashboard/productos', label: 'Productos', icon: IceCreamCone, roles: ['DUENO', 'ENCARGADO_PRODUCCION'] },
  { to: '/dashboard/insumos', label: 'Insumos', icon: Wheat, roles: ['DUENO', 'ENCARGADO_PRODUCCION'] },
  { to: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList, roles: null },
  { to: '/dashboard/empleados', label: 'Empleados', icon: Users, roles: ['DUENO'] },
  { to: '/dashboard/suscripcion', label: 'Suscripción', icon: CreditCard, roles: null },
  { to: '/dashboard/ganancias', label: 'Ganancias', icon: LineChart, roles: ['DUENO', 'ENCARGADO_PRODUCCION'] },
];

export default function DashboardLayout() {
  const { empresa, rol, logout } = useAuth();
  const enlacesVisibles = enlaces.filter((e) => !e.roles || e.roles.includes(rol));

  return (
    <div className="min-h-screen flex bg-tinta-950">
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{ background: 'linear-gradient(90deg, #2f66f0, #06b6d4, #5b8bff, #22d3ee)', backgroundSize: '200% 100%' }}
      />

      <aside className="w-64 bg-tinta-900/80 backdrop-blur-xl border-r border-tinta-700/60 flex flex-col pt-1">
        <div className="px-6 py-6 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-azul-500 to-cian-400 flex items-center justify-center shadow-lg shadow-azul-500/30">
            <Snowflake size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-lg text-tinta-100 leading-tight">
            Granizado<span className="bg-gradient-to-r from-azul-400 to-cian-400 bg-clip-text text-transparent">Express</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {enlacesVisibles.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition relative ${
                  isActive
                    ? 'bg-azul-500/12 text-azul-300'
                    : 'text-tinta-400 hover:bg-white/5 hover:text-tinta-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-azul-400 to-cian-400" />
                  )}
                  <Icon size={18} className={isActive ? 'text-azul-400' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-tinta-700/60">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-tinta-400 hover:bg-frambuesa-500/10 hover:text-frambuesa-400 transition w-full"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-tinta-900/60 backdrop-blur-xl border-b border-tinta-700/60 flex items-center justify-between px-8 pt-1">
          <div />
          <div className="flex items-center gap-3 text-sm text-tinta-400">
            {rol && (
              <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-azul-500/10 text-azul-300 font-medium border border-azul-500/20">
                {ETIQUETAS_ROL[rol] ?? rol}
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-azul-500 to-cian-400 text-white flex items-center justify-center font-semibold text-xs shadow-md shadow-azul-500/30">
                {empresa?.charAt(0) ?? '?'}
              </div>
              {empresa}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}