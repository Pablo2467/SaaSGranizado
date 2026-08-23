import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Etiquetas legibles para mostrar el rol en la interfaz.
export const ETIQUETAS_ROL = {
  DUENO: 'Dueño',
  ENCARGADO_PRODUCCION: 'Encargado de Producción',
  OPERADOR_MAQUINA: 'Operador de Máquina',
  CAJERO: 'Vendedor / Cajero',
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [empresa, setEmpresa] = useState(() => localStorage.getItem('empresaNombre') || null);
  const [rol, setRol] = useState(() => localStorage.getItem('rol') || null);
  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  // Al recargar la página solo tenemos el token guardado; recuperamos
  // el usuario completo (rol, sabores, etc.) desde el backend.
  useEffect(() => {
    if (!token) {
      setCargandoUsuario(false);
      return;
    }
    api.get('/auth/me')
      .then((res) => {
        setUsuario(res.data);
        setRol(res.data.rol);
        localStorage.setItem('rol', res.data.rol);
      })
      .catch(() => logout())
      .finally(() => setCargandoUsuario(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('empresaNombre', data.empresaNombre);
    localStorage.setItem('rol', data.rol);

    setToken(data.token);
    setEmpresa(data.empresaNombre);
    setRol(data.rol);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('empresaNombre');
    localStorage.removeItem('rol');
    setToken(null);
    setEmpresa(null);
    setRol(null);
    setUsuario(null);
  }

  const estaAutenticado = !!token;
  const esDueno = rol === 'DUENO';

  return (
    <AuthContext.Provider
      value={{ token, empresa, rol, usuario, cargandoUsuario, login, logout, estaAutenticado, esDueno }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado: así, en cualquier componente, en vez de
// importar useContext + AuthContext cada vez, solo llamas useAuth().
export function useAuth() {
  return useContext(AuthContext);
}