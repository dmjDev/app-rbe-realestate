import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink, access } from "fs/promises";
import path from "path";
import fs from "fs";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // MAX 10MB
const ALLOWED_VIDEO_TYPE = "video/mp4";

// SUBIR O REEMPLAZAR VIDEO
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get("video") as File;
    const itemId = data.get("itemId") as string;

    if (!file || !itemId) {
      return NextResponse.json({ error: "Data required" }, { status: 400 });
    }

    // CONTROL DE USUARIO
    const property = await prisma.items.findUnique({ where: { id: itemId } });
    if (!property || property.managerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validación de tipo y tamaño de archivo
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "The video exceeds the 50MB limit" }, { status: 413 });
    }
    if (file.type !== ALLOWED_VIDEO_TYPE) {
      return NextResponse.json({ error: "Only MP4 videos are allowed" }, { status: 400 });
    }

    // LIMPIAMOS EL DATO APORTADO
    const safeItemId = path.basename(itemId);
    const dirPath = path.join(process.cwd(), "uploadMedia", safeItemId);
    await mkdir(dirPath, { recursive: true });

    // Guardamos los bytes en buffer de forma segura
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(dirPath, `${safeItemId}.mp4`);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: "Video guardado con éxito" });
  } catch (e) {
    console.error("Error en POST video:", e);
    return NextResponse.json({ error: "Error procesando el video" }, { status: 500 });
  }
}

// 2. ELIMINAR VIDEO
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Falta el itemId" }, { status: 400 });
    }

    // CONTROL DE USUARIO
    const property = await prisma.items.findUnique({ where: { id: itemId } });
    if (!property || property.managerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // LIMPIAMOS EL DATO APORTADO
    const safeItemId = path.basename(itemId);
    const filePath = path.join(process.cwd(), "uploadMedia", safeItemId, `${safeItemId}.mp4`);

    try {
      await access(filePath, fs.constants.F_OK);
      // SI EXISTE LO BORRAMOS
      await unlink(filePath);
      return NextResponse.json({ success: true, message: "Video successfully deleted" });
    } catch {
      return NextResponse.json({ success: true, message: "The video did not exist or was already deleted" });
    }

  } catch (e) {
    console.error("Error en DELETE video:", e);
    return NextResponse.json({ error: "Error trying to delete the file" }, { status: 500 });
  }
}


