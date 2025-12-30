import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/contexts/session-context";
import { Spinner } from "@heroui/spinner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useSession();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the attempted location
        return <Navigate state={{ from: location }} to="/login" replace />;
    }

    return children;
};
