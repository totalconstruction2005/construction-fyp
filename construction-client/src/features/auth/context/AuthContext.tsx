/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService, type AuthUser } from "@shared/api/authService";
import { AUTH_LOGOUT_EVENT } from "@shared/api/apiClient";
import { CURRENT_USER, USER_TOKEN } from "@shared/constants/storageKeys";

export type User = AuthUser;

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<"authenticated" | "login">;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const persistSession = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(CURRENT_USER, JSON.stringify(nextUser));
    localStorage.setItem(USER_TOKEN, nextToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(USER_TOKEN);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = localStorage.getItem(USER_TOKEN);
        const storedUser = localStorage.getItem(CURRENT_USER);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else if (storedUser) {
          localStorage.removeItem(CURRENT_USER);
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [clearSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      navigate("/login", { replace: true });
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleUnauthorized as EventListener);
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleUnauthorized as EventListener);
    };
  }, [clearSession, navigate]);

  const login = async (email: string, password: string) => {
    const { user: nextUser, token: nextToken } = await authService.login(email, password);

    if (!nextToken) {
      throw new Error("Authentication token missing");
    }

    persistSession(nextUser, nextToken);
    return nextUser;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { user: nextUser, token: nextToken } = await authService.signup(name, email, password);

    if (nextToken) {
      persistSession(nextUser, nextToken);
      return "authenticated";
    }

    return "login";
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    signup,
    logout,
  }), [user, token, isLoading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
