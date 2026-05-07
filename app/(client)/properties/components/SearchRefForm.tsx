"use client";

import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemRefFormValues, itemRefSchema } from "@/app/(client)/cms-manager/schemas/formInterface";
import { getPropertyByReference } from "../controller/properties-controller";
import { ArrowBigRight, Info } from "lucide-react";
import { useEffect } from "react";

interface SearchRefFormProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (message: string) => void;
  isLoading?: boolean;
  userId?: string;
  myProperties?: boolean;
  forceValue?: string;
  edit: boolean;
}

const SearchRefForm = ({ setIsLoading, setError, setSuccess, isLoading, userId, myProperties, forceValue, edit }: SearchRefFormProps) => {
  const router = useRouter();

  const { register: itemRefRegister, handleSubmit: handleItemRefSubmit, setValue, formState: { errors: itemRefErrors } } = useForm<ItemRefFormValues>({
    resolver: zodResolver(itemRefSchema) as Resolver<ItemRefFormValues>
  });

  // CARGA DE REF DESDE EL FROMULARIO PADRE
  useEffect(() => {
    if (forceValue) {
      setValue("itemRef", forceValue);
    }
  }, [forceValue, setValue]);

  interface ImageData {
    url: string;
  }
  const onSubmitRef = async (data: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const response = await getPropertyByReference(data.itemRef.trim(), userId as string);

    if (response.success) {
      setSuccess(response.message as string);

      const itemId = response.data?.itemId;
      const idSaved = response.data?.isavedId ?? "";
      const savedState = response.data?.isavedState ?? "";
      const URL = `/properties/${itemId}?idSaved=${idSaved}&userId=${userId}&state=${savedState}&edit=${edit}`;
      sessionStorage.setItem('pending_urls', JSON.stringify(response.data?.imagePaths));
      router.push(URL);
    } else {
      setError(response.error as string);
    }
    setIsLoading(false);
  };

  const handleViewMyProperties = () => {
    const URL = `/properties?userId=${userId}`;
    router.push(URL);
  };

  return (
    <form onSubmit={handleItemRefSubmit(onSubmitRef)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="form-grid">
      <section className="form-section form-section-full">
        {!myProperties && (
          <div className="section-header">
            <span className="section-icon"><Info /></span>
            <h3 className="section-title">Search by Reference</h3>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className={`field-group ${myProperties ? 'col-span-2' : 'col-span-3'}`}>
            <label className="field-label">
              Item Reference
              {itemRefErrors.itemRef && (<p className='input-error'>{typeof itemRefErrors.itemRef.message === 'string' ? itemRefErrors.itemRef.message : 'Unexpected error format'}</p>)}
            </label>
            <input
              type="text"
              className="field-input"
              placeholder="Enter a reference : SEFL-001/26"
              {...itemRefRegister("itemRef", { onChange: () => setError("") })}
            />
          </div>
          <div className="md:col-span-1 mb-0.5">
            <button type="submit" disabled={isLoading} className="basebutton appbutton w-full">
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Collecting Data...
                </div>
              ) :
                <div className="flex items-center justify-center whitespace-nowrap">
                  <ArrowBigRight className="mr-5" />
                  <p className="whitespace-normal">View Reference</p>
                </div>
              }
            </button>
          </div>
          {myProperties && (
            <div className="md:col-span-1 mb-0.5">
              <button type="button" onClick={handleViewMyProperties} disabled={isLoading} className="basebutton appbutton">
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Collecting Data...
                  </div>
                ) :
                  <div className="flex item-nowrap items-center justify-center">
                    View My Properties
                  </div>
                }
              </button>
            </div>
          )}
        </div>
      </section>
    </form>
  )
}

export default SearchRefForm;