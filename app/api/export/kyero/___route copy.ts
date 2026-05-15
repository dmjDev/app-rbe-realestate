import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import { PropertyItem } from '@/app/(client)/properties/controller/properties-controller';

export async function GET() {
  const urlBase = process.env.BETTER_AUTH_URL;
  // 1. Obtener inmuebles de Postgres
  const getProperties = async () => {
    try {
      const items = await prisma.items.findMany({
        where: { active: true },
        include: { iprops: true }
      });

      const rootUploads = path.join(process.cwd(), 'upload');

      return items.map((item: any) => {
        const itemIdStr = String(item.id);
        const itemDir = path.join(rootUploads, itemIdStr);
        let foundImages: string[] = [];

        if (fs.existsSync(itemDir)) {
          const files = fs.readdirSync(itemDir);
          foundImages = files
            .filter(file => file.startsWith(`${itemIdStr}_`) && file.endsWith('.webp'))
            .sort((a, b) => {
              const numA = parseInt(a.split('_')[1] || '0');
              const numB = parseInt(b.split('_')[1] || '0');
              return numA - numB;
            })
            .map(file => `${urlBase}/api/images?path=${itemIdStr}/${file}&v=${Date.now()}`); //&media=false`);
        }

        if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
          const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
          const addUrls = imagesArray.map((obj) => obj.url);
          foundImages = [...foundImages, ...addUrls];
        }

        // console.log('foundImages', foundImages)

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
      });
    } catch (error) {
      console.error("Error en Kyero getProperties:", error);
      return [];
    }
  }

  const properties = await getProperties();

  // 2. Construir el XML (Template String)
  // Usamos una estructura compatible con el estándar Kyero v3
  const xmlItems = properties.map(p => `
    <property>
      <id>${p.itemId}</id>
      <date>${p.updatedAt.toISOString()}</date>
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
            <url>${img}</url>
          </image>`).join('')}
      </images>
      <desc>
        <es>${p.itemDescription}</es>
        <en>${p.itemDescription}</en>
      </desc>
    </property>`).join('');

  const xmlFull = `<?xml version="1.0" encoding="UTF-8"?>
<kyero>
  <feed_version>3</feed_version>
  ${xmlItems}
</kyero>`;

  // 3. Responder con el Content-Type correcto
  return new NextResponse(xmlFull, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache de 1 hora
    },
  });
}
