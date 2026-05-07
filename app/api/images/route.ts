import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get('path');

  if (!imagePath) return new NextResponse('Path missing', { status: 400 });

  const filePath = path.join(process.cwd(), 'upload', imagePath);

  // Seguridad: Impedir salir de la carpeta upload
  if (!filePath.startsWith(path.join(process.cwd(), 'upload'))) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  try {
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (e) {
    return new NextResponse('Error', { status: 500 });
  }

  return new NextResponse('Not Found', { status: 404 });
}