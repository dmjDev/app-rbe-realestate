"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';

const HomeDesign = () => {
  const [randImg, setRandImg] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRandImg(Math.floor(Math.random() * 9) + 1);
  }, []);

  return (
    <section className="relative w-full mt-5 max-w-337.5 mx-auto h-125 bg-transparent shadow-2xl group">

      {/* CONTENEDOR MULTIMEDIA PRINCIPAL */}
      <div className="relative w-full h-full overflow-hidden rounded-[20px] bgprimary">
        {randImg && (
          <Image
            src={`/home/home_${randImg}.webp`}
            alt={`RBE ${randImg}`}
            fill
            priority
            sizes="(max-width: 1350px) 100vw, 1350px"
            onLoad={() => setIsLoaded(true)} // Se activa cuando la imagen descarga
            className={`
              object-cover 
              transition-all duration-2000ms ease-out
              ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
            `}
          />
        )}
      </div>
      <div className="absolute w-full top-20 [@media(min-width:400px)]:top-30 left-1/2 -translate-x-1/2">
        <h1 className="px-10 text-4xl md:text-6xl text-white text-center font-bold mb-6 [text-shadow:0_1px_10px_rgb(0_0_0/50%)]">
          Real Better Estate
          <span className="block text-3xl text-cyan-600">Your next chapter isn’t just a place, it’s a Real Better Estate</span>
        </h1>
        <p className="px-10 text-lg text-white text-justify leading-5 [text-shadow:0_1px_10px_rgb(0_0_0/80%)] hidden sm:block ">
          Success isn't just achieved; it is felt in the peace of your own sanctuary. Beyond a property, you are seeking a space that recognizes you—a temple where your energy finds its perfect balance. Stop searching and start inhabiting the life you’ve envisioned. Your corner of the world is waiting; it’s time to step across the threshold.
        </p>
      </div>
    </section>
  )
}

export default HomeDesign