import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MyFormValues, formSchema, PropertyFullDetail } from "../schemas/formInterface";
import { useEffect, useMemo, useRef } from "react";
import { auth } from "@/lib/auth/auth";
import { createItemWithProperty, updateItemWithProperty } from "./item-create";
import { useRouter } from "next/navigation";

// FORWARDREF FILEPLOADER
import { FileComponentHandle } from "../components/FileComponent";
// --------------------------------------
// FORWARDREF VIDEOUPLOADER
import { VideoComponentHandle } from "../components/VideoComponent";
// --------------------------------------

const FEATURE_LIST = [
  "hasLift", "hasGarden", "hasPool", "hasTerrace",
  "hasBalcony", "hasStorageRoom", "hasGarage", "isFurnished",
  "floatingFloor", "centralHeating", "underfloorHeating",
  "ductedAirc", "splitsAirc", "climalitWindow",
  "thermalBridgeWindow", "electricBlinds", "premiumAppliance",
  "seaSight", "mountainSight", "culturalSight",
  "commonRooms", "commonPool", "commonGym", "padelArea",
  "childrenArea", "socialArea", "goalkeeper",
  "securityCameras", "alarm", "accesibility"
] as const;
const INITIAL_FORM_VALUES: MyFormValues = {
  itemName: "",
  itemDescription: "",
  itemRef: "",
  active: true,
  isOwner: false,
  // Para los Enums, usa "" (cadena vacía) para que el select vuelva al placeholder
  operType: "" as any,
  propType: "" as any,
  // Para los números, undefined los deja en blanco
  price: null as any,       //null
  priceMin: null as any,    //null
  builtSize: null as any,   //null
  usefulSize: null as any,  //null
  rooms: null as any,       //null
  bathrooms: null as any,   //null
  communityCosts: null as any, //null
  annualTax: null as any,   //null
  // Enums restantes
  frequencyPay: "" as any,
  orientation: "" as any,
  flooringMaterial: "" as any,
  energyRating: "" as any, // O el valor por defecto de tu Enum
  emissionsRating: "" as any,
  // Otros
  province: "",
  municipality: "",
  neighborhood: "",
  streetName: "",
  streetNumber: "",
  floor: "",
  latitude: null as any,    //null
  longitude: null as any,   //null
  isExterior: false,
  showAddress: false,
  isNewDevelopment: false,
  builtYear: null as any,   //null
  imgUrl: [],
  imgUrlAdd: "",
  videoUrl: "",
  virtualTourUrl: "",
  // Features (esto suele resetearse bien porque es un objeto plano)
  features: FEATURE_LIST.reduce((acc, feat) => ({ ...acc, [feat]: false }), {}),
} as MyFormValues;

type Session = typeof auth.$Infer.Session;

export const useFormController = (
  session: Session,
  error: string,
  setError: (m: string) => void,
  setSuccess: (m: string) => void,
  setErrorRef: (m: string) => void,
  setSuccessRef: (m: string) => void,
  setIsLoading: (m: boolean) => void,
  fileController: any,
  propertieData: any
) => {
  const router = useRouter();
  // FORWARDREF FILEUPLOADER
  const FilesRef = useRef<FileComponentHandle>(null);
  // --------------------------------------
  // FORWARDREF VIDEOUPLOADER
  const videoRef = useRef<VideoComponentHandle>(null);
  // --------------------------------------

  useEffect(() => {
    if (!sessionStorage.getItem('itemForm_started')) {
      setError(`Error message checked !`);
      setSuccess(`Success message checked !`);
      setErrorRef(`Error message checked !`);
      setSuccessRef(`Success message checked !`);
      setTimeout(() => {
        setError("");
        setSuccess("");
        setErrorRef("");
        setSuccessRef("");
      }, 5000);
      sessionStorage.setItem('itemForm_started', 'true');
    }
  }, [])


  // CARGA DE DATOS POR DEFECTO PARA LOS CAMPOS DEL FORMULARIO
  const mapDataToForm = (data: PropertyFullDetail): MyFormValues => {
    const p = data.iprops;

    return {
      itemName: data.itemName || "",
      itemDescription: data.itemDescription || "",
      itemRef: data.itemRef || "",
      active: data.active,
      isOwner: p?.isOwner,

      // Campos de la tabla Property
      price: p?.price || null,                        // null
      priceMin: p?.priceMin || null,                  // null ---
      isNewDevelopment: p?.isNewDevelopment,
      builtYear: p?.builtYear || null,                // null
      province: p?.province || "",
      municipality: p?.municipality || "",
      neighborhood: p?.neighborhood || "",
      streetName: p?.streetName || "",
      streetNumber: p?.streetNumber || "",
      floor: p?.floor || "",
      isExterior: p?.isExterior,
      showAddress: p?.showAddress,
      latitude: p?.latitude || null,                //null
      longitude: p?.longitude || null,              //null
      builtSize: p?.builtSize || null,              //null ---
      usefulSize: p?.usefulSize || null,            //null ---
      rooms: p?.rooms || null,                      //null ---
      bathrooms: p?.bathrooms || null,              //null ---
      communityCosts: p?.communityCosts || null,    //null ---
      annualTax: p?.annualTax || null,              //null

      // Enums (TS validará que coincidan con MyFormValues)
      operType: p?.operType || undefined, //as OperationType,
      propType: p?.propType || undefined, //as PropertyType,
      orientation: p?.orientation || undefined,
      energyRating: p?.energyRating || undefined,
      emissionsRating: p?.emissionsRating || undefined,
      flooringMaterial: p?.flooringMaterial || undefined,
      frequencyPay: p?.frequencyPay || undefined,

      // Multimedia
      imgUrl: Array.isArray(p?.imgUrl) ? p.imgUrl : [],
      imgUrlAdd: "",
      videoUrl: p?.videoUrl || "",
      virtualTourUrl: p?.virtualTourUrl || "",

      // Mapeo automático de booleanos (Features)
      features: FEATURE_LIST.reduce((acc, feat) => ({
        ...acc,
        [feat]: !!p?.[feat]
      }), {}),
    } as MyFormValues;
  };
  const formattedData = propertieData 
  ? mapDataToForm(propertieData) 
  : undefined;
  // console.log('formattedData', formattedData)

  const methods = useForm<MyFormValues>({
    resolver: zodResolver(formSchema) as any,
    mode: "onChange",
    defaultValues: formattedData || INITIAL_FORM_VALUES
  });

  useEffect(() => {
    if (propertieData && propertieData !== null) {
      methods.reset(mapDataToForm(propertieData));
    } else {
      methods.reset({
        ...INITIAL_FORM_VALUES
      }, {
        keepDefaultValues: false,
        keepDirtyValues: false,
        keepValues: false
      });
      if (videoRef.current?.hasFile) videoRef.current.reset();
      if (FilesRef.current?.hasFiles) FilesRef.current.reset();
    }
  }, [propertieData, methods]);
  // -------------------------------------------------------------------------------------------------

  // Handler para el form CREATE Y UPDATE
  // Función de utilidad para limpiar números
  const parseNumber = (value: any) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };
  const handleSubmitForm = methods.handleSubmit(async (data: MyFormValues) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const managerId = session.user.id;
    let localSuccess = "";
    let localError = "";

    const cleanedData = {
      ...data,
      price: data.price ? parseNumber(data.price) : null,
      priceMin: data.priceMin ? parseNumber(data.priceMin) : null,
      builtSize: data.builtSize ? parseNumber(data.builtSize.toFixed(0)) : null,
      usefulSize: data.usefulSize ? parseNumber(data.usefulSize.toFixed(0)) : null,
      rooms: data.rooms ? parseInt(data.rooms as any) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms as any) : null,
      communityCosts: data.communityCosts ? parseNumber(data.communityCosts) : null,
      latitude: data.latitude ? parseNumber(data.latitude) : null,
      longitude: data.longitude ? parseNumber(data.longitude) : null,
    };

    // console.log('ID Usuario:', managerId);
    // console.log('Datos validados por Zod listos para enviar:', data);

    try {
      // Server Action
      const response = propertieData && propertieData !== null ?
        await updateItemWithProperty(propertieData.id, cleanedData) :
        await createItemWithProperty(cleanedData, managerId);

      if (!response.error) {
        let itemId = "";
        propertieData && propertieData !== null ?
          itemId = propertieData.id :
          itemId = response.data?.id as string;

        // FILEUPLOADER 
        if (itemId) {
          const response = await fileController.uploadAllFiles(itemId);

          if (response.success) {
            // Aquí capturamos el mensaje detallado (éxitos + errores parciales)
            localSuccess = response.message;
          } else {
            // Aquí capturamos el error crítico (status 500 o fallo de red)
            localError = response.error;
          }
        }
        !propertieData && fileController.setAllImages([]);
        // --------------------------------------

        // VIDEOUPLOADER
        if (itemId) {
          if (videoRef.current?.hasFile) {
            const videoSuccess = await videoRef.current.uploadVideo(itemId);
            if (videoSuccess) {
              localSuccess != '' ? localSuccess += "\nVideo uploaded succefully" : localSuccess = "Video uploaded succefully";
            } else {
              localError != '' ? localError += "\nSomething went wrong while saving your video" : localError = "Something went wrong while saving your video";
            }
            // videoRef.current?.reset();
          } else {
            localSuccess != '' ? localSuccess += "\nNo video to upload" : localSuccess = "No video to upload";
          }

          if (videoRef.current?.isDeleted) {
            const videoSuccess = await videoRef.current.deleteVideo(itemId);
            if (videoSuccess) {
              localSuccess != '' ? localSuccess += "\nVideo deleted succefully" : localSuccess = "Video deleted succefully";
            } else {
              localError != '' ? localError += "\nSomething went wrong while deleting your video" : localError = "Something went wrong while deleting your video";
            }
            videoRef.current?.reset();
          }
        }
        // --------------------------------------

        // console.log('Petición finalizada con éxito:', response.data);
        localSuccess != '' ? localSuccess += "\nThe information has been successfully updated" : localSuccess = "The information has been successfully updated";

        if ('pending_urls' in sessionStorage) { sessionStorage.removeItem('pending_urls') };
        if ('last_id_results' in sessionStorage) { sessionStorage.removeItem('last_id_results') };
        if ('last_prov_results' in sessionStorage) { sessionStorage.removeItem('last_prov_results') };
        if ('last_search_results' in sessionStorage) { sessionStorage.removeItem('last_search_results') };
        if ('last_scroll_pos' in sessionStorage) { sessionStorage.removeItem('last_scroll_pos') };

        setSuccess(localSuccess);
        setError(localError);

      } else {
        setError(response.error as any);
      }

      if (!propertieData || propertieData === null) {
        // methods.reset();
        methods.reset({
          ...INITIAL_FORM_VALUES
        }, {
          keepDefaultValues: false,
          keepDirtyValues: false,
          keepValues: false
        });

        if (localError === '') {
          router.refresh();
          // router.push(`/properties?userId=${managerId}`)
        }
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth' // 'smooth' para desplazamiento suave, 'instant' para salto inmediato
      });
    } catch (error: any) {
      setError(error || "Server error");
    } finally {
      setIsLoading(false);
    }
  });

  const newFormAction = () => {
    methods.reset();

    if (videoRef.current?.hasFile) videoRef.current.reset();
    if (FilesRef.current?.hasFiles) FilesRef.current.reset();

    setError("");
    setSuccess("");
    setErrorRef("");
    setSuccessRef("");

    if ('pending_urls' in sessionStorage) { sessionStorage.removeItem('pending_urls') };
    if ('last_id_results' in sessionStorage) { sessionStorage.removeItem('last_id_results') };
    if ('last_prov_results' in sessionStorage) { sessionStorage.removeItem('last_prov_results') };
    if ('last_search_results' in sessionStorage) { sessionStorage.removeItem('last_search_results') };
    if ('last_scroll_pos' in sessionStorage) { sessionStorage.removeItem('last_scroll_pos') };

    router.refresh();
    router.push('/cms-manager')

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 'smooth' para desplazamiento suave, 'instant' para salto inmediato
    });
  };

  return {
    methods,
    FEATURE_LIST,
    handleSubmitForm,
    newFormAction,
    videoRef,
    FilesRef
  };
};