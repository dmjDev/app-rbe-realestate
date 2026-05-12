import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import fs from 'fs/promises';
import path from 'path';
import { PropertyItem } from '@/app/(client)/properties/controller/properties-controller';

export async function GET(req: NextRequest) {
  // CAPA DE SEGURIDAD: Validación por Token Secreto
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const secretToken = process.env.FEED_SECRET;

  if (!token || token !== secretToken) {
    return new NextResponse('Access Denied: Invalid or missing token', { status: 403 });
  }
  // -------------------------------------------------------------

  const urlBase = process.env.BETTER_AUTH_URL;

  const getProperties = async () => {
    try {
      const items = await prisma.items.findMany({
        where: { active: true },
        include: { iprops: true }
      });

      const rootUploads = path.join(process.cwd(), 'upload');

      // OBTENEMOS LOS DATOS DE FORMA ASINCRONA
      return await Promise.all(items.map(async (item: any) => {
        const itemIdStr = String(item.id);
        const itemDir = path.join(rootUploads, itemIdStr);
        let foundImages: string[] = [];

        try {
          await fs.access(itemDir);
          const files = await fs.readdir(itemDir);
          
          foundImages = files
            .filter(file => file.startsWith(`${itemIdStr}_`) && file.endsWith('.webp'))
            .sort((a, b) => {
              const numA = parseInt(a.split('_')[1] || '0');
              const numB = parseInt(b.split('_')[1] || '0');
              return numA - numB;
            })
            .map(file => `${urlBase}/api/images?path=${itemIdStr}/${file}`); 
        } catch {
          // ERROR LA CARPETA NO EXISTE
        }

        if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
          const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
          const addUrls = imagesArray.map((obj) => obj.url);
          foundImages = [...foundImages, ...addUrls];
        }

        return {
          itemId: itemIdStr,
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          itemRef: item.itemRef,
          active: item.active,
          operType: item.iprops.operType,
          propType: item.iprops.propType,
          updatedAt: item.iprops.updatedAt,
          price: Number(item.iprops.price),
          frequencyPay: item.iprops.frequencyPay,
          isNewDevelopment: item.iprops.isNewDevelopment,
          municipality: item.iprops.municipality,
          province: item.iprops.province,
          floor: item.iprops.floor,
          orientation: item.iprops.orientation,
          latitude: item.iprops.latitude,
          longitude: item.iprops.longitude,
          builtSize: item.iprops.builtSize,
          rooms: item.iprops.rooms,
          bathrooms: item.iprops.bathrooms,
          hasLift: item.iprops.hasLift,
          hasGarden: item.iprops.hasGarden,
          hasGarage: item.iprops.hasGarage,
          hasPool: item.iprops.hasPool,
          centralHeating: item.iprops.centralHeating,
          energyRating: item.iprops.energyRating,
          imgUrl: item.iprops.imgUrl,
          videoUrl: item.iprops.videoUrl,
          virtualTourUrl: item.iprops.virtualTourUrl,
          imagePaths: foundImages
        } as PropertyItem;
      }));
    } catch (error) {
      console.error("Error en Kyero getProperties:", error);
      return [];
    }
  }

  const properties = await getProperties();

  // Construir el XML
  const xmlItems = properties.map(p => `
    <property>
      <id>${p.itemId}</id>
      <date>${p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString()}</date>
      <ref>${p.itemRef}</ref>
      <price>${p.price}</price>
      <type>${p.propType}</type>
      <town>${p.municipality}</town>
      <province>${p.province}</province>
      <location>
        <latitude>${p.latitude}</latitude>
        <longitude>${p.longitude}</longitude>
      </location>
      <images>
        ${p.imagePaths.map((img, index) => `
          <image id="${index}">
            <url><![CDATA[${img}]]></url>
          </image>`).join('')}
      </images>
      <desc>
        <es><![CDATA[${p.itemDescription}]]></es>
        <en><![CDATA[${p.itemDescription}]]></en>
      </desc>
    </property>`).join('');

  const xmlFull = `<?xml version="1.0" encoding="UTF-8"?>
<kyero>
  <feed_version>3</feed_version>
  ${xmlItems}
</kyero>`;

  return new NextResponse(xmlFull, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate', 
    },
  });
}



// La URL ahora requiere llave: Para consumir el XML, tú le pasarás a Kyero o Idealista la URL estructurada de este modo: https://tudominio.com/api/kyero-feed?token=MiClaveSuperSecreta123. Si la competencia entra sin el ?token=..., se encuentra un muro 403 Access Denied.

// Uso de <![CDATA[ ... ]]>: Le he añadido etiquetas CDATA a las URLs de las imágenes y las descripciones. ¿Por qué? Porque tus URLs de imágenes contienen caracteres como el & (del parámetro &v=...). En XML, un ampersand suelto rompe el estándar y los portales te rechazarán el archivo por dar "Error de parseo XML". El CDATA le dice al lector: "Esto es texto plano, no te rompas".

// Alto rendimiento con Promise.all y map asíncrono: Al mutar de la versión Sync a la nativa asíncrona, Next.js puede procesar la lectura de carpetas de 50 inmuebles en paralelo en lugar de hacerlo uno por uno, reduciendo el tiempo de respuesta de la API drásticamente.