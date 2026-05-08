"use server"

import prisma from "@/lib/prisma"; // Tu instancia de Prisma o cliente Postgres
import { revalidatePath, revalidateTag } from "next/cache";
import { PropertyFullDetail } from "../schemas/formInterface";

export async function createItemWithProperty(data: any, userId: string) {
  try {
    // Usamos una transacción para que ambos inserts sean atómicos
    const result = await prisma.$transaction(async (tx) => {

      // 1. Primer Insert en "items"
      const newItem = await tx.items.create({
        data: {
          managerId: userId,
          itemName: data.itemName,
          itemDescription: data.itemDescription,
          itemRef: data.itemRef,
        },
      });

      // 2. Segundo Insert en "properties" usando el ID obtenido
      // Extraemos features y el resto de campos
      const { features, ...rest } = data;

      await tx.property.create({
        data: {
          itemId: newItem.id,
          isOwner: data.isOwner,
          operType: data.operType,
          propType: data.propType,
          price: parseFloat(data.price),
          priceMin: data.priceMin ? parseFloat(data.priceMin) : undefined,
          frequencyPay: data.frequencyPay || null,
          isNewDevelopment: data.isNewDevelopment,
          builtYear: data.builtYear ? parseFloat(data.builtYear) : undefined,
          province: data.province,
          municipality: data.municipality,
          neighborhood: data.neighborhood,
          streetName: data.streetName,
          streetNumber: data.streetNumber,
          floor: data.floor,
          isExterior: data.isExterior,
          showAddress: data.showAddress,
          orientation: data.orientation || null,
          latitude: data.latitude ? parseFloat(data.latitude) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude) : undefined,
          builtSize: data.builtSize ? parseFloat(data.builtSize) : undefined,
          usefulSize: data.usefulSize ? parseFloat(data.usefulSize) : undefined,
          rooms: parseInt(data.rooms),
          bathrooms: parseInt(data.bathrooms),
          flooringMaterial: data.flooringMaterial || null, // Mapeado a flooringMaterial en tu esquema

          // Características (booleanos)
          hasLift: data.features.hasLift,
          hasGarden: data.features.hasGarden,
          hasPool: data.features.hasPool,
          hasTerrace: data.features.hasTerrace,
          hasBalcony: data.features.hasBalcony,
          hasStorageRoom: data.features.hasStorageRoom,
          hasGarage: data.features.hasGarage,
          isFurnished: data.features.isFurnished,
          floatingFloor: data.features.floatingFloor,
          centralHeating: data.features.centralHeating,
          underfloorHeating: data.features.underfloorHeating,
          ductedAirc: data.features.ductedAirc,
          splitsAirc: data.features.splitsAirc,
          climalitWindow: data.features.climalitWindow,
          thermalBridgeWindow: data.features.thermalBridgeWindow,
          electricBlinds: data.features.electricBlinds,
          premiumAppliance: data.features.premiumAppliance,
          seaSight: data.features.seaSight,
          mountainSight: data.features.mountainSight,
          culturalSight: data.features.culturalSight,
          commonRooms: data.features.commonRooms,
          commonPool: data.features.commonPool,
          commonGym: data.features.commonGym,
          padelArea: data.features.padelArea,
          childrenArea: data.features.childrenArea,
          socialArea: data.features.socialArea,
          goalkeeper: data.features.goalkeeper,
          securityCameras: data.features.securityCameras,
          alarm: data.features.alarm,
          accesibility: data.features.accesibility,

          energyRating: data.energyRating || 'PENDING',
          emissionsRating: data.emissionsRating || 'PENDING',
          imgUrl: typeof data.imgUrl === 'string'
            ? JSON.parse(data.imgUrl)
            : data.imgUrl,
          videoUrl: data.videoUrl,
          virtualTourUrl: data.virtualTourUrl,
          communityCosts: data.communityCosts ? parseFloat(data.communityCosts) : undefined,
          annualTax: data.annualTax ? parseFloat(data.annualTax) : undefined,
        },
      });

      return newItem;
    }, {
      timeout: 15000 // 15 segundos para realizar la doble transacción
    });

    revalidateTag('properties', 'max');
    revalidatePath("/cms-manager");
    revalidatePath("/properties");
    
    return { success: true, data: result };

  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: `Reference ${data.itemRef} exists, try again other one.` };
    }
    return { success: false, error: "Server error" };
  }
}





// Usamos Partial<...> o 'any' temporalmente para los datos del formulario 
// ya que vienen planos, a diferencia de la interfaz PropertyFullDetail que es anidada
export async function updateItemWithProperty(itemId: string, data: any) {
  try {
    const updatedItem = await prisma.items.update({
      where: {
        id: itemId
      },
      data: {
        // 1. Campos de la tabla 'Items' (Están en la raíz de 'data')
        itemName: data.itemName,
        itemDescription: data.itemDescription,
        itemRef: data.itemRef,
        active: data.active,

        // 2. Actualización de la relación 'Property' (iprops)
        iprops: {
          update: {
            isOwner: data.isOwner,
            operType: data.operType,
            propType: data.propType,
            price: data.price,
            priceMin: data.priceMin ?? null,
            frequencyPay: data.frequencyPay || null,
            isNewDevelopment: data.isNewDevelopment,
            builtYear: data.builtYear ?? null,
            province: data.province,
            municipality: data.municipality,
            neighborhood: data.neighborhood,
            streetName: data.streetName,
            streetNumber: data.streetNumber,
            floor: data.floor,
            isExterior: data.isExterior,
            showAddress: data.showAddress,
            orientation: data.orientation || null,
            latitude: data.latitude,
            longitude: data.longitude,
            builtSize: data.builtSize ?? null,
            usefulSize: data.usefulSize ?? null,
            rooms: data.rooms ?? null,
            bathrooms: data.bathrooms ?? null,
            flooringMaterial: data.flooringMaterial || null,
            energyRating: data.energyRating || null,
            emissionsRating: data.emissionsRating || null,
            communityCosts: data.communityCosts ?? null,
            annualTax: data.annualTax ?? null,

            imgUrl: data.imgUrl,
            videoUrl: data.videoUrl,
            virtualTourUrl: data.virtualTourUrl,
            // 3. Características (Features)
            // En 'data' vienen dentro de un objeto 'features' asi que hacemos spread de él:
            ...data.features,
          },
        },
      },
    });

    revalidateTag('properties', 'max');
    // revalidatePath("/cms-manager");
    revalidatePath("/properties");

    return { success: true, data: updatedItem };

  } catch (error: any) {
    console.error("Error en updateItemWithProperty:", error);
    return { success: false, error: "Update Item Server error" };
  }
}
