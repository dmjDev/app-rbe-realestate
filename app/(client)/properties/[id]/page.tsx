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
  let flatPropertieData = null;

  // CONSULTA DB DATOS POR id
  const propertieData = await prisma.items.findUnique({
    where: { id: id },
    include: {
      iprops: true,
    },
  });

  if (propertieData) {
    // 1. Desestructuramos el objeto único directamente
    const { iprops, id, createdAt, updatedAt, ...rest } = propertieData;

    // 2. Extraemos el contenido de iprops con alias para los conflictos
    const {
      id: ipropId,
      createdAt: ipropCreatedAt,
      updatedAt: ipropUpdatedAt,
      ...internalProps
    } = iprops || {};

    // 3. Creamos el objeto aplanado
    const flattened = {
      id,
      createdAt: createdAt?.toLocaleString(),
      updatedAt: updatedAt?.toLocaleString(),
      ...rest,
      ipropId: iprops?.id,
      ipropCreatedAt: iprops?.createdAt?.toLocaleString(),
      ipropUpdatedAt: iprops?.updatedAt?.toLocaleString(),
      ...internalProps,
    };
    flatPropertieData = flattened;
  } else {
    console.log('Data not found, id:', id);
    return <></>;
  }
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