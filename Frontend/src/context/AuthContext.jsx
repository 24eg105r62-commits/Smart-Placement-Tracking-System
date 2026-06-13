import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api, { registerAuthHandlers, setAccessToken } from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const applySession = useCallback((nextUser, token) => {
    setAccessToken(token || null);
    setUser(nextUser || null);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/refresh', null, { headers: { skipAuth: true } });
      const { user: refreshedUser, accessToken } = data.data;
      applySession(refreshedUser, accessToken);
      return accessToken;
    } catch (err) {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    registerAuthHandlers({
      refreshHandler: refreshSession,
      authFailedHandler: clearSession,
    });

    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession, clearSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password }, { headers: { skipAuth: true } });
    const { user: loggedInUser, accessToken } = data.data;
    applySession(loggedInUser, accessToken);
    return loggedInUser;
  }, [applySession]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload, { headers: { skipAuth: true } });
    const { user: registeredUser, accessToken } = data.data;
    applySession(registeredUser, accessToken);
    return registeredUser;
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshMe = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    role: user?.role || null,
    login,
    register,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
