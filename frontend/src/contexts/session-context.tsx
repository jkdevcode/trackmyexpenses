import React, { createContext, useContext, useEffect, useReducer } from "react";

import axiosClient, { setUnauthorizedHandler } from "@/lib/axiosClient";
import {
  logoutRequest,
  type SessionUser,
} from "@/features/auth/services/authService";

interface SessionContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (user: SessionUser) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  loading: true,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  type SessionState = {
    user: SessionUser | null;
    loading: boolean;
  };
  type SessionAction =
    | { type: "SET_SESSION"; payload: SessionUser | null }
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
        const response = await axiosClient.get<{ user: SessionUser | null }>(
          "/users/me",
        );

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

  const login = (newUser: SessionUser) => {
    dispatch({ type: "SET_SESSION", payload: newUser });
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Always clear local session, even if backend logout endpoint fails.
    } finally {
      dispatch({ type: "SET_SESSION", payload: null });
    }
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
