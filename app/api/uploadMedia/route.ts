import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { unlink } from "fs/promises";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("video") as File;
    const itemId = data.get("itemId") as string; // El ID de la DB

    if (!file || !itemId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ruta: /uploadMedia/[id]/[id].mp4
    const dirPath = path.join(process.cwd(), "uploadMedia", itemId);
    await mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, `${itemId}.mp4`);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const filePath = path.join(process.cwd(), "uploadMedia", itemId!, `${itemId}.mp4`);

    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}