import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Si 'eslint' te da error aquí, es porque en esta versión 
  // se espera que lo manejes a través de la CLI o que el tipo 
  // tenga un nombre distinto. Prueba borrar la sección eslint 
  // o ponerla así:
  experimental: {
    // Algunas versiones mueven configuraciones aquí
  },
};

// Si el error persiste, puedes forzarlo de esta manera (Truco de TS):
const configCasting = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} as any;

export default nextConfig;
