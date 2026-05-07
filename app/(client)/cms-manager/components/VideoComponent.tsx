"use client";

import React, { useState, ChangeEvent, useImperativeHandle, forwardRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { MyFormValues } from "../schemas/formInterface";
import dynamic from "next/dynamic";
import { FolderOpen, Video } from "lucide-react";
const ReactPlayer = dynamic<any>(
  () => import("react-player").then((mod) => mod.default || mod),
  { ssr: false }
);

export interface VideoComponentHandle {
  uploadVideo: (id: string) => Promise<boolean>;
  deleteVideo: (id: string) => Promise<boolean>;
  hasFile: boolean;
  isDeleted: boolean;
  reset: () => void;
}

interface VideoComponentProps {
  propertyId?: string; // ID para cargar video existente
}

const VideoComponent = forwardRef<VideoComponentHandle, VideoComponentProps>(({ propertyId }, ref) => {
  const { register, getValues, watch } = useFormContext<MyFormValues>();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExistingVideoDeleted, setIsExistingVideoDeleted] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<string>("");
  const [activeTour, setActiveTour] = useState<string>("");

  // Limpieza de memoria si queremos que al guardar y volver a cargar no se vea el video
  // useEffect(() => {
  //   return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  // }, [previewUrl]);

  // CLIC EN CANCEL -> ELIMINA VIDEOURL Y TOURURL
  const videoValue = watch("videoUrl");
  useEffect(() => {
    if (!videoValue) {
      setActiveVideo("");
    }
  }, [videoValue]);
  const tourValue = watch("virtualTourUrl");
  useEffect(() => {
    if (!tourValue) {
      setActiveTour("");
    }
  }, [tourValue]);

  // Efecto para verificar si existe un video previo mediante tu API
  useEffect(() => {
    const checkExistingVideo = async () => {
      if (!propertyId || propertyId === "undefined") {
        setPreviewUrl(null);
        return;
      }

      const relativePath = `${propertyId}/${propertyId}.mp4`;
      const apiUrl = `/api/media?path=${encodeURIComponent(relativePath)}&v=${Date.now()}`;

      try {
        // Usamos GET en lugar de HEAD para poder leer el Content-Type de la respuesta
        const response = await fetch(apiUrl);

        if (response.ok) {
          const contentType = response.headers.get("content-type");

          // Si el servidor nos devuelve un JSON, significa que entró por el 'else' de la API (no hay video)
          if (contentType && contentType.includes("application/json")) {
            setPreviewUrl(null);
            setIsExistingVideoDeleted(false);
          } else {
            // Si es un video u otro formato binario, lo mostramos
            setPreviewUrl(apiUrl);
            setIsExistingVideoDeleted(false);
          }
        } else {
          setPreviewUrl(null);
        }
      } catch (error) {
        setPreviewUrl(null);
      }
    };

    checkExistingVideo();
  }, [propertyId]);

  useImperativeHandle(ref, () => ({
    uploadVideo: async (id: string) => {
      if (!file) return false;
      return await executeUpload(id);
    },
    deleteVideo: async (id: string) => {
      try {
        const res = await fetch(`/api/uploadMedia?itemId=${id}`, { method: 'DELETE' });
        return res.ok;
      } catch (error) {
        return false;
      }
    },
    hasFile: !!file,
    isDeleted: isExistingVideoDeleted,
    reset: () => {
      setFile(null);
      setPreviewUrl(null);
      setIsExistingVideoDeleted(false);
      setProgress(0);
    }
  }));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "video/mp4" || selectedFile.size > 10 * 1024 * 1024) {
        alert("Archivo no válido: MP4 y máximo 10MB");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsExistingVideoDeleted(false); // Si seleccionamos uno nuevo, anulamos el estado de borrado
    }
  };

  const removeVideo = () => {
    // Si la URL actual es de la API, significa que estamos borrando uno que ya existía
    if (previewUrl?.includes('/api/media')) {
      setIsExistingVideoDeleted(true);
    }
    setFile(null);
    setPreviewUrl(null);
    const input = document.getElementById('videoFile') as HTMLInputElement;
    if (input) input.value = '';
  };

  const executeUpload = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("video", file!);
      formData.append("itemId", id);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });

      xhr.addEventListener("load", () => {
        setUploading(false);
        resolve(xhr.status === 200);
      });

      xhr.addEventListener("error", () => {
        setUploading(false);
        resolve(false);
      });

      xhr.open("POST", "/api/uploadMedia");
      xhr.send(formData);
    });
  };

  // VIDEOURL
  const handleViewVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    let url = getValues("videoUrl");

    if (url && typeof url === "string") {
      let cleanUrl = url.trim();

      if (url.includes("tiktok.com")) {
        const match = url.match(/\/video\/(\d+)/);
        const tiktokId = match ? match[1] : null;

        if (tiktokId) {
          setActiveVideo(`https://www.tiktok.com/embed/v2/${tiktokId}`);
        }
        return;
      }
      if (cleanUrl.includes("youtu.be/")) {
        const id = cleanUrl.split("youtu.be/")[1].split("?")[0]; // Evitar parámetros extra
        cleanUrl = `https://www.youtube.com/watch?v=${id}`;
      }

      setActiveVideo("");

      setTimeout(() => {
        setActiveVideo(cleanUrl);
      }, 100);
    }
  };
  const handleVideoKeyDown = () => {
    setActiveVideo("");
  };

  // VIRTUALTOURURL
  const handleViewTour = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = getValues("virtualTourUrl");
    if (url) {
      setActiveTour(url.trim());
    }
  };
  const handleTourKeyDown = () => {
    setActiveTour("");
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <span className="section-icon"><Video /></span>
        <h3 className="section-title">Add Video and virtual Tour</h3>
      </div>
      <div className="section-content">
        <div className="field-group">
          <label className="field-label">Property video</label>
          <div className="file-input-wrapper">
            {!previewUrl ? (
              <>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="video/mp4"
                  className="file-input"
                  id="videoFile"
                />
                <label htmlFor="videoFile" className="file-input-label">
                  <span className="file-icon"><FolderOpen /></span>
                  <span>Select MP4 video...</span>
                </label>
              </>
            ) : (
              <div className="relative group">
                <video
                  key={previewUrl} // Forzar recarga si cambia la URL
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg shadow-sm max-h-48 bg-black"
                />
                {!uploading && (
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10 flex items-center justify-center"
                    title="Delete"
                  >
                    <svg className="h-7 w-7 txterror" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="txtsecondary text-sm italic scroll-pt-0.5 max-w-100">
            {uploading && <>Saving process - {progress}% uploaded</>}
          </div>
          <div className="field-divider">or enter a Video URL</div>
          <div className="flex">
            <input
              type="text"
              maxLength={300}
              className={"field-input"}
              placeholder="https://youtube.com/watch?v=..."
              onKeyDown={handleVideoKeyDown}
              {...register("videoUrl")}
            />
            <button
              type="button"
              className="addButton"
              onClick={handleViewVideo}
            >
              View Video
            </button>
          </div>
          {activeVideo && (
            <div className="mt-6" key={activeVideo}>
              <div className={`relative bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 ${activeVideo.includes("tiktok.com")
                ? "aspect-9/16 max-w-75 mx-auto" // Formato vertical para TikTok
                : "pt-[40%]" // 56.25 Formato 16:9 para YouTube/Otros -> 40 para que se vea más bajito
                }`}>
                {(activeVideo.includes("youtube.com") || activeVideo.includes("youtu.be")) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.includes("v=")
                      ? activeVideo.split("v=")[1].split("&")[0]
                      : activeVideo.split("/").pop()
                      }?autoplay=1`}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeVideo.includes("tiktok.com") ? (
                  <iframe
                    src={activeVideo}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="fullscreen"
                    title="TikTok video player"
                  />
                ) : (
                  <ReactPlayer
                    url={activeVideo}
                    className="absolute top-0 left-0"
                    width="100%"
                    height="100%"
                    controls
                    playing
                  />
                )}
              </div>
            </div>
          )}
          <div className="field-divider">Enter a Virtual Tour URL</div>
          <div className="flex">
            <input
              type="text"
              maxLength={300}
              className="field-input"
              placeholder="https://matterport.com/show?m=..."
              onKeyDown={handleTourKeyDown}
              {...register("virtualTourUrl")}
            />
            <button
              type="button"
              className="addButton"
              onClick={handleViewTour}
            >
              View Tour
            </button>
          </div>

          {activeTour && ( // https://my.matterport.com/show/?m=RsKKA9cRJnj&play=1&ts=0
            <div className="mt-6" key={activeTour}>
              <div className="relative w-full aspect-16/7 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                  src={activeTour}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen
                  allow="xr-spatial-tracking"
                  title="Virtual Tour"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

VideoComponent.displayName = "VideoComponent";
export default VideoComponent;
