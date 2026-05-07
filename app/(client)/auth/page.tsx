import { auth } from "@/lib/auth/auth";
import AuthClientPage from "./AuthClientPage";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return <AuthClientPage />;
}
