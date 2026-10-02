import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AuthContext } from "./AuthContextStore";

import { authService } from "../services/authService";

import {
  clearToken,
  getToken,
  setToken,
} from "../services/api";

export default function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [initializing, setInitializing] =
    useState(Boolean(getToken()));

  useEffect(() => {
    const token = getToken();

    if (!token) {
      return undefined;
    }

    let active = true;

    authService
      .getProfile()
      .then((response) => {
        if (active) {
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        if (
          active &&
          error.status === 401
        ) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response =
        await authService.login(credentials);

      setToken(response.data.token);
      setUser(response.data.user);
      setInitializing(false);

      return response;
    },
    []
  );

  const register = useCallback(
    async (payload) => {
      const response =
        await authService.register(payload);

      setToken(response.data.token);
      setUser(response.data.user);
      setInitializing(false);

      return response;
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setInitializing(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [
      user,
      initializing,
      login,
      register,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}