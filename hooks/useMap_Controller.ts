import { useEffect, useMemo, useRef } from "react"
import { SPAIN_LOCATIONS } from "@/lib/locations";
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { debounce } from "lodash";
import { normalizeText } from "@/lib/normalizeText";

interface Props {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  isInitialLoaded: boolean;
}

interface MunicipalityResult {
  text_es: string;
  center: number[];
}

function findMunicipalityInfo(data: any): MunicipalityResult | null {
  // Buscamos el elemento dentro de 'features'
  const municipalityFeature = data.features.find((feature: any) => {
    // Comprobamos si "municipality" o "municipio" existen en place_type o place_type_name
    const types = [
      ...(feature.properties?.place_type_name || []),
      ...(feature.place_type || [])
    ];
    
    return types.includes("municipality") || types.includes("municipio");
  });

  // Si lo encontramos, devolvemos solo los campos solicitados
  if (municipalityFeature) {
    return {
      text_es: municipalityFeature.text_es,
      center: municipalityFeature.center
    };
  }

  return null;
}

export const useMap_Controller = ({ watch, setValue, isInitialLoaded }: Props) => {
  const isUpdatingFromMap = useRef(false);
  const isUpdatingFromSelect = useRef(false);

  // PROVINCES & MUNICIPALITIES
  const selectedProvince = watch("province");
  const municipalities = useMemo(() => {
    return selectedProvince ? SPAIN_LOCATIONS[selectedProvince] || [] : [];
  }, [selectedProvince]);

  // MAPA
  // 1. Observamos los valores de latitud y longitud del formulario
  const watchLat = watch("latitude");
  const watchLng = watch("longitude");

  // 2. EFECTO: De SELECT a MAPA (Geocodificación Directa)
  useEffect(() => {
    const syncMapWithSelects = async () => {
      if (isUpdatingFromMap.current) return;

      const municipality = watch("municipality");
      if (!selectedProvince || !municipality || !isInitialLoaded) return;
      
      const [nombre, ...articulo] = municipality.split(", ").map((s: string) => s.trim());
      const municipio = `${articulo.join(" ")} ${nombre}`.trim();
      const query = `${municipio}, ${selectedProvince}, España`;
      // console.log('muni', municipio)

      try {
        isUpdatingFromSelect.current = true; // Bloqueamos el efecto inverso
        const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${API_KEY}&language=es&types=municipality,place`
        );
        const data = await response.json();
        // console.log('data SELECT -> MAP', data)

        const result = findMunicipalityInfo(data);
        if (result) {
          const [lng, lat] = result.center;
          // console.log('coordenadas', lng, lat)
          setValue("latitude", Number(lat.toFixed(6)));
          setValue("longitude", Number(lng.toFixed(6)));
        }
      } catch (error) {
        console.error("Error al ubicar municipio en mapa:", error);
      } finally {
        // Importante: El delay debe ser suficiente para que el mapa termine de moverse
        setTimeout(() => { isUpdatingFromSelect.current = false; }, 1000);
      }
    };
    syncMapWithSelects();
  }, [selectedProvince, watch("municipality")]);

  // 3. FUNCIÓN: De CLIC MAPA a SELECTS (Geocodificación Inversa) ///////////////////////////////////////////////////////
  useEffect(() => {
    const debouncedChangeMap = debounce(async (watchLat: any, watchLng: any) => {
      // Si el cambio de coordenadas viene de haber elegido un municipio en el SELECT,
      // no hacemos geocodificación inversa.
      if (isUpdatingFromSelect.current) return;
      // IGNORAMOS EL WATCH QUE SE ACABA DE REALIZAR SI HA SIDO AL ACTUALIZAR LOS CAMPOS DE PROVINCIA Y MUNICIPIO AL HACER CLIC EN EL MAPA
      if (isUpdatingFromMap.current) {
        isUpdatingFromMap.current = false;
        return;
      }

      if (watchLat !== undefined && watchLng !== undefined) {
        const currentLat = Number(watchLat);
        const currentLng = Number(watchLng);
        // console.log('coordenadas CLIC en MAPA', currentLat, currentLng)

        try {
          const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
          const response = await fetch(
            `https://api.maptiler.com/geocoding/${currentLng},${currentLat}.json?key=${API_KEY}&language=es`
          );
          if (!response.ok) {
            const errorText = await response.text();
            console.error("MapTiler Error:", errorText);
            return;
          }
          const data = await response.json();
          // console.log('data', data)

          // Para la provincia, buscamos 'region' o 'subregion' o 'county'
          const provObj = data.features.find((f: any) => f.place_type.includes('subregion'))
            || data.features.find((f: any) => f.place_type.includes('county'))
            || data.features.find((f: any) => f.place_type.includes('region'));
          // console.log('prov según MAPA', provObj)

          // Buscamos primero 'municipality', si no existe probamos con 'place'
          const muniObj = data.features.find((f: any) => f.place_type.includes('municipality'))
            || data.features.find((f: any) => f.place_type.includes('place'));
          // console.log('muni según MAPA', muniObj)

          if (provObj) {
            const rawProv = provObj.text_es;
            const cleanRawProv = normalizeText(rawProv);

            const matchedProv = Object.keys(SPAIN_LOCATIONS).find(p => {
              const cleanP = normalizeText(p);
              return cleanRawProv === cleanP || cleanRawProv.includes(cleanP) || cleanP.includes(cleanRawProv);
            });

            if (matchedProv) {
              isUpdatingFromMap.current = true;
              setValue("province", matchedProv, { shouldValidate: false });

              if (muniObj) {
                const rawMuni = muniObj.text_es;
                const cleanRawMuni = normalizeText(rawMuni); // ej: "el verger"
                const rawMuniWords = cleanRawMuni.split(" ").filter(w => w.length > 2);

                const matchedMuni = SPAIN_LOCATIONS[matchedProv].find(m => {
                  const cleanM = normalizeText(m); // ej: "verger el"
                  // console.log('myMuniClean', cleanM)

                  // 1. Coincidencia total directa
                  if (cleanM === cleanRawMuni) return true;

                  // 2. Coincidencia por palabras clave (ignora el orden)
                  // Comprobamos si las palabras de la API están en tu lista local
                  const cleanMWords = cleanM.split(" ").filter(w => w.length > 2);
                  // console.log('myMuniWord', cleanMWords)

                  if (rawMuniWords.length > 0 && cleanMWords.length > 0) {
                    return rawMuniWords.every(word => cleanM.includes(word)) ||
                      cleanMWords.every(word => cleanRawMuni.includes(word));
                  }

                  return false;
                });

                if (matchedMuni) {
                  // Usamos un timeout ligeramente superior para asegurar que el render de 
                  // la provincia haya terminado y el select de municipios esté poblado.
                  setTimeout(() => {
                    setValue("municipality", matchedMuni, { shouldValidate: false });
                  }, 150);
                }
              }
            }
          }

        } catch (error) {
          console.error("Error en geocodificación inversa:", error);
        } finally {
          setTimeout(() => { isUpdatingFromMap.current = false; }, 200);
        }
      }
    }, 300);

    const subscription = watch((value, { name }) => {
      if (name === "latitude" || name === "longitude") {
        debouncedChangeMap(value.latitude, value.longitude);
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedChangeMap.cancel();
    };
  }, [watch]);

  return {
    selectedProvince,
    municipalities,
    watchLat,
    watchLng
  }
}
