'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function CleanUrlHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Si detectamos el flag en la URL
    if (searchParams.get('fresh_login') === 'true') {
      // Creamos una nueva lista de parámetros sin el 'fresh_login'
      const params = new URLSearchParams(searchParams.toString());
      params.delete('fresh_login');

      // Construimos la nueva URL (si quedan otros parámetros los deja, si no, solo el path)
      const queryString = params.toString();
      const cleanUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Reemplazamos la URL en el historial sin recargar la página
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [searchParams, pathname]);

  return null; // Este componente no renderiza nada, solo ejecuta la lógica
}
