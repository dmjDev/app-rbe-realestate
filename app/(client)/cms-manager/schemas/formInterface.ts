import * as z from 'zod';
import { OperationType, PropertyType, EnergyRating, Orientation, FlooringType, FrequencyPay } from "@/app/generated/prisma/enums";

export const formSchema = z.object({
  itemName: z.string().trim().min(1, "Short description required").max(120),
  itemRef: z.string().trim().min(1, "Property reference required").max(120),
  active: z.boolean().optional(),
  operType: z.enum(OperationType, { message: "Operation type required" }),
  propType: z.enum(PropertyType, { message: "Property type required" }),
  isOwner: z.boolean().optional(),
  isNewDevelopment: z.boolean().optional(),
  builtYear: z.coerce.number().optional(),
  price: z.coerce.number("Price required").positive("Price must be greater than 0").multipleOf(0.01, "Only 2 decimal places allowed"),
  frequencyPay: z.enum(FrequencyPay).optional().or(z.literal("")),
  priceMin: z.coerce.number().optional(),
  province: z.string().trim().min(1, "Province required").max(120),
  municipality: z.string().trim().min(1, "Municipality required").max(120),
  neighborhood: z.string().trim().optional(),
  streetName: z.string().trim().optional(),
  streetNumber: z.string().trim().optional(),
  floor: z.string().trim().optional(),
  isExterior: z.boolean().optional(),
  showAddress: z.boolean().optional(),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
  orientation: z.enum(Orientation).optional().or(z.literal("")),
  builtSize: z.coerce.number().optional(),
  usefulSize: z.coerce.number().optional(),
  rooms: z.coerce.number().int("Enter an integer number").nonnegative("The number of rooms must be 0 or a positive number").optional(),
  bathrooms: z.coerce.number().int("Enter an integer number").nonnegative("The number of bathrooms must be 0 or a positive number").optional(),
  energyRating: z.enum(EnergyRating).optional().or(z.literal("")),
  emissionsRating: z.enum(EnergyRating).optional().or(z.literal("")),
  communityCosts: z.coerce.number().optional(),
  annualTax: z.coerce.number().optional(),
  imgUrl: z.array(
    z.object({
      url: z.url("Formato de URL no válido")
    })
  ).default([]),
  imgUrlAdd: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  virtualTourUrl: z.string().trim().optional(),
  features: z.record(z.string(), z.boolean()).optional(),
  flooringMaterial: z.enum(FlooringType).optional().or(z.literal("")),
  itemDescription: z.string().trim().min(1, "Long description required").max(5000),

  hasLift: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasStorageRoom: z.boolean().optional(),
  hasGarage: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  floatingFloor: z.boolean().optional(),
  centralHeating: z.boolean().optional(),
  underfloorHeating: z.boolean().optional(),
  ductedAirc: z.boolean().optional(),
  splitsAirc: z.boolean().optional(),
  climalitWindow: z.boolean().optional(),
  thermalBridgeWindow: z.boolean().optional(),
  electricBlinds: z.boolean().optional(),
  premiumAppliance: z.boolean().optional(),
  seaSight: z.boolean().optional(),
  mountainSight: z.boolean().optional(),
  culturalSight: z.boolean().optional(),
  commonRooms: z.boolean().optional(),
  commonPool: z.boolean().optional(),
  commonGym: z.boolean().optional(),
  padelArea: z.boolean().optional(),
  childrenArea: z.boolean().optional(),
  socialArea: z.boolean().optional(),
  goalkeeper: z.boolean().optional(),
  securityCameras: z.boolean().optional(),
  alarm: z.boolean().optional(),
  accesibility: z.boolean().optional(),
});

export type MyFormValues = z.infer<typeof formSchema>;


// INTERFACE PARA LOS DATOS DE ITEMCARD
export const searchSchema = formSchema
  .pick({
    operType: true,
    propType: true,
    price: true, // Lo usaremos como base o para priceMax
    hasPool: true,
    hasGarden: true,
    hasLift: true,
    centralHeating: true,
    isNewDevelopment: true,
    hasTerrace: true,
    hasGarage: true,
    province: true,      // Añadidos por si buscas por texto
    municipality: true,  // Añadidos por si buscas por texto
    latitude: true,      // Necesarios para el radio de distancia
    longitude: true,     // Necesarios para el radio de distancia
  })
  .extend({
    // Añadimos los campos específicos de búsqueda que no estaban en el original
    distance: z.coerce.number().optional(),
    priceMin: z.coerce.number().optional(),
    priceMax: z.coerce.number().optional(),
    roomsMin: z.coerce.number().optional(),
    bathroomsMin: z.coerce.number().optional(),
    builtSizeMin: z.coerce.number().optional(),
  })
  .partial(); // Hace que todos los campos sean opcionales

export type SearchFormValues = z.infer<typeof searchSchema>;


export const itemRefSchema = formSchema
  .pick({
    itemRef: true,
  });

export type ItemRefFormValues = z.infer<typeof itemRefSchema>;



// INTERFACE PARA LOS DATOS DEL FORMULARIO CREATE/UPDATE ITEM
export interface PropertyFullDetail {
  id: string;
  managerId: string;
  itemName: string;
  itemDescription: string;
  itemRef: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  iprops: {
    id: string;
    itemId: string;
    isOwner: boolean;
    operType: OperationType;
    propType: PropertyType;
    price: number | null;
    priceMin: number | null;
    frequencyPay: FrequencyPay | null;
    isNewDevelopment: boolean;
    builtYear: number | null;
    province: string;
    municipality: string;
    neighborhood: string;
    streetName: string;
    streetNumber: string;
    floor: string;
    isExterior: boolean;
    showAddress: boolean;
    orientation: Orientation | null;
    latitude: number | null;
    longitude: number | null;
    builtSize: number | null;
    usefulSize: number | null;
    rooms: number | null;
    bathrooms: number | null;
    flooringMaterial: FlooringType | null;
    energyRating: EnergyRating | null;
    emissionsRating: EnergyRating | null;
    imgUrl: any; // Mapeado desde Json de Prisma
    videoUrl: string | null;
    virtualTourUrl: string | null;
    communityCosts: number | null;
    annualTax: number | null;
    [key: string]: any; // Firma de índice para las features dinámicas
  } | null;
}