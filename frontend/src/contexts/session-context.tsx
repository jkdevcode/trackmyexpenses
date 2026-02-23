import React, { createContext, useContext, useEffect, useReducer } from "react";

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
  type SessionState = {
    user: User | null;
    loading: boolean;
  };
  type SessionAction =
    | { type: "SET_SESSION"; payload: User | null }
    | { type: "FINISH_LOADING" };
  const [state, dispatch] = useReducer(
    (currentState: SessionState, action: SessionAction): SessionState => {
      switch (action.type) {
        case "SET_SESSION":
          return { ...currentState, user: action.payload };
        case "FINISH_LOADING":
          return { ...currentState, loading: false };
        default:
          return currentState;
      }
    },
    { user: null, loading: true },
  );

  useEffect(() => {
    let isMounted = true;

    setUnauthorizedHandler(() => {
      if (isMounted) {
        dispatch({ type: "SET_SESSION", payload: null });
      }
    });

    const hydrateSession = async () => {
      try {
        const response = await axiosClient.get("/users/me");

        if (isMounted) {
          dispatch({
            type: "SET_SESSION",
            payload: response.data.user ?? null,
          });
        }
      } catch {
        if (isMounted) {
          dispatch({ type: "SET_SESSION", payload: null });
        }
      } finally {
        if (isMounted) {
          dispatch({ type: "FINISH_LOADING" });
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
    dispatch({ type: "SET_SESSION", payload: newUser });
  };

  const logout = () => {
    dispatch({ type: "SET_SESSION", payload: null });
  };

  return (
    <SessionContext.Provider
      value={{
        user: state.user,
        isAuthenticated: !!state.user,
        login,
        logout,
        loading: state.loading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
