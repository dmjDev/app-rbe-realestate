import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
// IMPORTANTE: Usa "import type" para no importar lógica de servidor en el cliente
import type { auth } from "./auth"

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    inferAdditionalFields<typeof auth>(), // Esto lee la config de 'additionalFields' de arriba para añadir userRol a los datos de session
  ]
})

// Tipado extra para mayor seguridad en el cliente
export type SessionUser = typeof authClient.$Infer.Session.user & {
  roleName: string;
};
