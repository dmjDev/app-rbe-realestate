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
  const { itemsSaved, updateItemStatus } = useItems();

  const [savedState, setSavedState] = useState("");
  const [idSaved, setIdSaved] = useState("");

  // Estado para controlar la salida de la imagen actual
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
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
    // 1. Iniciamos el desvanecimiento de la imagen que SALE
    setIsExiting(true);
    
    // 2. Esperamos a que la imagen vieja sea casi invisible antes de cambiar el SRC
    setTimeout(() => {
      setCurrentIndex(newIndex);
      // 3. Quitamos el estado de salida para que la nueva imagen entre con su propia animación CSS
      setIsExiting(false);
    }, 250); // Un poco menos que la transición de CSS para que sea fluido
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
    let newState = "";
    if (savedState === "like") newState = "";
    else if (savedState === "visited") newState = "likeVisited";
    else if (savedState === "likeVisited") newState = "visited";
    else newState = "like";

    updateItemStatus(itemId, newState, idSaved);

    if (userId && userId !== "") {
      try {
        const result = await saveItem(idSaved, itemId, newState);
        if (idSaved === "" && result) {
          const newItem = result.find((i: any) => i.itemId === itemId);
          if (newItem) updateItemStatus(itemId, newState, newItem.id);
        }
      } catch (error) {
        console.error("Error al guardar el estado:", error);
      }
    }
  };

  if (!images || images.length === 0) {
    return (
      <Link scroll={false} href={`/properties/${itemId}?idSaved=${idSaved}&state=${savedState}&edit=${edit}`}
        onClick={() => sessionStorage.removeItem('pending_urls')}
      >
        <div
          className="relative h-64 w-full overflow-hidden flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--app-bg-hover)", color: "var(--app-text)" }}
        >
          <Home size={40} strokeWidth={1.5} />
          <p className="text-xs mt-2 uppercase tracking-wider">No picture</p>
          {userId != "" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              onClick={handleItem}
              className={`absolute top-3 right-3 z-30 cursor-pointer 
                ${savedState.includes("like") ? 'fill-red-500 text-red-500' : 'text-white'}
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
      <Link scroll={false} href={`/properties/${itemId}?idSaved=${idSaved}&state=${savedState}&edit=${edit}`}
        onClick={() => sessionStorage.setItem('pending_urls', JSON.stringify(images))}
      >
        <img
          key={images[currentIndex]} // La key es vital para disparar la animación de entrada
          src={images[currentIndex]}
          alt={`${itemId} - ${currentIndex}`}
          loading="lazy"
          className={`h-full w-full object-cover transition-opacity duration-300 ease-in-out animate-fade-in-quick
            ${isExiting ? 'opacity-10' : 'opacity-100'}
          `}
        />
      </Link>

      {/* ICONO CORAZÓN */}
      {userId != "" && (
        <div className='heart-button z-20'>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            onClick={handleItem}
            className={`cursor-pointer lucide-heart 
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

      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10" />

      {images.length > 1 && (
        <>
          <button onClick={prev} className="carousel-btn carousel-btn-left z-20 translate-x-0 sm:group-hover:translate-x-0 sm:-translate-x-2">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="carousel-btn carousel-btn-right z-20 translate-x-0 sm:group-hover:translate-x-0 sm:translate-x-2">
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
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