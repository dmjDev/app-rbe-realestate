"use client"

import { useGlobalController } from "../controller/useGlobalController";
import { useFormContext } from "react-hook-form";
import { MyFormValues } from "../schemas/formInterface";

import MapForm from '@/components/MapForm';
import { useState } from "react";
import { BookOpenText, House, MapPinHouse, Scaling, TableProperties, Tags, Zap } from "lucide-react";

export const GlobalComponent = ({ homePromo, setSuccess, FEATURE_LIST }: any) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<MyFormValues>();
  const { operationOptions, propertyOptions, energyOptions, orientationOptions, flooringOptions, frequencyOptions } = useGlobalController();
  const [isInitialLoaded, setIsInitialLoaded] = useState(true);

  const MAX_CHARS_itemName = 120;
  const value_itemName = watch("itemName", "");
  const remainChars_itemName = MAX_CHARS_itemName - value_itemName.length;
  const counterColor_itemName = remainChars_itemName <= 0 ? 'red' : remainChars_itemName <= 10 ? '#facc15' : 'inherit';

  const MAX_CHARS_itemDescription = 5000;
  const value_itemDescription = watch("itemDescription", "");
  const remainChars_itemDescription = MAX_CHARS_itemDescription - value_itemDescription.length;
  const counterColor_itemDescription = remainChars_itemDescription <= 0 ? 'red' : remainChars_itemDescription <= 10 ? '#facc15' : 'inherit';

  const tsxml_global =
    <>
      {/* INFORMACIÓN PRINCIPAL */}
      <section className="form-section form-section-full">
        <div className="section-header">
          <span className="section-icon"><House /></span>
          <h3 className="section-title">Project Property</h3>
          <label className="checkbox-item">
            <input
              type="checkbox"
              disabled={homePromo} 
              className="checkbox-input"
              {...register("active")}
            />
            <span className="checkbox-label">Public property</span>
          </label>
        </div>
        <div className="section-content grid-cols-2">
          <div className="field-group col-span-2">
            <label className="field-label">
              <span style={{ color: counterColor_itemName, opacity: 0.5, fontWeight: 'bold' }}>
                ({remainChars_itemName})
              </span> Brief description, headline
              {errors.itemName && (<p className='input-error'>{typeof errors.itemName.message === 'string' ? errors.itemName.message : 'Unexpected error format'}</p>)}
            </label>
            <input
              type="text"
              maxLength={MAX_CHARS_itemName}
              className="field-input field-input-lg"
              placeholder="Penthouse with terrace in City Center"
              onFocus={() => { setSuccess("") }}
              {...register("itemName")}
            />
          </div>
        </div>
      </section>

      {/* CLASIFICACIÓN */}
      <section className="form-section">
        <div className="section-header">
          <span className="section-icon"><Tags /></span>
          <h3 className="section-title">Pricing & Classification</h3>
        </div>
        <div className="section-content">
          <div className="field-group">
            <label className="field-label">
              Listing Type
              {errors.operType && (<p className='input-error'>{typeof errors.operType.message === 'string' ? errors.operType.message : 'Unexpected error format'}</p>)}
            </label>
            <select
              className="field-select"
              {...register("operType")}
            >
              <option value="">Select an option...</option>
              {operationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">
              Property Type
              {errors.propType && (<p className='input-error'>{typeof errors.propType.message === 'string' ? errors.propType.message : 'Unexpected error format'}</p>)}
            </label>
            <select
              className="field-select"
              {...register("propType")}
            >
              <option value="">Select an option...</option>
              {propertyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="field-group col-span-2">
            <label className="field-label">
              Price (€)
              {errors.price && (<p className='input-error'>{typeof errors.price.message === 'string' ? errors.price.message : 'Unexpected error format'}</p>)}
            </label>
            <input
              type="number"
              step="1" min="0"
              className="field-input field-input-lg"
              placeholder="0"
              {...register("price")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Payment frequency</label>
            <select
              className="field-select"
              {...register("frequencyPay")}
            >
              <option value="">Select an option...</option>
              {frequencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Lowest seller's offer (€)</label>
            <input
              type="number"
              step="1"
              className="field-input"
              placeholder="0"
              {...register("priceMin")}
            />
          </div>
        </div>
      </section>

      {/* SUPERFICIE Y ESTANCIAS */}
      <section className="form-section">
        <div className="section-header">
          <span className="section-icon"><Scaling /></span>
          <h3 className="section-title">Size, Rooms & Property data</h3>
        </div>
        <div className="section-content">
          <div className="field-group col-span-2">
            <label className="field-label">
              Property Reference
              {errors.itemRef && (<p className='input-error'>{typeof errors.itemRef.message === 'string' ? errors.itemRef.message : 'Unexpected error format'}</p>)}
            </label>
            <input
              type="text"
              className="field-input"
              placeholder="Ref. REFL-002/2026"
              {...register("itemRef")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">M² Built</label>
            <input
              type="number"
              step="0"
              className="field-input"
              placeholder="0"
              {...register("builtSize")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">M² Useful</label>
            <input
              type="number"
              step="0"
              className="field-input"
              placeholder="0"
              {...register("usefulSize")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">
              Number of rooms
              {errors.rooms && (<p className='input-error'>{typeof errors.rooms.message === 'string' ? errors.rooms.message : 'Unexpected error format'}</p>)}
            </label>
            <input
              type="number"
              step="1"
              className="field-input"
              placeholder="0"
              {...register("rooms")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">
              Number of baths
              {errors.bathrooms && (<p className='input-error'>{typeof errors.bathrooms.message === 'string' ? errors.bathrooms.message : 'Unexpected error format'}</p>)}
            </label>
            <input
              type="number"
              step="1"
              className="field-input"
              placeholder="0"
              {...register("bathrooms")}
            />
          </div>
          <div className="checkbox-row col-span-2">
            <div className="field-group">
              <label className="field-label">
                Year of construction
                {errors.builtYear && (<p className='input-error'>{typeof errors.builtYear.message === 'string' ? errors.builtYear.message : 'Unexpected error format'}</p>)}
              </label>
              <input
                type="number"
                step="1" min="0"
                className="field-input"
                placeholder="0"
                {...register("builtYear")}
              />
            </div>
            <label className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register("isNewDevelopment")}
              />
              <span className="checkbox-label">New Construction</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register("isOwner")}
              />
              <span className="checkbox-label">Owner-listed</span>
            </label>
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section className="form-section">
        <MapForm register={register} watch={watch} setValue={setValue} errors={errors} isInitialLoaded={isInitialLoaded} coordenadas={true} />
      </section>

      <section className="form-section">
        <div className="section-header">
          <span className="section-icon"><MapPinHouse /></span>
          <h3 className="section-title">Address</h3>
        </div>
        <div className="section-content grid-cols-2">
          <div className="field-group">
            <label className="field-label">Neighborhood</label>
            <input
              type="text"
              maxLength={120}
              className="field-input"
              placeholder="Ex: Barrio del Carmen"
              {...register("neighborhood")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Streetname</label>
            <input
              type="text"
              maxLength={120}
              className="field-input"
              placeholder="Enter the name of the street"
              {...register("streetName")}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Street number</label>
            <div className="field-row">
              <input
                type="text"
                maxLength={120}
                placeholder="Nº"
                className="field-input"
                {...register("streetNumber")}
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Floor</label>
            <div className="field-row">
              <input
                type="text"
                maxLength={120}
                placeholder="Nº or floor name"
                className="field-input"
                {...register("floor")}
              />
            </div>
          </div>
          <div className="checkbox-row col-span-2">
            <label className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register("isExterior")}
              />
              <span className="checkbox-label">Exterior</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register("showAddress")}
              />
              <span className="checkbox-label">Public direcction</span>
            </label>
          </div>
          <div className="field-group col-span-2">
            <label className="field-label">Orientation</label>
            <select
              className="field-select"
              {...register("orientation")}
            >
              <option value="">Select orientation...</option>
              {orientationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* EFICIENCIA Y GASTOS */}
      <section className="form-section form-section-full">
        <div className="section-header">
          <span className="section-icon"><Zap /></span>
          <h3 className="section-title">Energy efficiency and expenses</h3>
        </div>
        <div className="section-content">
          <div className="section-content grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="field-group">
              <label className="field-label">Energetic certificate</label>
              <select
                className="field-select"
                {...register("energyRating")}
              >
                <option value="">Select an option...</option>
                {energyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Emissions certificate</label>
              <select
                className="field-select"
                {...register("emissionsRating")}
              >
                <option value="">Select an option...</option>
                {energyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">HOA Fees (€/month)</label>
              <input
                type="number"
                step="0.01"
                className="field-input"
                placeholder="0.00"
                {...register("communityCosts")}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Real Estate Tax (€/annualy)</label>
              <input
                type="number"
                step="0.01"
                className="field-input"
                placeholder="0.00"
                {...register("annualTax")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPCIÓN */}
      <section className="form-section form-section-full">
        <div className="section-header">
          <span className="section-icon"><BookOpenText /></span>
          <h3 className="section-title">Property Description</h3>
        </div>
        <div className="field-group">
          <label className="field-label">
            <span style={{ color: counterColor_itemDescription, opacity: 0.5, fontWeight: 'bold' }}>
              ({remainChars_itemDescription})
            </span> Detailed description
            {errors.itemDescription && (<p className='input-error'>{typeof errors.itemDescription.message === 'string' ? errors.itemDescription.message : 'Unexpected error format'}</p>)}
          </label>
          <textarea
            maxLength={MAX_CHARS_itemDescription}
            className="field-textarea"
            placeholder="Describe the most outstanding features of your property..."
            rows={5}
            {...register("itemDescription")}
          />
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="form-section form-section-full">
        <div className="section-header">
          <span className="section-icon"><TableProperties /></span>
          <h3 className="section-title">Amenities & Features</h3>
        </div>
        <div className="features-grid">
          {FEATURE_LIST.map((featureName: string) => (
            <label key={featureName} className="checkbox-item">
              <input
                type="checkbox"
                className="checkbox-input"
                {...register(`features.${featureName}`)}
              />
              <span className="checkbox-label text-transform: capitalize">{featureName.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
        <hr className="pb-3 mt-6" />
        <div className="section-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="field-group">
            <label className="field-label">Flooring material</label>
            <select
              className="field-select"
              {...register("flooringMaterial")}
            >
              <option value="">Select flooring type...</option>
              {flooringOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </>

  return tsxml_global
};