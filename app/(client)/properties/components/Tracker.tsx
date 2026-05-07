"use client";
import { useEffect, useState } from "react";
import { useItems } from "@/components/DataProvider";
import { saveItem } from "../controller/properties-controller";

import { useRouter } from 'next/navigation';
import { CircleArrowLeft, Heart } from 'lucide-react';

interface TrackerProps {
  idSaved: string;
  itemId: string;
  userId: string;
  state: string;
}

export function Tracker({ idSaved, itemId, userId, state }: TrackerProps) {
  const { updateItemStatus } = useItems();
  const [stateDetails, setStateDetails] = useState("");

  const router = useRouter();

  useEffect(() => {
    const markAsVisited = async () => {
      if (state !== "visited" && state !== "likeVisited") {
        const newState = state === "like" ? "likeVisited" : "visited";

        // Actualizamos UI
        updateItemStatus(itemId, newState, idSaved);

        // Guardamos y sincronizamos ID real de DB
        const result = await saveItem(idSaved, itemId, userId, newState);
        if (idSaved === "" && result) {
          const newItem = result.find((i: any) => i.itemId === itemId);
          if (newItem) {
            updateItemStatus(itemId, newState, newItem.id);
            setStateDetails(newState);
          }
        }
      } else {
        setStateDetails(state);
      }
    };
    if (userId && userId !== "") {
      markAsVisited();
    }
  }, []);

  const handleItem = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let newState = "";
    if (state === "likeVisited") newState = "visited";
    else if (state === "visited") newState = "likeVisited";

    // Actualizamos UI
    updateItemStatus(itemId, newState, idSaved);

    // Guardamos y sincronizamos ID real de DB
    if (userId && userId !== "") {
      try {
        const result = await saveItem(idSaved, itemId, userId, newState);
        if (idSaved === "" && result) {
          const newItem = result.find((i: any) => i.itemId === itemId);
          if (newItem) {
            updateItemStatus(itemId, newState, newItem.id);
            setStateDetails(newState);
          }
        } else {
          setStateDetails(newState);
        }
      } catch (error) {
        console.error("Error al guardar el estado:", error);
      }
    }
  };

  return (
    <>
      <button
        className={`p-3 rounded-full backdrop-blur-md transition-all viewerButton`}
        onClick={() => {
          sessionStorage.removeItem('pending_urls');
          router.back();
        }}
      >
        <CircleArrowLeft size={20} />
      </button>
      {(userId && userId !== "") && (
        <div className="p-3 rounded-full backdrop-blur-md transition-all viewerButton">
          <Heart
            size={24}
            onClick={handleItem}
            className={`transition-colors 
        ${stateDetails === "like" ? 'fill-red-500 text-red-500' : ''}
        ${stateDetails === "likeVisited" ? 'fill-red-500 text-green-500' : ''}
        ${stateDetails === "visited" ? 'fill-none text-green-500 hover:fill-red-500' : ''}
        ${stateDetails === "" ? 'fill-none text-white hover:fill-red-500' : ''}`}
          />
        </div>
      )}
    </>
  )
}