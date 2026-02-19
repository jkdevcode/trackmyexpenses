import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient, { setUnauthorizedHandler } from "@/lib/axiosClient";

interface User {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  foto: string | null;
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setUnauthorizedHandler(() => {
      if (isMounted) {
        setUser(null);
      }
    });

    const hydrateSession = async () => {
      try {
        const response = await axiosClient.get("/users/me");

        if (isMounted) {
          setUser(response.data.user ?? null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
