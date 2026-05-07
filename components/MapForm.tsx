import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormStateProps, UseFormStateReturn, UseFormWatch } from 'react-hook-form';
import { useMap_Controller } from '@/hooks/useMap_Controller'
import { PROVINCES } from "@/lib/locations";
import InteractiveMap from './InteractiveMap';
import { MyFormValues } from '@/app/(client)/cms-manager/schemas/formInterface';
import { MapPinned } from 'lucide-react';

interface Props {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<MyFormValues>;
  isInitialLoaded: boolean;
  coordenadas: boolean;
}

const MapForm = ({ register, watch, setValue, errors, isInitialLoaded, coordenadas }: Props) => {
  const {
    selectedProvince,
    municipalities,
    watchLat,
    watchLng
  } = useMap_Controller({ watch, setValue, isInitialLoaded });

  return (
    <>
      <div className="section-header">
        <span className="section-icon"><MapPinned /></span>
        <h3 className="section-title">Location</h3>
      </div>
      <div className="section-content grid-cols-2">
        <div className="field-group">
          <label className="field-label">
            Province
            {errors.province && (<p className='input-error'>{typeof errors.province.message === 'string' ? errors.province.message : 'Unexpected error format'}</p>)}
          </label>
          <select
            {...register("province" as any, { onChange: (e) => setValue("municipality", "") })}
            className="field-select"
            key="prov-sel"
            // onFocus={(e) => e.target.size = 8}
            // onBlur={(e) => e.target.size = 1}
          >
            <option value="" key="notSelected">Select Province...</option>
            {PROVINCES.map(p => (
              <option key={`prov-${p}`} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label">
            Municipality
            {errors.municipality && (<p className='input-error'>{typeof errors.municipality.message === 'string' ? errors.municipality.message : 'Unexpected error format'}</p>)}
          </label>
          <select
            {...register("municipality")}
            className="field-select"
            disabled={!selectedProvince}
            key="muni-sel"
          >
            <option value="" key="notSelected">Select Municipality...</option>
            {municipalities.map(m => (
              <option key={`muni-${m}`} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          {coordenadas && (<label className="field-label">
            Latitude <span className='auxData'>(Max. 90, Min. -90)</span>
            {errors.latitude && (<p className='input-error'>{typeof errors.latitude.message === 'string' ? errors.latitude.message : 'Unexpected error format'}</p>)}
          </label>)}
          <input
            type={coordenadas ? "number" : "hidden"}
            step="0.000001"
            min="-90" max="90"
            className="field-input"
            placeholder="Insert latitude"
            {...register("latitude", {
              onChange: (e) => {
                const val = parseFloat(e.target.value);
                if (val > 90) setValue("latitude", 90);
                if (val < -90) setValue("latitude", -90);
              }
            })}
          />
        </div>
        <div className="field-group">
          {coordenadas && <label className="field-label">
            Longitude <span className='auxData'>(Max. 180, Min. -180)</span>
            {errors.longitude && (<p className='input-error'>{typeof errors.longitude.message === 'string' ? errors.longitude.message : 'Unexpected error format'}</p>)}
          </label>}
          <input
            type={coordenadas ? "number" : "hidden"}
            step="0.000001"
            min="-180" max="180"
            className="field-input"
            placeholder="Insert longitude"
            {...register("longitude", {
              onChange: (e) => {
                const val = parseFloat(e.target.value);
                if (val > 180) setValue("longitude", 180);
                if (val < -180) setValue("longitude", -180);
              }
            })}
          />
        </div>
        {coordenadas && <div></div>}
      </div>

      <div className="section-content">
        <InteractiveMap
          lat={Number(watchLat) || 40.4167} // Madrid por defecto
          lng={Number(watchLng) || -3.7037}
          onChange={setValue}
        />
      </div>
    </>
  )
}

export default MapForm
