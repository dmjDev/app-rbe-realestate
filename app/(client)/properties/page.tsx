import {
  getFilteredProperties,
  getFilteredCount,
  getUserIdProperties,
  getUserIdCount,
  getProvProperties,
  getProvCount,
} from "./controller/properties-controller";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { PropertyInfiniteList } from "./components/PropertyInfiniteList";
import { Prisma } from "@/app/generated/prisma/client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id || "";
  const resolvedSearchParams = await searchParams;
  // console.log('params', resolvedSearchParams)

  let initialProperties = [] as any;
  let totalCount = 0;
  let edit = false; // VISTA O NO DEL BOTON EDITAR EN EL CARRUSEL
  let mode = ""; // según esta variable ejecutamos una de las opciones en fetchMoreProperties

  let itemsPage = 8; // ITEMS QUE SE CARGARAN CADA VEZ DURANTE ES SCROLL INFINITO

  // ORDER BY DINAMICO
  interface OrderConfig {
    key: keyof Prisma.ItemsOrderByWithRelationInput | keyof Prisma.PropertyOrderByWithRelationInput;
    vector: Prisma.SortOrder; // Solo permite 'asc' o 'desc'
  }
  const order: OrderConfig = {
    key: (resolvedSearchParams.sort as any) || "price", //price, builtSize, updatedAt, itemRef
    vector: (resolvedSearchParams.dir as any) || "asc"  //asc, desc
  };

  if (resolvedSearchParams.userId) {
    edit = true;
    mode = "ID";
    [initialProperties, totalCount] = await Promise.all([
      getUserIdProperties(resolvedSearchParams, 0, itemsPage, order),
      getUserIdCount(resolvedSearchParams)
    ]);
  } else if (resolvedSearchParams.prov) {
    mode = "PROV";
    [initialProperties, totalCount] = await Promise.all([
      getProvProperties(resolvedSearchParams, 0, itemsPage, order),
      getProvCount(resolvedSearchParams)
    ]);
  } else {
    mode = "FILTER";
    [initialProperties, totalCount] = await Promise.all([
      getFilteredProperties(resolvedSearchParams, 0, itemsPage, order),
      getFilteredCount(resolvedSearchParams)
    ]);
  }

  // console.log('return', mode, totalCount, initialProperties.length, initialProperties)
  const tsxml =
    <main className="bgprimary">
      <div className="ancho-global">
        <PropertyInfiniteList
          initialItems={initialProperties}
          searchParams={resolvedSearchParams}
          userId={userId}
          totalCount={totalCount}
          edit={edit}
          itemsPage={itemsPage}
          mode={mode}
          order={order}
        />
      </div>
    </main>

  return tsxml;
}
