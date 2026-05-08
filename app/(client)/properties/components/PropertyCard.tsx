"use client"

import { ImageCarousel } from './ImageCarousel';
import { Bed, Bath, MapPin, House, KeyRound, Compass, ChevronsUpDown, Leaf, Car, WavesLadder, AirVent, Zap, Play, Globe, PencilLine } from 'lucide-react';
import Link from "next/link";
import { PropertyItem } from '../controller/properties-controller';
import { useRouter } from 'next/navigation';

export function PropertyCard({ item, userId, edit }: { item: PropertyItem, userId: string, edit: boolean }) {
  const router = useRouter();

  const handleEdit = () => {
    // console.log('edit', item.itemId)
    router.push(`/cms-manager?itemId=${item.itemId}`);
  }

  let priceMeter = 0;
  if (item.builtSize) {
    priceMeter = item.price / item.builtSize;
  }

  const isRenting = ['RENT', 'RENT_TO_BUY', 'HOLIDAY_RENT', 'LIFE_ESTATE'].includes(item.operType);
  let frequencyPay = '';
  if (isRenting && item.frequencyPay) {
    frequencyPay = `/${item.frequencyPay}`;
  }

  const primerIconoFeaturesSearch = () => {
    if (item.isNewDevelopment) return 'isNewDevelopment';
    if (item.hasLift) return 'hasLift';
    if (item.hasGarden) return 'hasGarden';
    if (item.hasGarage) return 'hasGarage';
    if (item.hasPool) return 'hasPool';
    if (item.centralHeating) return 'centralHeating';
    return '';
  }
  const primerIconoSpecsSearch = () => {
    if (item.rooms) return 'rooms';
    if (item.bathrooms) return 'bathrooms';
    if (item.orientation) return 'orientation';
    return '';
  }
  const primerIconoFeatures = primerIconoFeaturesSearch();
  const primerIconoSpecs = primerIconoSpecsSearch();

  return (
    // <article key={item.itemId} id={item.itemId} className='property-card group relative'>
    <article key={item.itemId} id={item.itemId} className={`
    ${!item.active ? 'property-card-inactive group relative' : 'property-card group relative'}
    `}>
      <div className='relative h-64 w-full overflow-hidden rounded-t-lg'>
        <ImageCarousel images={item.imagePaths} itemId={item.itemId} userId={userId} edit={edit} />
      </div>
      {edit && (
        <>
          <button onClick={handleEdit} title={`Edit item ${item.itemRef} :: ${item.itemId}`}
            className='absolute left-5 top-64 -translate-y-1/2 z-20 flex w-10 h-10 items-center justify-center bgTransparent50 border bgprimary rounded-full shadow-sm cursor-pointer'>
            <span className="txtprimary font-bold"><PencilLine /></span>
          </button>
        </>
      )}

      <div className="absolute top-54 right-2 z-10 flex items-center gap-2">
        {item.latitude && item.longitude && (
          <Link href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`} target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <MapPin size={16}><title>Map location</title></MapPin>
            </div>
          </Link>
        )}
        {item.videoUrl && (
          <Link href={item.videoUrl} target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <Play size={16}><title>View Video</title></Play>
            </div>
          </Link>
        )}
        {item.virtualTourUrl && (
          <Link href={item.virtualTourUrl} target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <Globe size={16}><title>View Virtual Tour</title></Globe>
            </div>
          </Link>
        )}
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="price-tag">{item.price.toLocaleString()}€<span className='text-lg lowercase font-light txtsecondaryfaded'>{frequencyPay}</span></div>
        <div className="ref-tag">
          <span>{item.itemRef}</span>
          <span>{new Date(item.updatedAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}</span>
        </div>
        <h3 className="font-bold text-lg leading-4 line-clamp-2" style={{ color: "var(--app-text)" }}>
          {item.itemName}
        </h3>

        <div className="leading-3" style={{ color: "var(--app-text)" }}>
          <div className="flex w-full text-sm">
            <div className="flex-1 text-nowrap overflow-hidden text-ellipsis">
              <span>{item.operType}</span> · <span>{item.propType}</span>
            </div>
            <div className="flex-1 text-center">{item.floor && `Floor: ${item.floor}`}</div>
            <div className="flex-1 text-right">
              {item.builtSize &&
                <span
                  tabIndex={0}
                  className="relative cursor-pointer group focus:outline-none border-b border-dotted"
                >
                  Built {item.builtSize}m²

                  {/* Tooltip personalizado */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-focus:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50">
                    {Math.round(priceMeter)} €/m²
                    {/* Flechita del tooltip */}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black"></span>
                  </span>
                </span>
              }
            </div>
          </div>
          <div className="flex items-center text-sm txtaccent">
            <House size={14} className="mr-1 shrink-0" />
            <span className="line-clamp-2 leading-3 py-2">{item.address}</span>
          </div>
        </div>

        <div className="py-2 flex flex-wrap items-center gap-2">
          {item.isNewDevelopment && (
            <div
              tabIndex={0}
              className="relative group/icon cursor-pointer focus:outline-none p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)"
            >
              <KeyRound size={16} />
              <span className="absolute bottom-full 
              left-0 
              mb-2 hidden group-hover/icon:block group-focus/icon:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none">
                New development
                <span className="absolute top-full 
                left-3 
                border-8 border-transparent border-t-black"></span>
              </span>
            </div>
          )}

          {item.hasLift && (
            <div
              tabIndex={0}
              className="relative group/icon cursor-pointer focus:outline-none p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)"
            >
              <ChevronsUpDown size={16} />
              <span className={`absolute bottom-full 
              ${primerIconoFeatures === 'hasLift' ? 'left-0' : 'left-1/2 -translate-x-1/2'} 
              mb-2 hidden group-hover/icon:block group-focus/icon:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Has lift
                <span className={`absolute top-full 
                ${primerIconoFeatures === 'hasLift' ? 'left-3' : 'left-1/2 -translate-x-1/2'}  
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}

          {item.hasGarden && (
            <div
              tabIndex={0}
              className="relative group/icon cursor-pointer focus:outline-none p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)"
            >
              <Leaf size={16} />
              <span className={`absolute bottom-full 
              ${primerIconoFeatures === 'hasGarden' ? 'left-0' : 'left-1/2 -translate-x-1/2'}  
              mb-2 hidden group-hover/icon:block group-focus/icon:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Has garden
                <span className={`absolute top-full 
                ${primerIconoFeatures === 'hasGarden' ? 'left-3' : 'left-1/2 -translate-x-1/2'} 
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}

          {item.hasGarage && (
            <div
              tabIndex={0}
              className="relative group/icon cursor-pointer focus:outline-none p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)"
            >
              <Car size={16} />
              {/* Usamos group-hover/icon y group-focus/icon */}
              <span className={`absolute bottom-full 
              ${primerIconoFeatures === 'hasGarage' ? 'left-0' : 'left-1/2 -translate-x-1/2'} 
              mb-2 hidden group-hover/icon:block group-focus/icon:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Has garage
                <span className={`absolute top-full 
                ${primerIconoFeatures === 'hasGarage' ? 'left-3' : 'left-1/2 -translate-x-1/2'}  
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}

          {item.hasPool && (
            <div
              tabIndex={0}
              className="relative group/icon cursor-pointer focus:outline-none p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)"
            >
              <WavesLadder size={16} />
              <span className={`absolute bottom-full 
              ${primerIconoFeatures === 'hasPool' ? 'left-0' : 'left-1/2 -translate-x-1/2'} 
              mb-2 hidden group-hover/icon:block group-focus/icon:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Has pool
                <span className={`absolute top-full 
                ${primerIconoFeatures === 'hasPool' ? 'left-3' : 'left-1/2 -translate-x-1/2'}   
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}

          {item.centralHeating && (
            <div
              tabIndex={0}
              className="relative group/icon cursor-pointer focus:outline-none p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)"
            >
              <AirVent size={16} />
              <span className={`absolute bottom-full 
              ${primerIconoFeatures === 'centralHeating' ? 'left-0' : 'left-1/2 -translate-x-1/2'} 
              mb-2 hidden group-hover/icon:block group-focus/icon:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Has central heating
                <span className={`absolute top-full 
                ${primerIconoFeatures === 'centralHeating' ? 'left-3' : 'left-1/2 -translate-x-1/2'} 
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-400">
          {item.rooms && (
            <div
              tabIndex={0}
              className="relative group/detail cursor-pointer focus:outline-none flex items-center gap-1"
            >
              <div className="p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)">
                <Bed size={16} />
              </div>
              <span className="text-sm font-bold">{item.rooms}</span>

              <span className="absolute bottom-full 
              left-0 
              mb-2 hidden group-hover/detail:block group-focus/detail:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none">
                Rooms
                <span className="absolute top-full 
                left-3 
                border-8 border-transparent border-t-black"></span>
              </span>
            </div>
          )}

          {item.bathrooms && (
            <div
              tabIndex={0}
              className="relative group/detail cursor-pointer focus:outline-none flex items-center gap-1"
            >
              <div className="p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)">
                <Bath size={16} />
              </div>
              <span className="text-sm font-bold">{item.bathrooms}</span>

              <span className={`absolute bottom-full 
              ${primerIconoSpecs === 'bathrooms' ? 'left-0' : 'left-1/2 -translate-x-1/2'} 
              mb-2 hidden group-hover/detail:block group-focus/detail:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Bathrooms
                <span className={`absolute top-full 
                ${primerIconoSpecs === 'bathrooms' ? 'left-3' : 'left-1/2 -translate-x-1/2'} 
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}

          {item.orientation && (
            <div
              tabIndex={0}
              className="relative group/detail cursor-pointer focus:outline-none flex items-center gap-1"
            >
              <div className="p-1.5 rounded-lg bg-(--app-bg-hover) text-(--app-accent)">
                <Compass size={16} />
              </div>
              <span className="text-sm font-bold">{item.orientation}</span>

              <span className={`absolute bottom-full 
              ${primerIconoSpecs === 'orientation' ? 'left-0' : 'left-1/2 -translate-x-1/2'}  
              mb-2 hidden group-hover/detail:block group-focus/detail:block bg-black text-white text-sm p-2 rounded whitespace-nowrap shadow-xl z-50 pointer-events-none`}>
                Orientation
                <span className={`absolute top-full 
                ${primerIconoSpecs === 'orientation' ? 'left-3' : 'left-1/2 -translate-x-1/2'} 
                border-8 border-transparent border-t-black`}></span>
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}