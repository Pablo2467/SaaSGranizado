import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [empresa, setEmpresa] = useState(() => {
    const guardada = localStorage.getItem('empresaNombre');
    return guardada || null;
  });

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('empresaNombre', data.empresaNombre);

    setToken(data.token);
    setEmpresa(data.empresaNombre);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('empresaNombre');
    setToken(null);
    setEmpresa(null);
  }

  const estaAutenticado = !!token;

  return (
    <AuthContext.Provider value={{ token, empresa, login, logout, estaAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado: así, en cualquier componente, en vez de
// importar useContext + AuthContext cada vez, solo llamas useAuth().
export function useAuth() {
  return useContext(AuthContext);
}