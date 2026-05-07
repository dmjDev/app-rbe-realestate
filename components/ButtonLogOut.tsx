"use client"

import { signOut } from 'better-auth/api';
import { authClient } from "@/lib/auth/auth-client";

const ButtonLogOut = () => {
  const handleLogout = async () => {
    // 1. Limpias cliente
    sessionStorage.clear();
    
    // 2. Ejecutas el signOut del cliente (esto ya sabe ir a la API solo)
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/"; // Opcional: Redirigir manualmente
        },
      },
    });
  };

  return (
    <button onClick={handleLogout} className="textbutton text-center lg:text-left">Go out</button>
  )
}

export default ButtonLogOut