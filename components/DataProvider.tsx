"use client";

import { createContext, useContext, useState } from "react";

// Definimos qué funciones y datos expone el Provider
interface DataContextType {
  itemsSaved: any[];
  updateItemStatus: (itemId: string, newState: string, idSaved?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ 
  children, 
  initialItemsSaved 
}: { 
  children: React.ReactNode, 
  initialItemsSaved: any[] 
}) => {
  // Convertimos los datos iniciales en un ESTADO de React
  const [itemsSaved, setItemsSaved] = useState(initialItemsSaved);

  // Esta función es la que llamaremos desde la página de detalles
  const updateItemStatus = (itemId: string, newState: string, idSaved: string = "") => {
    setItemsSaved((prev) => {
      const exists = prev.find((item) => item.itemId === itemId);
      if (exists) {
        // Si ya está en la lista, actualizamos su estado (ej: de "like" a "likeVisited")
        return prev.map((item) =>
          item.itemId === itemId ? { ...item, state: newState } : item
        );
      }
      // Si no estaba (es la primera vez que interactúa), lo añadimos
      return [...prev, { id: idSaved, itemId, state: newState }];
    });
  };

  return (
    <DataContext.Provider value={{ itemsSaved, updateItemStatus }}>
      {children}
    </DataContext.Provider>
  );
};

// Hook para usarlo en tus componentes
export const useItems = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useItems debe usarse dentro de DataProvider");
  return context;
};


