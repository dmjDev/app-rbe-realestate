import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const itemId = formData.get("itemId") as string;
    const files = formData.getAll("files") as File[];
    const keepImages = JSON.parse(formData.get("keepImages") as string || "[]");
    let deletedFiles = 0;

    const uploadDir = path.join(process.cwd(), "upload", itemId);
    await fs.mkdir(uploadDir, { recursive: true });

    // 1. Borrar archivos que ya no están en la lista 'keepImages'
    try {
      const diskFiles = await fs.readdir(uploadDir);
      for (const file of diskFiles) {
        if (!keepImages.includes(file)) {
          await fs.unlink(path.join(uploadDir, file));
          deletedFiles += 1;
        }
      }
    } catch (e) { /* Carpeta nueva o error de lectura, ignorar */ }

    // 2. Determinar el índice máximo actual
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

    // 3. GUARDADO DE NUEVOS ARCHIVOS (Procesamiento Secuencial)
    // console.log(`Procesando ${files.length} archivos nuevos de forma secuencial...`);

    let currentIndex = maxIndex + 1;
    const failedImages: string[] = [];
    let savedCount = 0;

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${itemId}_${currentIndex}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(buffer)
          .resize(3000, 2000, { fit: 'inside', withoutEnlargement: true })
          .toFormat('webp')
          .toFile(filePath);

        currentIndex++;
        savedCount++;
      } catch (sharpError) {
        console.error(`Error with ${file.name}:`, sharpError);
        failedImages.push(file.name);
      }
    }

    // Si fallaron algunas pero se guardó al menos una, avisamos
    const partialError = failedImages.length > 0
      ? ` (Failure images: ${failedImages.join(", ")})`
      : "";

    // Si no se guardó ni una sola y había archivos para subir, enviamos error 500
    if (savedCount === 0 && files.length > 0) {
      return NextResponse.json({
        error: "All images failed to process"
      }, { status: 500 });
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

