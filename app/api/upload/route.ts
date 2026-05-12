import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB MAXIMO POR IMAGEN = VIDEOCOMPONENT.TSX
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const itemId = formData.get("itemId") as string;
    const files = formData.getAll("files") as File[];
    const keepImages = JSON.parse(formData.get("keepImages") as string || "[]");

    if (!itemId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // CONTROL DE USUARIO
    const property = await prisma.items.findUnique({ where: { id: itemId } });
    if (!property || property.managerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // LIMPIAMOS EL DATO APORTADO
    const safeItemId = path.basename(itemId); 
    const uploadDir = path.join(process.cwd(), "upload", safeItemId);
    await fs.mkdir(uploadDir, { recursive: true });

    let deletedFiles = 0;

    // Borrar archivos que ya no están en la lista 'keepImages'
    try {
      const diskFiles = await fs.readdir(uploadDir);
      for (const file of diskFiles) {
        if (!keepImages.includes(file)) {
          await fs.unlink(path.join(uploadDir, file));
          deletedFiles += 1;
        }
      }
    } catch (e) { /* Carpeta nueva o error de lectura, ignorar */ }

    const remainingFiles = await fs.readdir(uploadDir);
    let maxIndex = 0;

    remainingFiles.forEach(file => {
      const parts = file.split('_');
      if (parts.length > 1) {
        const num = parseInt(parts[1].split('.')[0]);
        if (!isNaN(num) && num > maxIndex) {
          maxIndex = num;
        }
      }
    });

    // GUARDADO DE NUEVOS ARCHIVOS
    let currentIndex = maxIndex + 1;
    const failedImages: string[] = [];
    let savedCount = 0;

    for (const file of files) {
      if (file.size === 0) continue; // Ignorar campos vacíos

      // Validación de tamaño y tipo de archivo
      if (file.size > MAX_FILE_SIZE) {
        console.error(`File rejected due to size (${file.name}): ${file.size} bytes`);
        failedImages.push(`${file.name} (Exceeds the size limit)`);
        continue;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        console.error(`File rejected due to invalid format (${file.name}): ${file.type}`);
        failedImages.push(`${file.name} (Format not allowed)`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Usamos el safeItemId limpio
        const fileName = `${safeItemId}_${currentIndex}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(buffer)
          .resize(3000, 2000, { fit: 'inside', withoutEnlargement: true })
          .toFormat('webp')
          .toFile(filePath);

        currentIndex++;
        savedCount++;
      } catch (sharpError) {
        console.error(`Sharp error processing ${file.name}:`, sharpError);
        failedImages.push(file.name);
      }
    }

    // Si fallaron algunas pero se guardó al menos una
    const partialError = failedImages.length > 0
      ? ` (Failure images: ${failedImages.join(", ")})`
      : "";

    if (savedCount === 0 && files.length > 0) {
      return NextResponse.json({
        error: "All images failed to process"
      }, { status: 400 });
    }

    let successMessage = 'No images to upload';
    if (savedCount > 0) {
      successMessage = `Successfully uploaded ${savedCount} images${partialError}`;
    }
    if (deletedFiles > 0) {
      successMessage += `\nSuccessfully deleted ${deletedFiles} images`;
    }
    return NextResponse.json({
      success: true,
      message: successMessage
    });
  } catch (error) {
    console.error("Error en API Upload:", error);
    return NextResponse.json({ error: "Error processing images, overflow memory" }, { status: 500 });
  }
}




