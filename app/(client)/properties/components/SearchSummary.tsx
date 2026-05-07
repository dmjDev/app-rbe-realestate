import React from 'react';

// Definimos la interfaz para los parámetros de búsqueda
interface SearchParams {
  operType?: 'SALE' | 'RENT' | string;
  propType?: 'FLAT' | 'HOUSE' | 'CHALET' | string;
  isNewDevelopment?: boolean | string;
  hasPool?: boolean | string;
  hasGarden?: boolean | string;
  hasLift?: boolean | string;
  centralHeating?: boolean | string;
  hasTerrace?: boolean | string;
  hasGarage?: boolean | string;
  province?: string;
  prov?: string;
  municipality?: string;
  distance?: string | number;
  priceMin?: string | number;
  priceMax?: string | number;
  roomsMin?: string | number;
  bathroomsMin?: string | number;
  builtSizeMin?: string | number;
}

interface SearchSummaryProps {
  params: SearchParams;
}

const SearchSummary: React.FC<SearchSummaryProps> = ({ params }) => {
  if (!params) return null;

  // Tipamos la función de unión natural
  const naturalJoin = (arr: string[]): string => {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    const last = arr.pop();
    return `${arr.join(", ")} and ${last}`;
  };

  const buildSentence = (): string => {
    const parts: string[] = [];

    // 1. Tipo de propiedad y operación
    const oper = params.operType ? params.operType.toLowerCase() : '';
    // const oper = params.operType === 'SALE' ? 'sale' : 'rent';
    const prop = params.propType ? params.propType.toLowerCase() : 'property';
    const isNew = params.isNewDevelopment === "true" || params.isNewDevelopment === true ? 'new built ' : '';
    params.operType ?
      parts.push(`Searching for a ${isNew}${prop} for ${oper}`) :
      parts.push(`Searching for a ${isNew}${prop}`);


    // 2. Ubicación
    if (params.municipality && params.province) {
      let loc = `in ${params.municipality} (${params.province})`;
      if (params.distance) loc += ` or within ${params.distance}km`;
      parts.push(loc);
    }
    if (params.prov) {
      let loc = `in ${params.prov}`;
      parts.push(loc);
    }

    // 3. Habitaciones y Baños
    const specs: string[] = [];
    if (params.builtSizeMin) specs.push(`${params.builtSizeMin}m²`);
    if (params.roomsMin) specs.push(`${params.roomsMin}+ bedrooms`);
    if (params.bathroomsMin) specs.push(`${params.bathroomsMin}+ bathrooms`);

    if (specs.length > 0) {
      parts.push(`with ${naturalJoin(specs)}`);
    }

    // 4. Precio
    if (params.priceMin && params.priceMax) {
      parts.push(`priced between ${params.priceMin} and ${params.priceMax}€`);
    }
    // } else if (params.priceMin) {
    //   parts.push(`from ${params.priceMin}€`);
    // } else if (params.priceMax) {
    //   parts.push(`up to ${params.priceMax}€`);
    // }

    // 5. Extras (Amenidades) con Tipado Seguro
    const extrasMap: Record<string, string> = {
      hasPool: 'pool',
      hasGarden: 'garden',
      hasLift: 'lift',
      centralHeating: 'heating',
      hasTerrace: 'terrace',
      hasGarage: 'garage'
    };

    // Usamos 'keyof typeof extrasMap' para que TS sepa que la clave es válida
    const extras = Object.keys(extrasMap)
      .filter(key => {
        const val = params[key as keyof SearchParams];
        return val === "true" || val === true;
      })
      .map(key => extrasMap[key]);

    if (extras.length > 0) {
      parts.push(`including ${naturalJoin(extras)}`);
    }

    return parts.length > 0 ? parts.join(", ") + "." : "";
  };

  return (
    <div className="text-sm txtsecondary">{buildSentence()}</div>
  );
};

export default SearchSummary;