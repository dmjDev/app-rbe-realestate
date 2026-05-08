"use client"

import { FormProvider } from "react-hook-form";
import { useFormController } from "../controller/useFormController";
import { GlobalComponent } from "./GlobalComponent";
import { FileComponent } from "./FileComponent";
import VideoComponent from "./VideoComponent";
import { useEffect, useState } from "react";
import MsgError from "@/components/MsgError";
import MsgSuccess from "@/components/MsgSuccess";
import { auth } from "@/lib/auth/auth";

type Session = typeof auth.$Infer.Session; // PRISMA SESSION

// FILEUPLOADER
import { useFileController } from "../controller/useFileController";
import SearchRefForm from "../../properties/components/SearchRefForm";
// ------------------------------------------------------------------------------------------

export const FormComponent = ({ session, propertieData }: { session: Session, propertieData: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errorRef, setErrorRef] = useState("");
  const [successRef, setSuccessRef] = useState("");
  const [injectedRef, setInjectedRef] = useState("");

  // FILEUPLOADER - Instanciamos el controlador aquí para tener control total
  const fileController = useFileController(error, setError);
  useEffect(() => {
    const fetchDiskImages = async () => {
      if (propertieData?.id) {
        try {
          const response = await fetch(`/api/get-images?id=${propertieData.id}`);
          const files: string[] = await response.json();
          fileController.setInitialImages(files.length as any);

          if (files.length > 0) {
            const mapped = files.map(name => ({
              id: name,
              url: `/api/images?path=${propertieData.id}/${name}&v=${Date.now()}`,
              isExisting: true
            }));
            fileController.setAllImages(mapped);
          }
        } catch (e) {
          console.error("Error cargando imágenes existentes", e);
        }
      }
    };
    fetchDiskImages();
  }, [propertieData?.id]);
  // ------------------------------------------------------------------------------------------

  const {
    methods,
    FEATURE_LIST,
    handleSubmitForm,
    newFormAction,
    videoRef,
    FilesRef
  } = useFormController(session, error, setError, setSuccess, setErrorRef, setSuccessRef, setIsLoading, fileController, propertieData);

  // VACIAMOS LOS VALORES DE SESSIONSTORAGE PARA QUE LOS VUELVA A CARGAR SI HACEMOS UNA NUEVA BÚSQUEDA, DE LO CONTRARIO MANTENDRÁ LOS DE LA BÚSQUEDA ANTERIOR, YA SEA AQUÍ POR PARÁMETROS, POR REFERENCIA O POR USERID
  useEffect(() => {
    if ('scrollRestoration' in history) { history.scrollRestoration = 'manual' };
    if ('pending_urls' in sessionStorage) { sessionStorage.removeItem('pending_urls') };
    if ('last_id_results' in sessionStorage) { sessionStorage.removeItem('last_id_results') };
    if ('last_prov_results' in sessionStorage) { sessionStorage.removeItem('last_prov_results') };
    if ('last_search_results' in sessionStorage) { sessionStorage.removeItem('last_search_results') };
    if ('last_scroll_pos' in sessionStorage) { sessionStorage.removeItem('last_scroll_pos') };

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <FormProvider {...methods}>
      <div className="form-main">
        <div className="form-container-100">
          <div className="form-header-left">
            <h1 className="form-title">Search your properties</h1>
          </div>

          <div>
            {errorRef && (<MsgError error={errorRef} />)}
            {successRef && (<MsgSuccess success={successRef} />)}
          </div>

          <div className="mb-6">
            <SearchRefForm setIsLoading={setIsLoading} setError={setErrorRef} setSuccess={setSuccessRef} isLoading={isLoading} userId={session.user.id} myProperties={true} forceValue={injectedRef} edit={true} />
          </div>

          <div className="form-header-left">
            <h1 className="form-title">
              {propertieData ? (
                <>
                  Update Property
                  <button
                    type="button"
                    onClick={() => setInjectedRef(propertieData.itemRef)}
                    className="ml-2 txtaccent hover:underline cursor-pointer bg-transparent border-none p-0 inline-block font-bold"
                    title="Click to copy to search field"
                  >
                    Ref: {propertieData.itemRef}
                  </button>
                </>
              ) : (
                "Create New Property"
              )}
            </h1>
            <p className="form-subtitle">Please enter the property details below</p>
          </div>

          <div>
            {error && (<MsgError error={error} />)}
            {success && (<MsgSuccess success={success} />)}
          </div>

          <form onSubmit={handleSubmitForm} className="form-grid">
            <GlobalComponent homePromo={propertieData?.homePromo} setSuccess={setSuccess} FEATURE_LIST={FEATURE_LIST} />
            <FileComponent ref={FilesRef} error={error} setError={setError} controller={fileController} />
            <VideoComponent propertyId={propertieData?.id} ref={videoRef} />

            <div className="form-actions">
              {propertieData && (
                <button type="button" disabled={isLoading} className="basebutton delbutton"
                  onClick={() => {
                    alert("Under Construction")
                  }}>
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
                      Deleting Data...
                    </div>
                  ) : <p>Delete Property</p>}
                </button>
              )}
              <button
                type="button"
                disabled={isLoading}
                className="basebutton appblackbutton"
                onClick={newFormAction}
              >
                Reset Form
              </button>
              <button type="submit" disabled={isLoading} className="basebutton appbutton">
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
                    Updating Data...
                  </div>
                ) : <p>Save Data</p>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};
