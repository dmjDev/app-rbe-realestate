import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const uId = searchParams.get("uId");

  if (!id) return NextResponse.json([], { status: 400 });
  if (session.user.id !== uId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const safeId = path.basename(id);
  const dirPath = path.join(process.cwd(), "upload", safeId);

  try {
    const files = await fs.readdir(dirPath);
    // FILTRADO - SOLO ESTOS TIPOS DE ARCHIVOS
    const images = files.filter(file => 
      file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')
    );
    return NextResponse.json(images);
  } catch (error) {
    // NO EXISTE
    return NextResponse.json([]);
  }
}