import prisma from "@/lib/prisma";
import PropertyGallery from "./components/PropertyGallery";
import { PropertyDetails } from "./components/PropertyDetails";
import path from 'path';
import fs from 'fs';

export default async function PropertiesIdPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ idSaved: string, userId: string, state: string, edit: string }>
}) {
  const { id } = await params;
  const { idSaved, userId, state, edit: editString } = await searchParams;
  const edit = editString === "true";

  // CONSULTA DB DATOS POR id
  const propertieData = await prisma.items.findUnique({
    where: { id: id },
    include: {
      iprops: true,
    },
  });

  if (!propertieData) {
    console.log('Data not found, id:', id);
    return <></>;
  }

  // 1. Desestructuramos el objeto único directamente
  const { iprops, id: itemId, createdAt, updatedAt, ...rest } = propertieData;

  // 2. Extraemos el contenido de iprops con alias para los conflictos
  const {
    id: ipropId,
    createdAt: ipropCreatedAt,
    updatedAt: ipropUpdatedAt,
    ...internalProps
  } = iprops || {};

  // 3. Creamos el objeto aplanado
  const flatPropertieData = {
    id: itemId,
    createdAt: createdAt?.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    updatedAt: updatedAt?.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    ...rest,
    ipropId: iprops?.id,
    ipropCreatedAt: iprops?.createdAt?.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    ipropUpdatedAt: iprops?.updatedAt?.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    ...internalProps,
  };

  // console.log('flatPropertieData', flatPropertieData);

  // CONSULTA API VIDEO POR id
  const rootUploadsMedia = path.join(process.cwd(), 'uploadMedia');
  const itemIdStr = String(id);
  const itemDir = path.join(rootUploadsMedia, itemIdStr);
  let foundVideo: string = "";

  if (fs.existsSync(itemDir)) {
    const files = fs.readdirSync(itemDir);
    foundVideo = files.find(file => file.endsWith('.mp4')) || "";
  }

  // console.log('props', flatPropertieData);
  // console.log('video', flatPropertieData.videoUrl)
  // console.log('tour', flatPropertieData.virtualTourUrl)
  // console.log('videServer', `${itemIdStr}/${foundVideo}`)
  const itemMedia = {
    videoServerPath: foundVideo ? `/api/media?path=${itemIdStr}/${foundVideo}&v=${Date.now()}` : "",
    videoUrlPath: flatPropertieData.videoUrl || "",
    virtualTourUrl: flatPropertieData.virtualTourUrl || ""
  };

  return (
    <section className="ancho-global">
      <PropertyGallery item={itemMedia} idSaved={idSaved} itemId={id} userId={userId} state={state} />
      <PropertyDetails property={flatPropertieData} edit={edit} />
    </section>
  );
}