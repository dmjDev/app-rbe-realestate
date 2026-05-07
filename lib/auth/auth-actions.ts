"use server"

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const signUp = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: "/auth",
      urlSearch: "",
    },
    headers: await headers()
  })

  // Si el usuario se creó, solicitamos el envío del código OTP
  if (result.user) {
    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification"
      }
    });
  }

  return result;
}
// VERIFICACIÓN OTP DEL LADO DEL SERVIDOR [VERIFICATION OTP] para validar el código desde el servidor
export const verifyOTP = async (email: string, otp: string) => {
  try {
    const result = await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
      headers: await headers(),
    });
    return { success: true, data: result };
  } catch (error: any) {
    return {
      error: true,
      status: error.status || 500,
      message: error.message,
      code: error.code // Better Auth suele enviar códigos como "TOO_MANY_ATTEMPTS"
    };
  }
}

export const signInSocial = async (provider: "github" | "google") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      // callbackURL: "/",
      // El proxy detectará esto y creará la browser_session (PROXI.TS)
      // GENERAMOS UNA COOKIE PARA QUE AL INCIAR DE NUEVO LA APP AL ABRIR EL NAVEGADOR LA DETECTE POR SI SE QUEDÓ UNA SESION ABIERTA Y ASI CERRARLA
      callbackURL: "/?fresh_login=true",
    }
  })

  if (url) {
    redirect(url);
  }
}

export const signOut = async () => {
  await auth.api.signOut({ headers: await headers() })
  redirect('/');
}

export async function checkEmailExists(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: { id: true } // Solo seleccionamos el ID por eficiencia
    })

    return !!user // Retorna true si existe, false si no
  } catch (error) {
    console.error("Error al verificar email:", error)
    throw new Error("Server error during email access")
  }
}
