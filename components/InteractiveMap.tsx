"use client";
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

interface MapProps {
  lat: number;
  lng: number;
  onChange: (name: any, value: number) => void;
}

export default function InteractiveMap({ lat, lng, onChange }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
          pitch: 0,
          maxPitch: 85,
        });

        map.current = m;

        // 1. AÑADIR BRÚJULA Y ZOOM (Arriba a la derecha)
        // El botón de satélite lo moveremos un poco para que no se solapen
        m.addControl(new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true // La brújula se inclina en 3D
        }), 'top-right');

        m.on('load', () => {
          marker.current = new maplibregl.Marker({ color: "#FF0000" })
            .setLngLat([lng || -3.7037, lat || 40.4167])
            .addTo(m);
        });

        m.on('click', (e) => {
          const { lng: newLng, lat: newLat } = e.lngLat;
          onChange("latitude", Number(newLat.toFixed(6)));
          onChange("longitude", Number(newLng.toFixed(6)));
        });
      } catch (err) {
        console.warn("Re-intentando carga de mapa...");
      }
    }, 50); // Un delay mínimo de 50ms suele bastar para estabilizar el DOM

    return () => {
      clearTimeout(initTimeout);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [MAPTILER_KEY]);

  // Función para cambiar el estilo dinámicamente
  const toggleStyle = () => {
    if (!map.current) return;
    const newStyle = isSatellite ? streetStyle : satelliteStyle;
    map.current.setStyle(newStyle);
    setIsSatellite(!isSatellite);
  };

  // Sincronización Inputs -> Mapa
  useEffect(() => {
    if (map.current && marker.current && !isNaN(lat) && !isNaN(lng)) {
      marker.current.setLngLat([lng, lat]);
      // map.current.easeTo({ center: [lng, lat], duration: 500 });
      map.current.flyTo({ center: [lng, lat], essential: true });
    }
  }, [lat, lng]);

  return (
    <div className="col-span-2" style={{ width: '100%', height: '350px', position: 'relative' }}>

      {/* Botón Satélite */}
      <button
        onClick={toggleStyle}
        type="button"
        style={{
          position: 'absolute', top: '10px', right: '45px', zIndex: 10,
          background: 'white', border: 'none', padding: '6px 10px',
          borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
        }}
      >
        {isSatellite ? "🗺️ Streets" : "🛰️ Satellite"}
      </button>

      {/* ICONO INFORMATIVO CON CONTROL DE ESTADO */}
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          position: 'absolute', top: '100px', right: '11px', zIndex: 10,
          background: 'white', width: '29px', height: '29px', borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.1)', cursor: 'help'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#333', fontSize: '14px', fontFamily: 'serif' }}>i</span>

        {/* Tooltip con visibilidad controlada por React */}
        <div style={{
          position: 'absolute', right: '40px', top: '0', width: '240px',
          background: 'rgba(30, 30, 30, 0.95)', color: 'white', padding: '15px',
          borderRadius: '8px', fontSize: '12px', lineHeight: '1.5',
          pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          // Lógica de visibilidad
          display: showTooltip ? 'block' : 'none',
          opacity: showTooltip ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out'
        }}>
          <strong style={{ color: '#4dabf7', fontSize: '13px' }}>Map Instructions</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '5px' }}><strong>Select:</strong> Left-click to place marker and get coordinates.</li>
            <li style={{ marginBottom: '5px' }}><strong>Move:</strong> Hold left-click and drag to pan.</li>
            <li style={{ marginBottom: '5px' }}><strong>Zoom:</strong> Use mouse wheel to zoom in/out.</li>
            <li style={{ marginBottom: '5px' }}><strong>3D View:</strong> Hold right-click and move up/down for perspective.</li>
            <li><strong>Rotate:</strong> Hold right-click and move left/right to turn.</li>
          </ul>
        </div>
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden' }} className='form-section' />
    </div>
  );
}
