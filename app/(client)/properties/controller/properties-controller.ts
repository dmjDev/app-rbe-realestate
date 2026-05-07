"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import fs from 'fs';
import path from 'path';
import { getBoundingBox } from "./getBoundigBox";
import { Prisma } from "@/app/generated/prisma/client";

export interface PropertyItem {
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemRef: string;
  active: boolean;
  isavedId: string;
  isavedState: string;
  operType: string;
  propType: string;
  updatedAt: Date;
  price: number;
  frequencyPay: string | null;
  isNewDevelopment?: boolean | null;
  address?: string | null;
  municipality: string;
  province: string;
  floor?: number | null;
  orientation?: string | null;
  latitude: number | null;
  longitude: number | null;
  builtSize?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  hasLift?: boolean | null;
  hasGarden?: boolean | null;
  hasGarage?: boolean | null;
  hasPool?: boolean | null;
  centralHeating?: boolean | null;
  energyRating?: string | null;
  imgUrl?: string | null;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  imagePaths: string[];
}

interface OrderConfig {
  key: keyof Prisma.ItemsOrderByWithRelationInput | keyof Prisma.PropertyOrderByWithRelationInput;
  vector: Prisma.SortOrder; // Solo permite 'asc' o 'desc'
}

const cacheTime = 3600;

// BUSQUEDA POR PROVINCES SEARCHREFFORM
export const getProvCount = async (params: any) => {
  const searchKey = JSON.stringify(params);

  const getCount = unstable_cache(
    async (_q: string) => {
      try {
        const total = await prisma.items.count({
          where: {
            active: true,
            iprops: {
              province: params.prov,
            }
          }
        });

        return total;
      } catch (error) {
        console.error("Error en getProvCount:", error);
        return 0;
      }
    },
    ['properties-prov-count'],
    { revalidate: cacheTime, tags: ['properties'] }
  );

  return getCount(searchKey);
}

export const getProvProperties = async (params: any, skip: number, take: number, order: OrderConfig): Promise<PropertyItem[]> => {
  // Envolvemos la lógica en la función cacheada
  const cacheFetch = unstable_cache(
    async (PROV: string, s: number, t: number, ordKey: string, ordVec: string) => {
      const isPropertyKey = ['price', 'builtSize', 'updatedAt'].includes(ordKey); // en Items -> itemRef
      try {
        const items = await prisma.items.findMany({
          where: {
            active: true,
            iprops: {
              province: PROV,
            }
          },
          include: { iprops: true },
          orderBy: isPropertyKey
            ? { iprops: { [ordKey]: ordVec } } // Ordena por la relación
            : { [ordKey]: ordVec } as Prisma.ItemsOrderByWithRelationInput, // Ordena por la tabla principal
          skip: s,
          take: t,
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
              .map(file => `/api/images?path=${itemIdStr}/${file}&v=${Date.now()}`); //&media=false`);
          }

          if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
            const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
            const addUrls = imagesArray.map((obj) => obj.url);
            foundImages = [...foundImages, ...addUrls];
          }

          let address = "Address not available";
          let parts: string[] = [];
          if (item.iprops.showAddress && item.iprops.streetName !== '') parts.push(item.iprops.streetName);
          parts.push(item.iprops.municipality, item.iprops.province);
          parts.filter(Boolean);
          if (parts.length > 0) address = parts.join(", ");

          return {
            itemId: itemIdStr,
            itemName: item.itemName,
            itemRef: item.itemRef,
            active: item.active,
            operType: item.iprops.operType,
            propType: item.iprops.propType,
            updatedAt: item.iprops.updatedAt,
            price: Number(item.iprops.price),
            frequencyPay: item.iprops.frequencyPay,
            isNewDevelopment: item.iprops.isNewDevelopment,
            address: address,
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
        console.error("Error en getProvProperties:", error);
        return [];
      }
    },
    ['properties-prov-list'], // Key base
    {
      revalidate: cacheTime,
      tags: ['properties']
    }
  );
  return cacheFetch(params.prov, skip, take, order.key, order.vector);
};

// BUSQUEDA POR REFERENCIA SEARCHREFFORM
export const getUserIdCount = async (params: any) => {
  const searchKey = JSON.stringify(params);

  const getCount = unstable_cache(
    async (_q: string) => {
      try {
        const total = await prisma.items.count({
          where: { managerId: params.userId }
        });

        return total;
      } catch (error) {
        console.error("Error en getUserIdCount:", error);
        return 0;
      }
    },
    ['properties-user-count'],
    { revalidate: cacheTime, tags: ['properties'] }
  );

  return getCount(searchKey);
}

export const getUserIdProperties = async (params: any, skip: number, take: number, order: OrderConfig): Promise<PropertyItem[]> => {
  // Envolvemos la lógica en la función cacheada
  const cacheFetch = unstable_cache(
    async (uId: string, s: number, t: number, ordKey: string, ordVec: string) => {
      const isPropertyKey = ['price', 'builtSize', 'updatedAt'].includes(ordKey); // en Items -> itemRef
      try {
        const items = await prisma.items.findMany({
          where: { managerId: uId },
          include: { iprops: true },
          orderBy: isPropertyKey
            ? { iprops: { [ordKey]: ordVec } } // Ordena por la relación
            : { [ordKey]: ordVec } as Prisma.ItemsOrderByWithRelationInput, // Ordena por la tabla principal
          skip: s,
          take: t,
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
              .map(file => `/api/images?path=${itemIdStr}/${file}&v=${Date.now()}`); //&media=false`);
          }

          if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
            const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
            const addUrls = imagesArray.map((obj) => obj.url);
            foundImages = [...foundImages, ...addUrls];
          }

          let address = "Address not available";
          let parts: string[] = [];
          if (item.iprops.showAddress && item.iprops.streetName !== '') parts.push(item.iprops.streetName);
          parts.push(item.iprops.municipality, item.iprops.province);
          parts.filter(Boolean);
          if (parts.length > 0) address = parts.join(", ");

          return {
            itemId: itemIdStr,
            itemName: item.itemName,
            itemRef: item.itemRef,
            active: item.active,
            operType: item.iprops.operType,
            propType: item.iprops.propType,
            updatedAt: item.iprops.updatedAt,
            price: Number(item.iprops.price),
            frequencyPay: item.iprops.frequencyPay,
            isNewDevelopment: item.iprops.isNewDevelopment,
            address: address,
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
        console.error("Error en getUserIdProperties:", error);
        return [];
      }
    },
    ['properties-user-list'], // Key base
    {
      revalidate: cacheTime,
      tags: ['properties']
    }
  );

  // IMPORTANTE: Pasamos los argumentos aquí para que formen parte de la cache key automáticamente
  return cacheFetch(params.userId, skip, take, order.key, order.vector);
};


// BUSQUEDA POR FILTROS -SEARCHFORM
export const getFilteredCount = async (params: any) => {
  const searchKey = JSON.stringify(params);

  const getCount = unstable_cache(
    async (_q: string) => {
      try {
        const propertyFilters: any = {
          operType: params.operType || undefined,
          propType: params.propType || undefined,
          price: {
            gte: params.priceMin ? parseFloat(params.priceMin) : undefined,
            lte: params.priceMax ? parseFloat(params.priceMax) : undefined,
          },
          rooms: params.roomsMin ? { gte: parseInt(params.roomsMin) } : undefined,
          bathrooms: params.bathroomsMin ? { gte: parseInt(params.bathroomsMin) } : undefined,
          builtSize: params.builtSizeMin ? { gte: parseInt(params.builtSizeMin) } : undefined,
          isNewDevelopment: params.isNewDevelopment === "true" ? true : undefined,
          hasPool: params.hasPool === "true" ? true : undefined,
          hasGarden: params.hasGarden === "true" ? true : undefined,
          hasLift: params.hasLift === "true" ? true : undefined,
          centralHeating: params.centralHeating === "true" ? true : undefined,
          hasTerrace: params.hasTerrace === "true" ? true : undefined,
          hasGarage: params.hasGarage === "true" ? true : undefined,
        };

        // Lógica de ubicación idéntica a la búsqueda
        if (params.latitude && params.longitude && params.distance) {
          const box = getBoundingBox(params.latitude, params.longitude, params.distance);
          propertyFilters.latitude = { gte: box.minLat, lte: box.maxLat };
          propertyFilters.longitude = { gte: box.minLon, lte: box.maxLon };
        } else {
          if (params.province) propertyFilters.province = { contains: params.province, mode: 'insensitive' };
          if (params.municipality) propertyFilters.municipality = { contains: params.municipality, mode: 'insensitive' };
        }

        const total = await prisma.items.count({
          where: {
            active: true,
            iprops: propertyFilters
          }
        });

        return total;
      } catch (error) {
        console.error("Error en getFilteredCount:", error);
        return 0;
      }
    },
    ['properties-filtered-count'],
    { revalidate: cacheTime, tags: ['properties'] }
  );

  return getCount(searchKey);
}

export const getFilteredProperties = async (params: any, skip: number, take: number, order: OrderConfig): Promise<PropertyItem[]> => {

  const searchKey = JSON.stringify(params);

  const fetcher = unstable_cache(
    async (s: number, t: number, _query: string, ordKey: string, ordVec: string) => {
      const isPropertyKey = ['price', 'builtSize', 'updatedAt'].includes(ordKey); // en Items -> itemRef
      try {
        const propertyFilters: any = {
          operType: params.operType || undefined,
          propType: params.propType || undefined,
          price: {
            gte: params.priceMin ? parseFloat(params.priceMin) : undefined,
            lte: params.priceMax ? parseFloat(params.priceMax) : undefined,
          },
          rooms: params.roomsMin ? { gte: parseInt(params.roomsMin) } : undefined,
          bathrooms: params.bathroomsMin ? { gte: parseInt(params.bathroomsMin) } : undefined,
          builtSize: params.builtSizeMin ? { gte: parseInt(params.builtSizeMin) } : undefined,
          isNewDevelopment: params.isNewDevelopment === "true" ? true : undefined,
          hasPool: params.hasPool === "true" ? true : undefined,
          hasGarden: params.hasGarden === "true" ? true : undefined,
          hasLift: params.hasLift === "true" ? true : undefined,
          centralHeating: params.centralHeating === "true" ? true : undefined,
          hasTerrace: params.hasTerrace === "true" ? true : undefined,
          hasGarage: params.hasGarage === "true" ? true : undefined,
        };

        if (params.latitude && params.longitude && params.distance) {
          const box = getBoundingBox(params.latitude, params.longitude, params.distance);
          propertyFilters.latitude = { gte: box.minLat, lte: box.maxLat };
          propertyFilters.longitude = { gte: box.minLon, lte: box.maxLon };
        } else {
          if (params.province) propertyFilters.province = { contains: params.province, mode: 'insensitive' };
          if (params.municipality) propertyFilters.municipality = { contains: params.municipality, mode: 'insensitive' };
        }

        const items = await prisma.items.findMany({
          where: {
            active: true,
            iprops: propertyFilters
          },
          include: { iprops: true },
          orderBy: isPropertyKey
            ? { iprops: { [ordKey]: ordVec } } // Ordena por la relación
            : { [ordKey]: ordVec } as Prisma.ItemsOrderByWithRelationInput, // Ordena por la tabla principal
          skip: s,
          take: t,
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
              .map(file => `/api/images?path=${itemIdStr}/${file}&v=${Date.now()}`); //&media=false`);
          }

          if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
            const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
            const addUrls = imagesArray.map((obj) => obj.url);
            foundImages = [...foundImages, ...addUrls];
          }

          let address = "Address not available";
          let parts: string[] = [];
          if (item.iprops.showAddress && item.iprops.streetName !== '') parts.push(item.iprops.streetName);
          parts.push(item.iprops.municipality, item.iprops.province);
          parts.filter(Boolean);
          if (parts.length > 0) address = parts.join(", ");

          return {
            itemId: itemIdStr,
            itemName: item.itemName,
            itemRef: item.itemRef,
            active: item.active,
            operType: item.iprops.operType,
            propType: item.iprops.propType,
            updatedAt: item.iprops.updatedAt,
            price: Number(item.iprops.price),
            frequencyPay: item.iprops.frequencyPay,
            isNewDevelopment: item.iprops.isNewDevelopment,
            address: address,
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
        console.error("Error en getFilteredProperties:", error);
        return [];
      }
    },
    ['properties-filtered-list'],
    { revalidate: cacheTime, tags: ['properties'] }
  );

  return fetcher(skip, take, searchKey, order.key, order.vector);
};

// Función para cargar más propiedades (paginación) desde el cliente, reutilizando la lógica de filtrado y cacheo de getFilteredProperties
export async function fetchMoreProperties(params: any, skip: number, take: number, mode: string, order: any) {
  if (mode === 'ID') return await getUserIdProperties(params, skip, take, order);
  if (mode === 'PROV') return await getProvProperties(params, skip, take, order);
  if (mode === 'FILTER') return await getFilteredProperties(params, skip, take, order);
}
// --------------------------------------------------------------------------------------------------------------

// CONSULTA A DB PARA OBTENER LOS DATOS DEL INMUEBLE SEGÚN SU REFERENCIA
export async function getPropertyByReference(ref: string, userId: string) {
  if (!ref) return { success: false, error: "Reference is required" };
  try {
    const item = await prisma.items.findFirst({
      where: {
        itemRef: ref,
        OR: [
          { managerId: userId }, // Si managerId y userId coinciden, entonces no indica active en ninguna condición
          { active: true }       // Si llega hasta aquí es porque la información la está leyendo otro usuario, por lo tanto active true
        ]
      },
      include: {
        isaved: true,
        iprops: true
      },
    });

    //LOGICA DE ARCHIVOS
    if (!item) return { success: false, error: "Property not found" };
    const rootUploads = path.join(process.cwd(), 'upload');
    // return items.map((item: any) => {
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
        .map(file => `/api/images?path=${itemIdStr}/${file}&v=${Date.now()}`); //&media=false`);
    }

    if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
      const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
      const addUrls = imagesArray.map((obj) => obj.url);
      foundImages = [...foundImages, ...addUrls];
    }
    // console.log('foundImg', foundImages)

    let address = "Address not available";
    let parts: any[] = [];
    if (item.iprops?.showAddress && item.iprops.streetName !== '') parts.push(item.iprops?.streetName);
    parts.push(item.iprops?.municipality, item.iprops?.province);
    parts.filter(Boolean);
    if (parts.length > 0) address = parts.join(", ");

    const data = {
      itemId: itemIdStr,
      itemName: item.itemName,
      itemRef: item.itemRef,
      active: item.active,

      isavedId: item.isaved[0]?.id || '',
      isavedState: item.isaved[0]?.state || '',

      operType: item.iprops?.operType,
      propType: item.iprops?.propType,
      updatedAt: item.iprops?.updatedAt,
      price: Number(item.iprops?.price),
      frequencyPay: item.iprops?.frequencyPay,
      isNewDevelopment: item.iprops?.isNewDevelopment,
      address: address,
      floor: item.iprops?.floor,
      orientation: item.iprops?.orientation,
      latitude: item.iprops?.latitude,
      longitude: item.iprops?.longitude,
      builtSize: item.iprops?.builtSize,
      rooms: item.iprops?.rooms,
      bathrooms: item.iprops?.bathrooms,
      hasLift: item.iprops?.hasLift,
      hasGarden: item.iprops?.hasGarden,
      hasGarage: item.iprops?.hasGarage,
      hasPool: item.iprops?.hasPool,
      centralHeating: item.iprops?.centralHeating,
      energyRating: item.iprops?.energyRating,
      imgUrl: item.iprops?.imgUrl,
      videoUrl: item.iprops?.videoUrl,
      virtualTourUrl: item.iprops?.virtualTourUrl,
      imagePaths: foundImages
    } as PropertyItem;

    return { success: true, data: data, message: "Property found, we are ready to display it" };
  } catch (e) {
    console.error("getPropertyByReference Error:", e);
    return { success: false, error: "Server error" };
  }
}

export async function getRandomPropertyAction(userId: string) {
  const itemCount = await prisma.items.count({
    where: {
      active: true,
    }
  });
  const skip = Math.floor(Math.random() * itemCount);

  const randItem = await prisma.items.findFirst({
    where: {
      active: true,
    },
    skip: skip,
    take: 1,
  });

  // console.log('ref RAND: ', randItem?.itemRef)
  if (!randItem?.itemRef) {
    return { success: false, error: "No items found" };
  }

  const response = await getPropertyByReference(randItem.itemRef.trim(), userId);
  return response;
}

// HOME PROMOS ALEATORIAS
const shuffleArray = (array: any) => {
  const newArray = [...array]; // Clonamos para no mutar el original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Intercambio de valores (Destructuring assignment)
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
export async function getHomePromosProperties(limit: number) {
  try {
    const promos = await prisma.items.findMany({
      where: { homePromo: true },
      include: { iprops: true }
    });

    const items = shuffleArray(promos);
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
          .map(file => `/api/images?path=${itemIdStr}/${file}&v=${Date.now()}`); //&media=false`);
      }

      if (item.iprops?.imgUrl && Array.isArray(item.iprops.imgUrl)) {
        const imagesArray = item.iprops.imgUrl as Array<{ url: string }>;
        const addUrls = imagesArray.map((obj) => obj.url);
        foundImages = [...foundImages, ...addUrls];
      }

      let address = "Address not available";
      let parts: string[] = [];
      if (item.iprops.showAddress && item.iprops.streetName !== '') parts.push(item.iprops.streetName);
      parts.push(item.iprops.municipality, item.iprops.province);
      parts.filter(Boolean);
      if (parts.length > 0) address = parts.join(", ");

      // console.log('foundImages', foundImages)

      return {
        itemId: itemIdStr,
        itemName: item.itemName,
        itemRef: item.itemRef,
        active: item.active,
        operType: item.iprops.operType,
        propType: item.iprops.propType,
        updatedAt: item.iprops.updatedAt,
        price: Number(item.iprops.price),
        frequencyPay: item.iprops.frequencyPay,
        isNewDevelopment: item.iprops.isNewDevelopment,
        address: address,
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
    console.error("Error en getUserIdProperties:", error);
    return [];
  }
}
// --------------------------------------------------------------------------------------

// ACTUALIZA LA URL DE BÚSQUEDA GUARDADA DEL USUARIO PARA MOSTRARLA EN LA PÁGINA DE PROPIEDADES GUARDADAS
export async function updateUserSearchUrl(userId: string, url: string) {
  try {
    await prisma.user.update({ where: { id: userId }, data: { urlSearch: url } });
    revalidatePath("/");
  } catch (error) {
    throw new Error("No se pudo guardar la búsqueda");
  }
}

// CONSULTA LOS ITEMS GUARDADOS DEL USUARIO PARA MOSTRARLOS EN LA PÁGINA DE PROPIEDADES GUARDADAS
export const getItemsSaved = async (userId: string) => {
  return await prisma.itemsSaved.findMany({
    where: { clientId: userId }
  });
};

// GUARDA O ACTUALIZA EL ESTADO DE UN ITEM GUARDADO (FAVORITO) PARA UN USUARIO, Y DEVUELVE LA LISTA ACTUALIZADA DE ITEMS GUARDADOS PARA MOSTRARLA EN LA PÁGINA DE PROPIEDADES GUARDADAS
export async function saveItem(Id: string, itemId: string, userId: string, newState: string) {
  if (Id === "") {
    const exists = await prisma.itemsSaved.findFirst({
      where: { itemId, clientId: userId }
    });

    if (!exists) {
      await prisma.itemsSaved.create({
        data: { itemId, clientId: userId, state: newState }
      });
    } else {
      await prisma.itemsSaved.update({
        where: { id: exists.id },
        data: { state: newState }
      });
    }
  } else {
    await prisma.itemsSaved.update({
      where: { id: Id },
      data: { state: newState }
    });
  }
  return getItemsSaved(userId);
}

