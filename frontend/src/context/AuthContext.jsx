import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const loadStoredSession = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    token,
    alias: localStorage.getItem('alias'),
    isDirectorio: localStorage.getItem('isDirectorio') === 'true',
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
  };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(loadStoredSession);
  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('alias', data.alias);
    localStorage.setItem('isDirectorio', String(data.isDirectorio));
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
    setSession(data);
  };
  const logout = () => {
    localStorage.clear();
    setSession(null);
  };
  const hasPermission = (permission) => {
    if (!session) return false;
    if (session.isDirectorio) return true;
    return session.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);