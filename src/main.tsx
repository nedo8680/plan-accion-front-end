import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SeguimientoPage from "./pages/SeguimientoPage";
import Home from "./pages/Home";
import PrivateRoute from "./router/PrivateRoute";
import Captura from "./pages/Captura";
import Reportes from "./pages/Reportes";
import "./index.css";
import RouteErrorBoundary from "./router/RouteErrorBoundary";
import GlobalConnectionBanner from "./components/GlobalConnectionBanner";

function RootShell() {
  return (
    <>
      <GlobalConnectionBanner />
      <Outlet /> {/* Aquí se renderiza la ruta hija */}
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootShell />, 
    errorElement: <RouteErrorBoundary />,
    children: [
      // 🔓 Landing pública
      { path: "/", element: <Home />, errorElement: <RouteErrorBoundary /> },

      // 🔓 Login público
      { path: "/login", element: <LoginPage />, errorElement: <RouteErrorBoundary /> },

      // 🔐 Rutas protegidas
      { path: "/seguimiento", element: <PrivateRoute><SeguimientoPage /></PrivateRoute>, errorElement: <RouteErrorBoundary /> },
      { path: "/captura",     element: <PrivateRoute><Captura /></PrivateRoute>,       errorElement: <RouteErrorBoundary /> },
      { path: "/reportes",    element: <PrivateRoute><Reportes /></PrivateRoute>,      errorElement: <RouteErrorBoundary /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
