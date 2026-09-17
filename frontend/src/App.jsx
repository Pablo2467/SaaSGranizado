import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Insumos from './pages/Insumos';
import Pedidos from './pages/Pedidos';
import Empleados from './pages/Empleados';
import Suscripcion from './pages/Suscripcion';
import Ganancias from './pages/Ganancias';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <DashboardLayout />
              </RutaProtegida>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="productos"
              element={
                <RutaProtegida rolesPermitidos={['DUENO', 'ENCARGADO_PRODUCCION']}>
                  <Productos />
                </RutaProtegida>
              }
            />
            <Route
              path="insumos"
              element={
                <RutaProtegida rolesPermitidos={['DUENO', 'ENCARGADO_PRODUCCION']}>
                  <Insumos />
                </RutaProtegida>
              }
            />
            <Route path="pedidos" element={<Pedidos />} />
            <Route
              path="ganancias"
              element={
                <RutaProtegida rolesPermitidos={['DUENO', 'ENCARGADO_PRODUCCION']}>
                  <Ganancias />
                </RutaProtegida>
              }
            />
            <Route
              path="empleados"
              element={
                <RutaProtegida rolesPermitidos={['DUENO']}>
                  <Empleados />
                </RutaProtegida>
              }
            />
            <Route path="suscripcion" element={<Suscripcion />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;