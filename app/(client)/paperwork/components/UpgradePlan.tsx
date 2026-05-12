"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { auth } from "@/lib/auth/auth";
import { updateUserRol } from "@/lib/auth/auth-actions";
import MsgError from "@/components/MsgError";
import MsgSuccess from "@/components/MsgSuccess";

type Session = typeof auth.$Infer.Session;
interface UpgradePlanProps {
  rol: number;
  session: Session;
}

const UpgradePlan = ({ rol, session }: UpgradePlanProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpgrade = async () => {
    setIsPending(true);

    try {
      const result = await updateUserRol(session.user.id, rol);

      if (!result.success) {
        setError(result.error as string);
        throw new Error(result.error);
      }

      // Forzamos a BetterAuth a volver a pedir la sesión.
      // Al pasarle 'force: true', el cliente ignora la caché local,
      // hace una petición al backend, lee el nuevo 'userRol' de la BD y actualiza la sesión activa.
      const { data, error } = await authClient.getSession({
        fetchOptions: {
          cache: "no-store", // Evita que el navegador cachee la respuesta
        },
      });

      if (error) {
        console.error("Error al actualizar la sesión de BetterAuth:", error);
        setError('The role was updated in the database, but there was a problem refreshing the session. Please push F5');
        return;
      }

      setTimeout(() => {
        router.refresh();
      }, 2000);

      setSuccess("Your plan has been successfully updated! Congratulations!");

    } catch (error) {
      console.error("Error en el proceso:", error);
      setError("The update could not be processed. Try again please.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleUpgrade}
        disabled={isPending || session.user.userRol >= 10}
        className="basebutton appbutton text-center disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Get Your FREE Plan for a month"}
      </button>
      <div className="mt-5">
        {error && (<MsgError error={error} />)}
        {success && (<MsgSuccess success={success} />)}
      </div>
    </>
  );
};

export default UpgradePlan;