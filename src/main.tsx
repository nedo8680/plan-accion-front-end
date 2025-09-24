import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SeguimientoPage from "./pages/SeguimientoPage";
import Home from "./pages/Home";
import PrivateRoute from "./router/PrivateRoute";
import Captura from "./pages/Captura";
import Reportes from "./pages/Reportes";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <PrivateRoute><Home /></PrivateRoute> },
  { path: "/login", element: <LoginPage /> },
  { path: "/seguimiento", element: <PrivateRoute><SeguimientoPage /></PrivateRoute> },
  { path: "/captura", element: <PrivateRoute><Captura /></PrivateRoute> },
  { path: "/reportes", element: <PrivateRoute><Reportes /></PrivateRoute> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
