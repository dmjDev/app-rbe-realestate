"use client"

import { useRouter } from "next/navigation";
import { getRandomPropertyAction } from "../controller/properties-controller";

interface ItemListProps {
  userId: string;
}

export default function RandSearch({ userId }: ItemListProps) {
  const router = useRouter();

  const searchRand = async () => {
    const response = await getRandomPropertyAction();

    if (response.success && response.data) {
      const { itemId, isavedId, isavedState, imagePaths } = response.data;
      
      const idSaved = isavedId ?? "";
      const savedState = isavedState ?? "";
      const URL = `/properties/${itemId}?idSaved=${idSaved}&state=${savedState}&edit=${false}`;
      
      sessionStorage.setItem('pending_urls', JSON.stringify(imagePaths));
      
      // console.log('url randSearch', URL)
      router.push(URL);
    } else {
      console.error('error RAND: ', response.error);
    }
  }

  return (
    <button onClick={searchRand} className="basebutton appwhitebutton">
      Fortune is on my side
    </button>
  );
}