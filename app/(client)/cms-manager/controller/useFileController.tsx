import { useState } from "react";
import imageCompression from 'browser-image-compression';

export interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
}

export const useFileController = (error: string, setError: (m: string) => void) => {
  const [allImages, setAllImages] = useState<ImageItem[]>([]);
  const [initialImages, setInitialImages] = useState<number | null>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // HEMOS QUITADO el límite de 4MB porque la compresión se encargará de bajar el peso.
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        // Mantenemos la validación de dimensiones mínimas si la necesitas
        if (img.width < 3000 || img.height < 2000) {
          setError(`${error}\nLa imagen ${file.name} es pequeña (mín. 3000x2000px)`);
          resolve(false);
        } else resolve(true);
      };
      img.onerror = () => resolve(false);
    });
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const availableSlots = 20 - allImages.length;
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > availableSlots) {
      setError(`You can only add ${availableSlots} images (Max. 20)`);
    }

    // Tomamos solo los archivos que caben
    const filesToProcess = selectedFiles.slice(0, availableSlots);
    const newItems: ImageItem[] = [];

    for (const file of filesToProcess) {
      // if (allImages.length + newItems.length >= 20) break;
      const isValid = await validateImage(file);
      if (isValid) {
        newItems.push({
          id: `${Date.now()}-${file.name}`,
          url: URL.createObjectURL(file),
          file: file,
          isExisting: false
        });
      }
    }
    setAllImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAllImages((prev) => {
      const item = prev[index];
      if (item && !item.isExisting) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAllFiles = async (itemId: string) => {
    const formData = new FormData();
    formData.append("itemId", itemId);

    const keepImages = allImages.filter(img => img.isExisting).map(img => img.id);
    formData.append("keepImages", JSON.stringify(keepImages));

    const newFiles = allImages.filter(img => !img.isExisting && img.file);

    // --- LÓGICA DE COMPRESIÓN ANTES DE ENVIAR ---
    const compressionOptions = {
      maxSizeMB: 1,            // Intentará que cada foto pese menos de 1MB
      maxWidthOrHeight: 3000,  // Redimensiona si es mayor a esto (ahorra mucha RAM en server)
      useWebWorker: true,
    };

    if (newFiles.length > 0) {
      // console.log("Comprimiendo imágenes...");
      for (const img of newFiles) {
        try {
          // Comprimimos el archivo
          const compressedFile = await imageCompression(img.file!, compressionOptions);
          // Lo añadimos al FormData
          formData.append("files", compressedFile);
        } catch (err) {
          console.error("Fallo al comprimir, enviando original:", err);
          formData.append("files", img.file!);
        }
      }
    }

    // Validación de si hay algo que hacer
    const keepImagesObject = JSON.parse(formData.get("keepImages") as string);
    if (!formData.has("files") && keepImagesObject.length === initialImages) {
      return { success: true, message: "No images to upload" };
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          message: data.message // || "Files uploaded successfully"
        };
      } else {
        return {
          success: false,
          error: data.error // || "Error while uploading files"
        };
      }
    } catch (err) {
      console.error("Error en la petición fetch:", err);
      return {
        success: false,
        error: "Server connection error"
      };
    }
  };

  return {
    handleImageFile,
    allImages,
    setAllImages,
    setInitialImages,
    removeFile,
    uploadAllFiles,
  };
};
