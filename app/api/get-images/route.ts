import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json([], { status: 400 });

  const dirPath = path.join(process.cwd(), "upload", id);

  try {
    const files = await fs.readdir(dirPath);
    // Filtramos para asegurarnos de que solo enviamos archivos (por si hay carpetas)
    const images = files.filter(file => 
      file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')
    );
    return NextResponse.json(images);
  } catch (error) {
    // Si la carpeta no existe, simplemente devolvemos un array vacío
    return NextResponse.json([]);
  }
}