"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Video, Play, Globe, Home, Heart, CircleArrowLeft } from 'lucide-react';
import { Tracker } from '../../components/Tracker';

interface PropertyGalleryProps {
  item: {
    videoServerPath?: string;
    videoUrlPath?: string;
    virtualTourUrl?: string;
  };
  idSaved: string;
  itemId: string;
  userId: string;
  state: string;
}

export default function PropertyGallery({ item, idSaved, itemId, userId, state }: PropertyGalleryProps) {
  const [view, setView] = useState<'photos' | 'video_srv' | 'video_ext' | 'tour'>('photos');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const data = sessionStorage.getItem('pending_urls');
    // console.log('data', data)
    if (data) {
      const img = JSON.parse(data);
      if (img.length === 0) setImages([]);
      setImages(img);
    }
  }, []);

  // Efecto de fade-in inicial
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    // const savedScrollY = sessionStorage.getItem('last_scroll_pos');
    // console.log('getScroll', savedScrollY)

    const timer = setTimeout(() => setIsFirstLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <section className="relative w-full mt-5 max-w-337.5 mx-auto h-125 overflow-hidden rounded-[20px] bg-black shadow-lg group">

      {/* CONTENEDOR MULTIMEDIA PRINCIPAL */}
      <div className={`w-full h-full transition-opacity duration-1000 ${isFirstLoad ? 'opacity-0' : 'opacity-100'}`}>
        {view === 'photos' && (
          images && images.length > 0 ? (
            <img
              src={images[currentIndex]}
              alt={`Property ${itemId} ${currentIndex}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
          ) : (
            <div
              className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center"
              style={{ backgroundColor: "var(--app-bg-hover)", color: "var(--app-text)" }}
            >
              <Home size={40} strokeWidth={1.5} />
              <p className="text-xs mt-2 uppercase tracking-wider">No picture</p>
            </div>
          )
        )}

        {view === 'video_srv' && item.videoServerPath && item.videoServerPath !== "" && (
          <video controls className="w-full h-full bg-black">
            <source src={item.videoServerPath} type="video/mp4" />
          </video>
        )}

        {view === 'video_ext' && item.videoUrlPath && item.videoUrlPath !== "" && (
          <iframe
            src={item.videoUrlPath.replace("shorts/", "embed/").replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        )}

        {view === 'tour' && item.virtualTourUrl && item.virtualTourUrl !== "" && (
          <iframe src={item.virtualTourUrl} className="w-full h-full" />
        )}
      </div>

      {/* SELECTORES LATERALES (6 ICONOS) */}
      <div className="absolute right-4 top-4 flex flex-row gap-2 z-40 p-1 border rounded-full border-dotted border-[color-mix(in_srgb,var(--app-accent),transparent_50%)]">
        <Tracker idSaved={idSaved} itemId={itemId} userId={userId} state={state} />

        {images && images.length > 0 && (
          <button onClick={() => setView('photos')}
            className={`p-3 rounded-full backdrop-blur-md transition-all ${view === 'photos' ? 'viewerButtonActive' : 'viewerButton'}`}>
            <Camera size={20} />
          </button>
        )}

        {item.videoServerPath && (
          <button onClick={() => setView('video_srv')}
            className={`p-3 rounded-full backdrop-blur-md transition-all ${view === 'video_srv' ? 'viewerButtonActive' : 'viewerButton'}`}>
            <Video size={20} />
          </button>
        )}

        {item.videoUrlPath && (
          <button onClick={() => setView('video_ext')}
            className={`p-3 rounded-full backdrop-blur-md transition-all ${view === 'video_ext' ? 'viewerButtonActive' : 'viewerButton'}`}>
            <Play size={20} />
          </button>
        )}

        {item.virtualTourUrl && (
          <button onClick={() => setView('tour')}
            className={`p-3 rounded-full backdrop-blur-md transition-all ${view === 'tour' ? 'viewerButtonActive' : 'viewerButton'}`}>
            <Globe size={20} />
          </button>
        )}
      </div>

      {/* NAVEGACIÓN DE FOTOS (Solo si hay >1 foto y estamos en modo fotos) */}
      {view === 'photos' && images.length > 1 && (
        <>
          <button onClick={prev} className="carousel-btn carousel-btn-left group-hover:translate-x-0 -translate-x-2">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="carousel-btn carousel-btn-right group-hover:translate-x-0 translate-x-2">
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}