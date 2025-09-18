import React from "react";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="mb-2 text-2xl font-semibold">Inicio</h1>
        <p className="text-gray-600">Selecciona una opción en la barra superior. Ve a <b>Planes</b> para gestionar tu Plan de Acción.</p>
      </main>
    </div>
  );
}
