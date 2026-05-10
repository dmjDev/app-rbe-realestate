'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { saveItem } from "../controller/properties-controller";
import Link from 'next/link';
import { useItems } from '@/components/DataProvider';

interface ImageCarouselProps {
  images: string[];
  itemId: string;
  userId: string;
  edit: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, itemId, userId, edit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 1. Extrae AMBAS cosas del Provider
  const { itemsSaved, updateItemStatus } = useItems();

  // 2. Estos estados locales ahora se sincronizarán con el Provider
  const [savedState, setSavedState] = useState("");
  const [idSaved, setIdSaved] = useState("");

  const [isChanging, setIsChanging] = useState(false);

  // Sincronizamos el estado local con el Provider global
  useEffect(() => {
    // console.log('itemsSaved', itemsSaved)
    const currentItem = itemsSaved.find((item: any) => item.itemId === itemId);
    if (currentItem) {
      setIdSaved(currentItem.id);
      setSavedState(currentItem.state);
    } else {
      setSavedState("");
      setIdSaved("");
    }
  }, [itemsSaved, itemId]);

  const changeSlide = (newIndex: number) => {
    setIsChanging(true);
    // Pequeño timeout para sincronizar el fade-out antes de cambiar el src
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsChanging(false);
    }, 200);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    changeSlide(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    changeSlide(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleItem = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Calculamos el nuevo estado basado en el estado ACTUAL
    let newState = "";
    if (savedState === "like") newState = "";
    else if (savedState === "visited") newState = "likeVisited";
    else if (savedState === "likeVisited") newState = "visited";
    else newState = "like"; // Si está vacío o es cualquier otra cosa

    // 2. Actualizamos el PROVIDER inmediatamente (UI rápida)
    // Pasamos el idSaved actual. Si es "", el Provider sabrá que es nuevo.
    updateItemStatus(itemId, newState, idSaved);

    // 3. Sincronizamos con la BASE DE DATOS
    if (userId && userId !== "") {
      try {
        const result = await saveItem(idSaved, itemId, userId, newState);

        // Si el item era nuevo (idSaved era ""), Prisma nos devuelve el ID real
        // Debemos actualizar el Provider con ese ID para que el siguiente click sea un 'update' y no un 'create'
        if (idSaved === "" && result) {
          const newItem = result.find((i: any) => i.itemId === itemId);
          if (newItem) {
            updateItemStatus(itemId, newState, newItem.id);
          }
        }
      } catch (error) {
        console.error("Error al guardar el estado:", error);
      }
    }
  };

  if (!images || images.length === 0) {
    return (
      <Link scroll={false} href={`/properties/${itemId}?idSaved=${idSaved}&userId=${userId}&state=${savedState}&edit=${edit}`}
        onClick={() => {
          sessionStorage.removeItem('pending_urls');
        }}
      >
        <div
          className="relative h-64 w-full overflow-hidden flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--app-bg-hover)", color: "var(--app-text)" }}
        >
          <Home size={40} strokeWidth={1.5} />
          <p className="text-xs mt-2 uppercase tracking-wider">No picture</p>

          {/* ICONO CORAZÓN */}
          {userId != "" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={handleItem}
              className={`absolute top-3 right-3 z-30 transition-colors cursor-pointer lucide lucide-heart 
            ${savedState == "like" && 'fill-red-500 text-red-500'}
            ${savedState == "likeVisited" && 'fill-red-500 text-green-500'}
            ${savedState == "visited" && 'fill-none text-green-500 hover:fill-red-500'}
            ${savedState == "" && 'fill-none text-white hover:fill-red-500'}
            `}
            >
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="relative h-64 w-full overflow-hidden group bg-black">
      <Link scroll={false} href={`/properties/${itemId}?idSaved=${idSaved}&userId=${userId}&state=${savedState}&edit=${edit}`}
        onClick={() => {
          sessionStorage.setItem('pending_urls', JSON.stringify(images));
        }}
      >
        <img
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`${itemId} - ${currentIndex}`}
          loading="lazy"
          className={`h-full w-full object-cover transition-opacity duration-300 ease-in-out ${isChanging ? 'opacity-40' : 'opacity-100'
            }`}
        />
      </Link>

      {/* ICONO CORAZÓN */}
      {userId != "" && (
        <div className='heart-button'>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={handleItem}
            className={`cursor-pointer lucide lucide-heart 
            ${savedState == "like" && 'fill-red-500 text-red-500'}
            ${savedState == "likeVisited" && 'fill-red-500 text-green-500'}
            ${savedState == "visited" && 'fill-none text-green-500 hover:fill-red-500'}
            ${savedState == "" && 'fill-none text-white hover:fill-red-500'}
            `}
          >
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        </div>
      )}

      {/* Overlay gradiente inferior */}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Navegación */}
      {images.length > 1 && (
        <>
          <button onClick={prev} className="carousel-btn carousel-btn-left translate-x-0 sm:group-hover:translate-x-0 sm:-translate-x-2">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="carousel-btn carousel-btn-right translate-x-0 sm:group-hover:translate-x-0 sm:translate-x-2">
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};