import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoPath = searchParams.get('path');

  if (!videoPath) return new NextResponse('Path missing', { status: 400 });

  const filePath = path.join(process.cwd(), 'uploadMedia', videoPath);

  // Seguridad: Impedir salir de la carpeta uploadMedia
  const uploadDir = path.join(process.cwd(), 'uploadMedia');
  if (!filePath.startsWith(uploadDir)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);

      // Creamos un ReadableStream desde el archivo
      const fileStream = fs.createReadStream(filePath);

      // @ts-ignore - Conversión de stream de Node a stream Web para Next.js
      const readableStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': stats.size.toString(),
          // Importante para videos: permite saltar a partes específicas del video
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } else {
      return NextResponse.json({
        error: true,
        message: "Video doesn't exist"
      }, { status: 200 });
    }
  } catch (e) {
    return new NextResponse('Error', { status: 500 });
  }
}
