"use client";

import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchSchema, SearchFormValues } from "@/app/(client)/cms-manager/schemas/formInterface";
import { useEffect, useState, useMemo, useRef } from "react";
import { updateUserSearchUrl } from "../controller/properties-controller";
import { PropertyType } from "@/app/generated/prisma/enums";
import { SEARCH_OPERATION_TYPES, OPTION } from "@/lib/operationType";

import MapForm from '@/components/MapForm';
import MsgError from "@/components/MsgError";
import MsgSuccess from "@/components/MsgSuccess";
import SearchRefForm from "./SearchRefForm";
import { Scaling, Tags } from "lucide-react";

export default function SearchForm({ userId, initialUrl }: { userId?: string, initialUrl?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errorRef, setErrorRef] = useState("");
  const [successRef, setSuccessRef] = useState("");
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  const router = useRouter();

  // VACIAMOS LOS VALORES DE SESSIONSTORAGE PARA QUE LOS VUELVA A CARGAR SI HACEMOS UNA NUEVA BÚSQUEDA, DE LO CONTRARIO MANTENDRÁ LOS DE LA BÚSQUEDA ANTERIOR, YA SEA AQUÍ POR PARÁMETROS, POR REFERENCIA O POR USERID
  useEffect(() => {
    if ('scrollRestoration' in history) { history.scrollRestoration = 'manual' };
    if ('pending_urls' in sessionStorage) { sessionStorage.removeItem('pending_urls') };
    if ('last_id_results' in sessionStorage) { sessionStorage.removeItem('last_id_results') };
    if ('last_prov_results' in sessionStorage) { sessionStorage.removeItem('last_prov_results') };
    if ('last_search_results' in sessionStorage) { sessionStorage.removeItem('last_search_results') };
    if ('last_scroll_pos' in sessionStorage) { sessionStorage.removeItem('last_scroll_pos') };
  }, []);

  let lat: number, lng: number;
  const params = new URLSearchParams(initialUrl?.split('?')[1]);
  if (params.get('latitude') && params.get('longitude')) {
    lat = parseFloat(params.get('latitude') as string);
    lng = parseFloat(params.get('longitude') as string);
  } else {
    lat = 40.4167;
    lng = -3.7037;
  }

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema) as Resolver<SearchFormValues>,
    defaultValues: {
      longitude: lng,
      latitude: lat,
    }
  });

  // Convertimos los ENUM en array de objetos { label, value } --------------------------------------------------------------ENUMS
  type Language = 'ES' | 'EN';
  let LANG: Language = "EN";
  const operationOptions = OPTION.map((key) => {
    const labelRaw = SEARCH_OPERATION_TYPES[key]?.[LANG] || key;
    return {
      label: labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1).toLowerCase(),
      value: key,
    };
  });
  const propertyOptionsRaw = Object.entries(PropertyType).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replaceAll('_', ' '), // 'FLAT' -> 'Flat'
    value: value,                                                           // 'FLAT' -> 'FLAT'
  }));

  const listaSinRooms = propertyOptionsRaw.filter(item => item.value !== "ROOMS");
  const listaShare = propertyOptionsRaw.filter(item => ["ROOMS", "COMMERCIAL_PROPERTIES", "STORAGE_ROOMS", "LAND", "OFFICES"].includes(item.value));
  const listaTransfer = propertyOptionsRaw.filter(item => ["COMMERCIAL_PROPERTIES", "OFFICES"].includes(item.value));
  const listaHoliday = propertyOptionsRaw.filter(item => ["FLAT", "APARTMENT", "PENTHOUSE", "DUPLEX", "STUDIO", "TERRACED_HOUSES", "DETACHED_CHALETS", "VILLAS", "COTTAGE", "BUNGALOW", "LOFT"].includes(item.value));
  const OPTIONS_LIST = {
    SALE: listaSinRooms,
    RENT: listaSinRooms,
    SHARE: listaShare,
    TRANSFER: listaTransfer,
    LIFE_ESTATE: listaSinRooms,
    RENT_TO_BUY: listaSinRooms,
    HOLIDAY_RENT: listaHoliday
  }
  const propertyOptions = watch("operType") ? OPTIONS_LIST[watch("operType") as keyof typeof OPTIONS_LIST] : propertyOptionsRaw;
  // -------------------------------------------------------------------------------------------------

  // PRICE
  const PRICE_LIMITS = {
    SALE: {
      group1: { min: 10000, max: 5000000, step: 5000 }, // FLAT, HOUSE...
      group2: { min: 1000, max: 100000, step: 500 }    // GARAGE, STORAGE...
    },
    RENT: {
      group1: { min: 500, max: 500000, step: 500 },
      group2: { min: 50, max: 10000, step: 50 }
    },
    DEFAULT: { min: 0, max: 1000000, step: 1000 }
  };

  const getLimits = (operType: any, propType: any) => {
    const group1 = ['FLAT', 'APARTMENT', 'PENTHOUSE', 'DUPLEX', 'STUDIO', 'TERRACED_HOUSES', 'DETACHED_CHALETS', 'VILLAS', 'COTTAGE', 'BUNGALOW', 'LOFT', 'COMMERCIAL_PROPERTIES', 'LAND', 'OFFICES', 'BUILDINGS'];
    const type = (operType === 'SALE' || operType === 'LIFE_ESTATE') ? 'SALE' : (operType === 'RENT' || operType === 'RENT_TO_BUY' || operType === 'HOLIDAY_RENT' || operType === 'LIFE_ESTATE' || operType === 'SHARE' || operType === 'TRANSFER' ? 'RENT' : 'DEFAULT');

    if (type === 'DEFAULT') return PRICE_LIMITS.DEFAULT;

    const group = group1.includes(propType) ? 'group1' : 'group2';
    return PRICE_LIMITS[type][group];
  };

  // Calculamos los límites dinámicos
  const lastTypeRef = useRef("");
  const operType = watch("operType");
  const propType = watch("propType");
  const currentTypeKey = `${operType}-${propType}`;
  const limits = useMemo(() => getLimits(watch("operType"), watch("propType")), [watch("operType"), watch("propType")]);

  useEffect(() => {
    if (!isInitialLoaded) return;
    const currentTypeKey = `${watch("operType")}-${watch("propType")}`;
    if (lastTypeRef.current === currentTypeKey) return;

    setValue("priceMin", limits.min);
    setValue("priceMax", limits.max);
    lastTypeRef.current = currentTypeKey;
  }, [limits, isInitialLoaded, setValue]);

  const priceMin = Number(watch("priceMin") || limits.min);
  const priceMax = Number(watch("priceMax") || limits.max);

  // Reajustar valores si los límites cambian
  useEffect(() => {
    // 1. Si no ha cargado la URL, no hagas nada
    if (!isInitialLoaded) return;

    // 2. Si el tipo actual es el mismo que el guardado, no resetees precios
    // Esto evita que al cargar la URL (donde el tipo pasa de "" a "SALE"), 
    // si ya tenemos valores de precio, no los machaque.
    if (lastTypeRef.current === currentTypeKey) return;

    // 3. Si el tipo ha cambiado realmente (acción del usuario), actualizamos límites y guardamos el nuevo tipo
    setValue("priceMin", limits.min);
    setValue("priceMax", limits.max);

    lastTypeRef.current = currentTypeKey;
  }, [limits, setValue, isInitialLoaded, currentTypeKey]);

  // Lógica para evitar que los manejadores se crucen
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Impedimos que el mínimo supere al máximo actual menos un paso
    if (value <= priceMax - limits.step) {
      setValue("priceMin", value);
    } else {
      setValue("priceMin", priceMax - limits.step);
    }
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Impedimos que el máximo sea menor al mínimo actual más un paso
    if (value >= priceMin + limits.step) {
      setValue("priceMax", value);
    } else {
      setValue("priceMax", priceMin + limits.step);
    }
  };
  // -------------------------------------------------------------------------------------------------------------

  // URL BASE DE DATOS EN USER -> Al cargar, si existe una URL guardada, extraemos los parámetros para rellenar el form
  useEffect(() => {
    if (initialUrl && initialUrl.includes("?")) {
      const params = new URLSearchParams(initialUrl.split("?")[1]);
      const validKeys = Object.keys(searchSchema.shape);
      params.forEach((value, key) => {
        // 1. Validamos que la llave realmente exista en SearchFormValues
        if (!validKeys.includes(key)) return;

        const fieldKey = key as keyof SearchFormValues;
        let val: any = value;

        // 2. Conversión de tipos estricta
        if (value === "true") val = true;
        else if (value === "false") val = false;
        // Si el campo debe ser número según tu esquema
        else if (!isNaN(Number(value)) &&
          ["priceMin", "priceMax", "latitude", "longitude", "distance", "roomsMin", "bathroomsMin", "builtSizeMin"].includes(key)) {
          val = Number(value);
        }

        // 3. Seteo con validación de tipo para TS
        setValue(fieldKey, val, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true // Esto ayuda a que componentes externos como el Mapa se enteren del cambio
        });
      });

      // Lógica especial para tipos y municipio
      const urlOper = params.get("operType");
      const urlProp = params.get("propType");
      if (urlOper && urlProp) {
        lastTypeRef.current = `${urlOper}-${urlProp}`;
      }

      const urlMuni = params.get("municipality");
      if (urlMuni) {
        // Usar un timeout ligeramente mayor o asegurarse de que MapForm está listo
        setTimeout(() => {
          setValue("municipality", urlMuni, { shouldValidate: true });
        }, 100);
      }
    } else {
      reset();
    }
    setIsInitialLoaded(true);
  }, [initialUrl, setValue, reset]);
  // ------------------------------------------------------------------------------------------------

  const cancelAction = async () => {
    setIsLoading(false);
    setIsInitialLoaded(false);
    setError("");
    setSuccess("");
    setErrorRef("");
    setSuccessRef("");
    reset();
    window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => {
      setValue("longitude", undefined);
      setValue("latitude", undefined);
      setIsInitialLoaded(true);
    }, 100)
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    // console.log('data', data)

    if (data.operType && data.propType) {
      // Construcción de la URL
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== "" && value !== false && value !== undefined && value !== 0) {
          params.append(key, String(value));
        }
      });

      const fullUrl = `/properties?${params.toString()}`;
      // console.log('url', fullUrl)

      // Si está logueado, guardamos esta búsqueda como su última "urlSearch"
      if (userId) {
        await updateUserSearchUrl(userId, fullUrl);
      }

      // Navegamos a resultados eliminando el estado de carga para que el efecto de restaurar scroll se ejecute en PropertyInfiniteList
      router.push(fullUrl);
    }
  };

  return (
    <div className="form-container-100">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="form-grid">
        <section className="form-section">
          <div className="section-header">
            <span className="section-icon"><Tags /></span>
            <h3 className="section-title">Pricing & Classification / Features</h3>
          </div>
          <div className="section-content">
            <div className="field-group">
              <label className="field-label">
                Listing Type
                {errors.operType && (<p className='input-error'>{typeof errors.operType.message === 'string' ? errors.operType.message : 'Unexpected error format'}</p>)}
              </label>
              <select
                className="field-select"
                {...register("operType")}
              >
                <option value="">Select an option...</option>
                {operationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">
                Property Type
                {errors.propType && (<p className='input-error'>{typeof errors.propType.message === 'string' ? errors.propType.message : 'Unexpected error format'}</p>)}
              </label>
              <select
                className="field-select"
                {...register("propType")}
              >
                <option value="">Select an option...</option>
                {propertyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* PRICE */}
            {/* Dual Range Slider */}
            <div className="flex-col form-section">
              <label className="searchHeaders">
                Price selector
              </label>
              <div className="flex justify-between">
                <span className="text-sm text-left font-bold txtaccent">Base price: {Number(priceMin).toLocaleString()}€</span>
                <span className="text-sm text-right font-bold txtaccent">Ceiling price: {Number(priceMax).toLocaleString()}€</span>
              </div>
              <div className="relative h-10 flex items-center">
                <div className="absolute w-full h-2 bgsecondaryborder rounded-lg"></div>
                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={limits.step}
                  value={priceMin}
                  {...register("priceMin")}
                  onChange={handleMinChange}
                  style={{ accentColor: 'var(--app-accent)' }}
                  className={`absolute w-full appearance-none bg-transparent pointer-events-none slider-thumb ${priceMin > limits.max / 2 ? "z-30" : "z-20"
                    }`}
                />
                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={limits.step}
                  value={priceMax}
                  {...register("priceMax")}
                  onChange={handleMaxChange}
                  style={{ accentColor: 'var(--app-accent)' }}
                  className={`absolute w-full appearance-none bg-transparent pointer-events-none slider-thumb ${priceMin > limits.max / 2 ? "z-20" : "z-30"
                    }`}
                />
              </div>
              <p className="text-xs txtsecondaryfaded mt-1 text-center">Price bracket: {limits.min}€ - {limits.max}€</p>
            </div>

            {/* Características Extras */}
            <div className="form-section">
              <label className="searchHeaders">
                Features
              </label>
              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="checkbox-item">
                  <input type="checkbox" {...register("hasPool")} className="checkbox-input" />
                  <span className="checkbox-label">Has Pool</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" {...register("hasGarden")} className="checkbox-input" />
                  <span className="checkbox-label">Has Garden</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" {...register("hasLift")} className="checkbox-input" />
                  <span className="checkbox-label">Has Lift</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" {...register("centralHeating")} className="checkbox-input" />
                  <span className="checkbox-label">Central Heating</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" {...register("hasGarage")} className="checkbox-input" />
                  <span className="checkbox-label">Has Garage</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" {...register("hasTerrace")} className="checkbox-input" />
                  <span className="checkbox-label">Has Terrace</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" {...register("isNewDevelopment")} className="checkbox-input" />
                  <span className="checkbox-label">New Construction</span>
                </label>
              </div>
            </div>

          </div>
        </section>

        {/* Ubicación */}
        <section className="form-section">
          <MapForm register={register} watch={watch} setValue={setValue} errors={errors} isInitialLoaded={isInitialLoaded} coordenadas={false} />
          <div className="section-content pt-5">
            <div className="field-group">
              <label className="field-label">
                How far out are you looking?
                <span className="field-group txtaccent">
                  Enter the maximum search distance in kilometers
                </span>
              </label>
              <input
                type="number"
                step="1" min="5"
                className="field-input"
                placeholder="Search distance (Km)"
                {...register("distance")}
              />
            </div>
          </div>
        </section>

        {/* Habitaciones, Baños metros cuadrados */}
        <section className="form-section form-section-full">
          <div className="section-header">
            <span className="section-icon"><Scaling /></span>
            <h3 className="section-title">Size & Rooms</h3>
          </div>
          <div className="section-content grid-cols-3">
            <div className="field-group">
              <label className="field-label">
                Number minimum of rooms
              </label>
              <input
                type="number"
                step="1" min="0"
                className="field-input"
                placeholder="Min. bedrooms"
                {...register("roomsMin")}
              />
            </div>
            <div className="field-group">
              <label className="field-label">
                Number minimum of baths
              </label>
              <input
                type="number"
                step="1" min="0"
                className="field-input"
                placeholder="Min. bathrooms"
                {...register("bathroomsMin")}
              />
            </div>
            <div className="field-group">
              <label className="field-label">M² Built minimum</label>
              <input
                type="number"
                step="0.01" min="0"
                className="field-input"
                placeholder="Min. built surface"
                {...register("builtSizeMin")}
              />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            disabled={isLoading}
            className="basebutton appblackbutton"
            onClick={cancelAction}
          >
            Reset Form
          </button>
          <button type="submit" disabled={isLoading} className="basebutton appbutton">
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Collecting Data...
              </div>
            ) : <p>View Properties</p>}
          </button>
        </div>
      </form>

      <div className="mt-2 w-full flex justify-center min-h-5">
        {error && (<MsgError error={error} />)}
        {success && (<MsgSuccess success={success} />)}
      </div>
      <div className="mb-2 h-1 border-t border-dashed w-[80%] flex mx-auto justify-center" />
      <div className="w-full flex justify-center min-h-5">
        {errorRef && (<MsgError error={errorRef} />)}
        {successRef && (<MsgSuccess success={successRef} />)}
      </div>

      <SearchRefForm setIsLoading={setIsLoading} setError={setErrorRef} setSuccess={setSuccessRef} isLoading={isLoading} userId={userId} myProperties={false} edit={false} />
    </div>
  );
}