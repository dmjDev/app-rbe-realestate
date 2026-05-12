import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs'; 
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get('path');

  if (!imagePath) return new NextResponse('Path missing', { status: 400 });

  const basePath = path.join(process.cwd(), 'upload');
  const filePath = path.join(basePath, imagePath);

  // CAPA DE SEGURIDAD
  if (!filePath.startsWith(basePath)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);

    // STREAM
    const nodeStream = fs.createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*', // ACCESO A KYERO
      },
    });

  } catch (e) {
    // NO EXISTE O ERROR
    return new NextResponse('Not Found', { status: 404 });
  }
}


