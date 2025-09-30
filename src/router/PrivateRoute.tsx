import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const disableAuth = import.meta.env.VITE_DISABLE_AUTH === "false";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  if (disableAuth) return children;
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
