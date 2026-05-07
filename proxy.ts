import { NextRequest, NextResponse } from "next/server";

// proxy.ts
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionToken = request.cookies.get("better-auth.session_token");
  const browserSession = request.cookies.get("browser_session");
  const isFreshLogin = searchParams.get("fresh_login") === "true";

  // 1. SIEMPRE IGNORAR rutas de auth y estáticos
  if (
    pathname.startsWith("/auth") || 
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    // Si es un login social (Google) que viene con el flag, ponemos la cookie
    if (isFreshLogin && sessionToken && !browserSession) {
      const response = NextResponse.next();
      response.cookies.set("browser_session", "active", { path: "/", sameSite: "lax" });
      return response;
    }
    return NextResponse.next();
  }

  // 2. PROTECCIÓN DE RUTAS (Dashboard, Home, etc.)
  if (sessionToken && !browserSession) {
    // Si viene de Google/Social con el flag
    if (isFreshLogin) {
      const response = NextResponse.next();
      response.cookies.set("browser_session", "active", { path: "/", sameSite: "lax" });
      return response;
    }

    // REINICIO DETECTADO: El navegador se cerró y se abrió.
    // Solo redirigimos si NO estamos ya en la página de login
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("better-auth.session_data");
    return response;
  }

  return NextResponse.next();
}
