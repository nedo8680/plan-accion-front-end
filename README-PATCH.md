# Patch: agrega @vitejs/plugin-react

Pasos rápidos:
1) Reemplaza tu `package.json` por este (versión 0.0.2) o ejecuta:
   npm i -D @vitejs/plugin-react
2) Asegúrate que tu `vite.config.ts` importe el plugin:

   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   export default defineConfig({ plugins: [react()] })

3) Instala dependencias:
   npm i
4) Levanta dev:
   npm run dev
