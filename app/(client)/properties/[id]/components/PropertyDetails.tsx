"use client";
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { PencilLine } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formatText = (str: any): string => {
  // 1. Si no es un string o está vacío, lo devolvemos tal cual (o vacío si es null)
  if (typeof str !== 'string' || str.length === 0) {
    return str ? String(str) : "";
  }

  // 2. Expresión regular para verificar si el primer carácter es una letra (vocal o consonante)
  // Incluye acentos y eñes (a-z, A-Z, áéíóúüñ...)
  const startsWithLetter = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(str);

  // 3. Si NO empieza por letra, devolvemos el texto original sin tocar nada
  if (!startsWithLetter) {
    return str;
  }

  // 4. Si empieza por letra, aplicamos el formato: Primera Mayúscula, resto minúsculas
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function PropertyDetails({ property, edit }: { property: any, edit: boolean }) {
  const hasCoords = property.latitude && property.longitude;
  const updatedAt = property.ipropUpdatedAt.split(',')[0];
  const isRenting = ['RENT', 'RENT_TO_BUY', 'HOLIDAY_RENT', 'LIFE_ESTATE'].includes(property.operType);
  let frequencyPay = '';
  if (isRenting && property.frequencyPay) {
    frequencyPay = `/${property.frequencyPay}`;
  }

  const router = useRouter();
  const handleEdit = () => {
    // console.log('edit', item.itemId)
    router.push(`/cms-manager?itemId=${property.itemId}`);
  }

  let address = "";
  if (property.showAddress) {
    if (property.streetName && property.streetName !== '') {
      address += formatText(property.streetName);
      if (property.streetNumber && property.streetNumber !== '') {
        address += `, ${property.streetNumber}`;
      }
      if (property.neighborhood && property.neighborhood !== '') {
        address += ` (${formatText(property.neighborhood)}) `;
      }
    } else if (property.neighborhood && property.neighborhood !== '') {
      address += `(${formatText(property.neighborhood)}) `;
    }
  }
  
  return (
    <div className="max-w-350 mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* --- CABECERA --- */}
      <header className="relative flex flex-col border-b border-dashed border-(--app-text-faded) pb-6 mb-3">
        {edit && (
          <>
            <button onClick={handleEdit} title={`Edit item ${property.itemRef} :: ${property.itemId}`}
              className='absolute right-3 sm:right-25 top-0 -translate-y-1/2 z-20 flex w-10 h-10 items-center justify-center bgTransparent50 border bgprimary rounded-full shadow-sm cursor-pointer'>
              <span className="txtprimary font-bold"><PencilLine /></span>
            </button>
          </>
        )}
        <div className="pl-5 flex items-center mt-0 sm:-mt-2 gap-2 txtaccent font-bold uppercase text-[10px] tracking-[0.3em]">
          <span className='text-right sm:text-left'>Reference <span className='whitespace-nowrap'>{property.itemRef}</span></span>
          <span className="opacity-30 text-3xl">&bull;</span>
          <span>Last updated {updatedAt}</span>
        </div>

        <div className="flex flex-col items-start mx-auto w-fit mt-3">
          <p className="-mb-2 ml-1 text-[10px] uppercase font-bold txtsecondary tracking-widest">
            {property.operType} price
          </p>
          <span className="text-5xl font-black txtsecondary whitespace-nowrap">
            {property.price && property.price > 0 ? (
              <>
                {property.price.toLocaleString()}
                <span className="text-2xl ml-1 font-light">€</span>
                <span className='text-2xl lowercase font-light txtsecondary'>{frequencyPay}</span>
              </>
            ) : (
              "Consultar"
            )}
          </span>
        </div>

        <h1 className="text-3xl text-center md:text-4xl font-black text-(--app-title) tracking-tighter leading-7">
          {property.itemName || ""}
        </h1>
      </header>

      <section className="pb-5">
        <h3 className="ml-5 text-xl txtaccent">{formatText("Description")}</h3>
        <div className="text-xl text-(--app-text) font-light italic leading-5">
          {property.itemDescription || ""}
        </div>
      </section>

      {/* data property */}
      <div className="grid grid-cols-1 md:grid-cols-3 gabp-2 md:gap-8">

        {/* CONTENEDOR GRUPO IZQUIERDO (Mapa + Fichas) */}
        <div className="contents md:flex md:flex-col md:col-span-2">
          <section className="order-3 md:order-1 mb-8">
            <h3 className="text-xl ml-5 txtaccent">
              {formatText("Location")}
              <span className='text-xl ml-5 txtaccent'>
                {address}
                {formatText(property.municipality)}, {formatText(property.province)}
              </span>
            </h3>
            <div className="w-full h-112.5 rounded-[20px] overflow-hidden border border-(--app-element-bg) bg-(--app-bg-second) relative shadow-inner">
              {hasCoords ? (
                <PropertyMap lat={Number(property.latitude)} lng={Number(property.longitude)} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center txtsecondary]">
                  <span className="text-5xl mb-4 opacity-20">📍</span>
                  <p className="font-black text-xl">{formatText("Ubicación no disponible")}</p>
                </div>
              )}
            </div>
          </section>

          <section className="order-4 md:order-2 mb-8 bg-(--app-bg-second) p-10 rounded-[20px] border border-(--app-element-bg)">
            <h3 className="text-xl txtaccent mb-8 pl-2">{formatText("Specs")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <DetailItem label="Year of construction" value={property.builtYear} />
              <DetailItem label="Is new development" value={property.isNewDevelopment ? "Yes" : "No"} />
              <DetailItem label="HOA Fees" value={property.communityCosts ? `${property.communityCosts} €/monthly` : ""} />
              <DetailItem label="Annual TAX" value={property.annualTax ? `${property.annualTax} €/yearly` : ""} />
              <DetailItem label="Orientación" value={property.orientation} />
              <DetailItem label="Kind of floor" value={property.flooringMaterial} />
              <DetailItem label="All windows exterior" value={property.isExterior ? "Yes" : "No"} />
              <DetailItem label="Usefull size" value={property.usefulSize ? `${property.usefulSize} m²` : ""} />
            </div>
          </section>

          <section className="order-5 md:order-3 mb-8 bg-(--app-bg-second) p-10 rounded-[20px] border border-(--app-element-bg)">
            <h3 className="text-xl txtaccent mb-8 pl-2">{formatText("Features")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <BoolItem label="Lift" value={property.hasLift} />
              <BoolItem label="Garden" value={property.hasGarden} />
              <BoolItem label="Pool" value={property.hasPool} />
              <BoolItem label="Terrace" value={property.hasTerrace} />
              <BoolItem label="Balcony" value={property.hasBalcony} />
              <BoolItem label="Storage room" value={property.hasStorageRoom} />
              <BoolItem label="Garage" value={property.hasGarage} />
              <BoolItem label="Is furnished" value={property.isFurnished} />
              <BoolItem label="Floating floor" value={property.floatingFloor} />
              <BoolItem label="Central heating" value={property.centralHeating} />
              <BoolItem label="Underfloor heating" value={property.underfloorHeating} />
              <BoolItem label="Ducted air conditioner" value={property.ductedAirc} />
              <BoolItem label="Splits air conditioner" value={property.splitsAirc} />
              <BoolItem label="Climalit windows" value={property.climalitWindow} />
              <BoolItem label="Thermal bidge windows" value={property.thermalBridgeWindow} />
              <BoolItem label="Electric blinds" value={property.electricBlinds} />
              <BoolItem label="Premium appliance" value={property.premiumAppliance} />
              <BoolItem label="Sea sight" value={property.seaSight} />
              <BoolItem label="Mountain sight" value={property.mountainSight} />
              <BoolItem label="Cultural sight" value={property.culturalSight} />
              <BoolItem label="Common rooms" value={property.commonRooms} />
              <BoolItem label="Common pool" value={property.commonPool} />
              <BoolItem label="Common gym" value={property.commonGym} />
              <BoolItem label="Padel area" value={property.padelArea} />
              <BoolItem label="Children area" value={property.childrenArea} />
              <BoolItem label="Social area" value={property.socialArea} />
              <BoolItem label="Goalkeeper" value={property.goalkeeper} />
              <BoolItem label="Security cameras" value={property.securityCameras} />
              <BoolItem label="Alarm" value={property.alarm} />
              <BoolItem label="Barrier-free accessibility" value={property.accesibility} />
            </div>
          </section>
        </div>

        {/* CONTENEDOR GRUPO DERECHO (Características + Energía + Contacto) */}
        <div className="contents md:flex md:flex-col md:col-span-1">
          <section className="order-1 md:order-1 my-8">
            <div className='mb-3 ml-5'>
              {property.operType} {property.propType} {property.isOwner ? 'by particular seller' : 'by agency'}
            </div>
            <div className="grid grid-cols sm:grid-cols-2 gap-1">
              <QuickCard label="rooms" value={property.rooms} />
              <QuickCard label="bathrooms" value={property.bathrooms} />
              <QuickCard label="builtSize (m²)" value={property.builtSize} />
              <QuickCard label="floor" value={property.floor} />
            </div>
          </section>

          <section className="order-2 md:order-2 mb-8">
            <div className="bgTransparent50 txtaccent p-6 rounded-[20px] shadow-2xl relative overflow-hidden border border-(--app-element-bg)">
              <span className="text-xl txtaccent block pb-3">{formatText("Energy efficiency")}</span>
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <EnergyBox
                  label="Energy rating"
                  val={property.energyRating}
                  type="energy"
                />
                <EnergyBox
                  label="Emissions rating"
                  val={property.emissionsRating}
                  type="emissions"
                />
              </div>
              <div className="absolute -right-6 -bottom-6 text-9xl font-black opacity-[0.1] select-none">CERT</div>
            </div>
          </section>

          <section className="order-6 md:order-3 mb-8">
            <div className="p-8 rounded-[40px] bg-(--app-bg-second) border border-(--app-element-bg) space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-(--app-accent) flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-(--app-accent)]/20">
                  {property.isOwner && "O" || "A"}
                </div>
                <div>
                  <h4 className="font-black text-(--app-title) uppercase text-sm leading-tight">
                    {property.isOwner && "Owner Name" || "Agent Name"}
                  </h4>
                  <p className="text-xl txtaccent leading-4 mt-1">
                    {formatText(property.isOwner && "private seller" || "professional seller")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="basebutton appbutton" 
                  onClick={() => {
                    alert("Under Construction")
                  }}>
                  More info
                </button>
                <button className="basebutton appwhitebutton" 
                  onClick={() => {
                    alert("Under Construction")
                  }}>
                  Get a Date
                </button>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div >
  );
}

/* --- COMPONENTE MAPA (Basado en tu MapLibre) --- */
function PropertyMap({ lat, lng }: { lat: number, lng: number }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const streetStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
  const satelliteStyle = `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`;

  useEffect(() => {
    if (!mapContainer.current || !MAPTILER_KEY || map.current) return;

    // Interceptamos temporalmente los warnings de la consola para MapLibre
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('SDF') || args[0]?.includes?.('image')) return;
      originalWarn(...args);
    };

    // 2. Usamos un pequeño timeout (0ms) para sacar la inicialización del ciclo de renderizado inmediato
    const initTimeout = setTimeout(() => {
      if (!mapContainer.current) return;

      try {
        const m = new maplibregl.Map({
          container: mapContainer.current,
          style: isSatellite ? satelliteStyle : streetStyle,
          center: [lng || -3.7037, lat || 40.4167], // [lng || -0,117777, lat || 38,843145] // Pego
          zoom: 16,
          trackResize: true,
          fadeDuration: 100,
          pitch: 45,
          maxPitch: 85,
        });

        map.current = m;

        m.addControl(new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true // La brújula se inclina en 3D
        }), 'top-right');

        m.on('load', () => {
          new maplibregl.Marker({ color: "#FF0000" })
            .setLngLat([lng || -3.7037, lat || 40.4167])
            .addTo(m);
        });
      } catch (err) {
        console.warn("Re-intentando carga de mapa...");
      }
    }, 50);

    return () => {
      clearTimeout(initTimeout);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [MAPTILER_KEY]);

  const toggleStyle = () => {
    if (!map.current) return;
    const newStyle = isSatellite ? streetStyle : satelliteStyle;
    map.current.setStyle(newStyle);
    setIsSatellite(!isSatellite);
  };

  return (
    <div className="w-full h-full relative">
      <button
        onClick={toggleStyle}
        className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-black/5"
      >
        {isSatellite ? "🗺️ Mapa" : "🛰️ Satélite"}
      </button>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

/* --- COMPONENTES AUXILIARES --- */
function EnergyBox({ label, val, type }: { label: string, val: string, type: 'energy' | 'emissions' }) {
  // Obtenemos el color dinámico
  const barColor = getColor(val?.toUpperCase(), type);

  return (
    <div>
      <p className="text-lg txtsecondary mb-6 leading-4 h-3">
        {formatText(label)}
      </p>
      <div className="flex items-center gap-4">
        <span className={`${val !== 'PENDING' ? 'text-7xl' : 'text-xl'} font-black leading-none tracking-tighter uppercase`}>
          {val ? val : '-'}
        </span>
        {val && val !== 'PENDING' && val !== '-' && (
          /* Aplicamos el color mediante style para poder usar hexadecimales precisos */
          <div
            className="h-12 w-1.5 rounded-full transition-colors duration-500"
            style={{ backgroundColor: barColor }}
          ></div>
        )}
      </div>
    </div>
  );
}
function getColor(val: string, type: 'energy' | 'emissions') {
  if (!val || val === 'PENDING' || val === '-') return 'transparent';

  const energyColors: Record<string, string> = {
    'A': '#00a651', // Verde oscuro
    'B': '#52b848', // Verde
    'C': '#bfd730', // Verde claro
    'D': '#fff200', // Amarillo
    'E': '#fdb913', // Naranja claro
    'F': '#f37021', // Naranja
    'G': '#ed1c24', // Rojo
  };

  const emissionsColors: Record<string, string> = {
    'A': '#008b8b', // Turquesa oscuro
    'B': '#20b2aa', // Verde azulado claro
    'C': '#afeeee', // Cian pálido
    'D': '#fff9ae', // Crema/Amarillo pálido
    'E': '#ffcc33', // Naranja amarillento
    'F': '#ff4500', // Naranja rojizo
    'G': '#800000', // Granate
  };

  return type === 'energy' ? energyColors[val] : emissionsColors[val];
}

function QuickCard({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-(--app-bg-second) border border-(--app-element-bg) p-3 rounded-[20px] hover:border-(--app-accent) transition-all group cursor-default flex flex-row md:flex-col lg:flex-row justify-center items-center gap-3">
      <p className="text-[16px] font-bold text-(--app-text) text-right md:text-center lg:text-right">{formatText(label)}</p>
      <p className="text-4xl font-black text-(--app-title) leading-tight">{value || "—"}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex justify-between items-center px-2 py-4 border-b border-(--app-element-bg) last:border-0">
      <span className="text-(--app-text) font-light text-xl">{formatText(label)}</span>
      <span className=" pl-3 font-black text-(--app-text) text-xl text-right">
        {formatText(value || "—")}
      </span>
    </div>
  );
}

function BoolItem({ label, value }: { label: string, value: any }) {
  let tsxml = <></>;
  if (value === 'true' || value === true) tsxml = (
    <div className="flex justify-between items-center px-2 py-4 border-b border-(--app-element-bg) last:border-0">
      <span className="text-(--app-text) font-light text-xl">{formatText(label)}</span>
    </div>
  );

  return tsxml;
}