// src/pages/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="relative  h-screen w-full"> 
      {/* Imagen de fondo */}
      <img
        src="/images/slider-bogota-3-optimized.jpg"
        alt="Panorámica de Bogotá"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />

      {/* Overlay para contraste */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Contenido (hero) */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center px-4 py-10 md:py-16 lg:py-20">
        <div className="max-w-3xl">
          {/* Caja translúcida para legibilidad */}
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm shadow-lg ring-1 ring-white/20">
            <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow md:text-4xl">
              ¡Bienvenido a la herramienta que transformará la calidad del servicio en Bogotá!
            </h1>

            <p className="mt-4 text-base leading-relaxed text-white/90 md:text-lg">
              Con este sistema, la Secretaría General de la Alcaldía Mayor puede medir de manera automática y precisa la
              satisfacción de los ciudadanos en todos los canales de atención: presencial, virtual y telefónico.
              <br />
              Captura datos clave, genera reportes detallados y haz seguimiento a los planes de mejora para garantizar un
              servicio público más eficiente, transparente y cercano a la ciudadanía.
            </p>

            {/* CTAs opcionales (borra si no los necesitas) */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/captura"
                className="rounded-md bg-yellow-400 px-5 py-2.5 font-semibold text-black shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Deja un degradado inferior sutil (opcional) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
