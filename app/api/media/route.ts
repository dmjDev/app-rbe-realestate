import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoPath = searchParams.get('path');

  if (!videoPath) return new NextResponse('Path missing', { status: 400 });

  const uploadDir = path.join(process.cwd(), 'uploadMedia');
  const filePath = path.join(uploadDir, videoPath);

  // CAPA DE SEGURIDAD
  if (!filePath.startsWith(uploadDir)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // SI EXISTE EL VIDEO
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch (error) {
    // Si no existe, devolvemos un 200 con JSON amigable para evitar errores en el formulario
    return NextResponse.json({
      error: false,
      exists: false,
      message: "No hay video para esta propiedad"
    }, { status: 200 });
  }

  try {
    const stats = await fs.promises.stat(filePath);
    const totalSize = stats.size;
    const range = request.headers.get('range');

    const commonHeaders: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    };

    // PETICION DE VIDEO PARCIAL (RANGO)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        return new NextResponse('Requested Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${totalSize}` }
        });
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() { fileStream.destroy(); }
      });

      return new NextResponse(webStream, {
        status: 206, // Partial Content
        headers: {
          ...commonHeaders,
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Content-Length': chunkSize.toString(),
        },
      });
    } 
    
    // PETICION DE VIDEO COMPLETO
    else {
      const fileStream = fs.createReadStream(filePath);
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() { fileStream.destroy(); }
      });

      return new NextResponse(webStream, {
        status: 200,
        headers: {
          ...commonHeaders,
          'Content-Length': totalSize.toString(),
        },
      });
    }

  } catch (e) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


