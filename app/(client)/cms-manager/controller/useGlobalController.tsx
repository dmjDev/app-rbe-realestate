import { OperationType, PropertyType, EnergyRating, Orientation, FlooringType, FrequencyPay } from "@/app/generated/prisma/enums";

export const useGlobalController = () => {

  // Convertimos los ENUM en array de objetos { label, value } --------------------------------------------------------------ENUMS
  const operationOptions = Object.entries(OperationType).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replaceAll('_', ' '), // 'SALE' -> 'Sale'
    value: value,                                      // 'SALE' -> 'SALE'
  }));
  const propertyOptions = Object.entries(PropertyType).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replaceAll('_', ' '), // 'FLAT' -> 'Flat'
    value: value,                                      // 'FLAT' -> 'FLAT'
  }));
  const energyOptions = Object.entries(EnergyRating).map(([key, value]) => ({
    label: key,     // 'A' -> 'A'
    value: value,   // 'A' -> 'A'
  }));
  const orientationOptions = Object.entries(Orientation).map(([key, value]) => ({
    label: key,     // 'N' -> 'N'
    value: value,   // 'N' -> 'N'
  }));
  // Ignorando la primera posición, busca las letras mayúsculas y les añade un espacio delante
  const flooringOptions = Object.entries(FlooringType).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').replaceAll('_', ' '),
    value: value,
  }));
  const frequencyOptions = Object.entries(FrequencyPay).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replaceAll('_', ' '), // 'DAILY' -> 'Daily'
    value: value,                                      // 'DAILY' -> 'DAILY'
  })); // ----------------------------------------------------------------------------------------------------------------ENUMS

  return {
    operationOptions, propertyOptions, energyOptions, orientationOptions, flooringOptions, frequencyOptions
  };
};