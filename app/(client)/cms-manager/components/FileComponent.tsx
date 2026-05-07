import { forwardRef, useImperativeHandle, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MyFormValues } from "../schemas/formInterface";
import { ImageItem } from "../controller/useFileController";
import { Camera, FolderOpen } from "lucide-react";

interface FileComponentProps {
  error: string;
  setError: (m: string) => void;
  controller: any;
}
// FORWARDREF: DEFINIMOS LA INTERFAZ DONDE LE DECIMOS AL PADRE QUE FUNCIONES VAMOS A PODER UTILIZAR
export interface FileComponentHandle {
  hasFiles: boolean;
  reset: () => void;
}

// FORWARDREF FILEPLOADER
export const FileComponent = forwardRef<FileComponentHandle, FileComponentProps>(
  ({ error, setError, controller }, ref) => {
    const { register, getValues, setValue, watch } = useFormContext<MyFormValues>();
    const { handleImageFile, allImages, setAllImages, removeFile } = controller;

    // FORWARDREF: ESTAS SON LAS FUNCIONES QUE PODREMOS USAR DESDE EL COMPONENTE PADRE
    useImperativeHandle(ref, () => ({
      hasFiles: !!allImages,
      reset: () => {
        // console.log('reset files')
        setAllImages([]);
      }
    }));

    const [hoveredName, setHoveredName] = useState<string>("");
    const [hoveredUrl, setHoveredUrl] = useState<string>("");

    const addImgURLForm = (e?: React.SyntheticEvent) => {
      e?.preventDefault();

      const newUrl = getValues("imgUrlAdd");
      if (!newUrl) return;

      const currentImages = getValues("imgUrl") || [];

      // Guardamos el ARRAY real, no un string
      setValue("imgUrl", [...currentImages, { url: newUrl }]);
      setValue("imgUrlAdd", ""); // Limpiar el campo de texto tras añadir
    }

    const removeURL = (index: number) => {
      const currentImages = getValues("imgUrl") || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      setValue("imgUrl", updatedImages, { shouldValidate: true });
    };

    const tsxml_file =
      <section className="form-section">
        <div className="section-header">
          <span className="section-icon"><Camera /></span>
          <h3 className="section-title">Add Pictures</h3>
        </div>
        <div className="section-content">
          <div className="field-group">
            <label className="field-label">Property picture</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                multiple
                onClick={() => { setError("") }}
                onChange={handleImageFile}
                accept=".jpg,.jpeg,.png,.webp,.tiff,.avif"
                className="file-input"
                id="imageFile"
              />
              <label htmlFor="imageFile" className="file-input-label">
                <span className="file-icon"><FolderOpen /></span>
                <span>Select JPG, JPEG, PNG, WEBP, TIFF or AVIF files...</span>
              </label>
            </div>
            
            {/* LISTADO ÚNICO DE IMÁGENES (LOCALES Y SERVIDOR) */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 pt-0.5">
              {allImages.map((img: ImageItem, i: number) => (
                <div
                  key={img.id}
                  className="relative shrink-0 group"
                  onMouseEnter={() => setHoveredName(img.file?.name || img.id)}
                  onMouseLeave={() => setHoveredName("")}
                >
                  <img
                    src={img.url}
                    alt={img.id}
                    className={`w-20 h-20 object-cover rounded-xl border shadow-lg transition-filter duration-300 group-hover:brightness-75 
                      ${img.isExisting ? 'border border-(--app-moon)' : 'border-[3px] border-(--app-accent)'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => { removeFile(i); setHoveredName(''); }}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10 flex items-center justify-center"
                    title="Delete"
                  >
                    <svg className="h-7 w-7 txterror" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="txtsecondary text-sm italic scroll-pt-0.5 max-w-100"
              style={{
                wordBreak: 'break-all',
                overflowWrap: 'break-word'
              }}>
              {hoveredName || `${allImages.length} / 20 pictures`}
            </div>

            <div className="field-divider">or enter an URL list</div>

            <div className="flex">
              <input
                type="text"
                maxLength={300}
                className="field-input"
                placeholder="https://www.istockphoto.com/es/foto/..."
                {...register("imgUrlAdd")}
              />
              <button className="addButton" onClick={addImgURLForm}>
                Add URL
              </button>
            </div>
            {/* Miniaturas con scroll horizontal */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
              {watch("imgUrl")?.map((item: any, index: any) => {
                return (
                  <div
                    key={index}
                    className="relative shrink-0 group"
                    onMouseEnter={() => setHoveredUrl(item.url)}
                    onMouseLeave={() => setHoveredUrl("")}
                  >
                    <img
                      src={item.url}
                      alt={item.url}
                      className="w-20 h-20 object-cover rounded-xl border border-white/10 shadow-lg transition-filter duration-300 group-hover:brightness-75"
                      onLoad={() => URL.revokeObjectURL(item.url)}
                    />
                    {/* BOTÓN DE ELIMINAR */}
                    <button
                      type="button"
                      onClick={() => { removeURL(index); setHoveredUrl(''); }}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10 flex items-center justify-center"
                      title="Delete"
                    >
                      <svg
                        className="h-7 w-7 txterror"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="txtsecondary text-sm italic max-w-100"
              style={{
                wordBreak: 'break-all',
                overflowWrap: 'break-word'
              }}>
              {hoveredUrl || `${watch("imgUrl").length} pictures`}
            </div>
          </div>
        </div>
      </section>

    return tsxml_file
  });