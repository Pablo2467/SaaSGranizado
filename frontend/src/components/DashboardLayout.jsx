import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, IceCreamCone, Wheat, ClipboardList, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const enlaces = [
  { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/productos', label: 'Productos', icon: IceCreamCone },
  { to: '/dashboard/insumos', label: 'Insumos', icon: Wheat },
  { to: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/dashboard/suscripcion', label: 'Suscripción', icon: CreditCard },
];

export default function DashboardLayout() {
  const { empresa, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#F8F9FB]">
      {/* Barra de firma de marca, sutil, arriba de todo */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{ background: 'linear-gradient(90deg, #e11d74, #fb923c, #84cc16)' }}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-tinta-300/20 flex flex-col pt-1">
        <div className="px-6 py-6">
          <h1 className="font-display font-extrabold text-xl text-tinta-900">
            Granizado<span className="text-frambuesa-500">Express</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {enlaces.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-frambuesa-50 text-frambuesa-600'
                    : 'text-tinta-600 hover:bg-tinta-900/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-tinta-300/20">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-tinta-600 hover:bg-tinta-900/5 transition w-full"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido de cada pantalla */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-tinta-300/20 flex items-center justify-between px-8 pt-1">
          <div />
          <div className="flex items-center gap-2 text-sm text-tinta-600">
            <div className="w-8 h-8 rounded-full bg-frambuesa-500 text-white flex items-center justify-center font-semibold text-xs">
              {empresa?.charAt(0) ?? '?'}
            </div>
            {empresa}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}