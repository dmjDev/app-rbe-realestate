"use client";
import { useEffect, useState } from "react";

const LoadingComponent = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // No renderiza nada en el servidor, evitando el preload
  
  return (
    <div className="bgprimary txtprimary flex flex-col items-center border-0 overflow-y-auto"
      style={{ height: 'calc(100vh - var(--navbar-h) - 2px)' }}>
      <div className="card-loading-container">
        <div className="loading-content">
          <img
            src="../loading.webp"
            alt="Loading..."
            className="loading-spinner"
          />
          <p className="loading-text txtsecondaryfaded">Loading</p>
        </div>
      </div>

      <style jsx>{`
        .card-loading-container {
          width: 300px;
          height: 300px;
          background-color: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          /*gap: 1px; /* Espacio entre el gif y el texto */
        }

        .loading-spinner {
          width: 80px;  /* Tamaño del icono */
          height: 80px;
          opacity: 0.9;
        }

        .loading-text {
          position: absolute;
          translate: 0 -30px;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 2.5rem;
          font-weight: 500;
          letter-spacing: 1px;
          /* Animación sutil de parpadeo para el texto */
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingComponent;