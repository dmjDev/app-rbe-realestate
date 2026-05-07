"use client";

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface AuthRescuePass1Props<T extends FieldValues> {
  email: string;
  isLoading: boolean;
  errors: FieldErrors<T>;
  
  setEmail: (email: string) => void;
  
  register: UseFormRegister<T>;
  clearApp: () => void;
  handleRescuePass: (e: React.SubmitEvent) => void;
}

export default function AuthRescuePass1<T extends FieldValues>({
  email,
  isLoading,
  errors,
  
  setEmail,
  
  register,
  clearApp,
  handleRescuePass,
}: AuthRescuePass1Props<T>) {

  const tsxml_rescuePass1 =
    /* --- VISTA: RECUPERAR CONTRASEÑA PASO 1 --- rescuePassSchema1#############################################*/
    <form onSubmit={handleRescuePass} noValidate>
      <div className="items-center justify-center text-sm flex flex-col gap-3">
        <h2 className="text-xl font-bold">Forgot Password</h2>

        <div className="field-group w-full">
          <label
            htmlFor="email"
            className="field-label"
          >
            Email address some@domain.ext
            {errors.email && (<p className='input-error'>{typeof errors.email.message === 'string' ? errors.email.message : 'Unexpected error format'}</p>)}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            className="field-input"
            placeholder="Email to rescue your password"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            {...register("email" as any, { onChange: (e) => setEmail(e.target.value) })}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="basebutton appbutton">
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
              Sending email...
            </div>
          ) : <p>Send Code</p>}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            clearApp();
          }}
          className="basebutton appblackbutton mb-6">
          Back to Sign In
        </button>
      </div>
    </form>

  return tsxml_rescuePass1;
}
