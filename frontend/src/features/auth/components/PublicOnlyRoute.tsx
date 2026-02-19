import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/contexts/session-context";
import { Spinner } from "@heroui/spinner";

export const PublicOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
