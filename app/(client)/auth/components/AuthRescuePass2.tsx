"use client";

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface AuthRescuePass2Props<T extends FieldValues> {
  otpCode: string;
  isSignIn: boolean;
  email: string;
  isLoading: boolean;
  mostrarPassword: boolean;
  password: string;
  errors: FieldErrors<T>;
  
  setOtpCode: (code: string) => void;
  setEmail: (email: string) => void;
  setPassword: (pass: string) => void;
  
  register: UseFormRegister<T>; // O UseFormRegister<YourFormData> si usas react-hook-form
  togglePassword: (e: React.MouseEvent | React.KeyboardEvent, form: string) => void;
  clearApp: () => void;
  handleResetPassword: (e: React.SubmitEvent) => void;
}

export default function AuthRescuePass2<T extends FieldValues>({
  otpCode,
  isSignIn,
  email,
  isLoading,
  mostrarPassword,
  password,
  errors,
  
  setOtpCode,
  setEmail,
  setPassword,
  
  register,
  togglePassword,
  clearApp,
  handleResetPassword,
}: AuthRescuePass2Props<T>) {

  const tsxml_rescuePass2 =
    /* --- VISTA: RECUPERAR CONTRASEÑA PASO 1 --- rescuePassSchema1#############################################*/
    <form onSubmit={handleResetPassword} noValidate>
      <div className="items-center justify-center text-sm flex flex-col gap-3">
        <h2 className="text-xl font-bold">Reset Password</h2>

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
            disabled={true}   // DISABLED
            value={email}
            className="field-input"
            placeholder="Email to rescue your password"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            {...register("email" as any, { onChange: (e) => setEmail(e.target.value) })}
          />
        </div>
        <div className="w-full">
          <label
            htmlFor="otp"
            className="field-label"
          >
            Please enter the verification code received via email
          </label>
          <input
            id="otp"
            type="text"
            value={otpCode}
            className="field-input"
            placeholder="Enter OTP code"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            name="otp"
            onChange={(e) => setOtpCode(e.target.value)}
          />
        </div>
        <div className="field-group w-full">
          <label
            htmlFor="password"
            className="field-label"
          >
            New password
            {errors.password && (<p className='input-error'>{typeof errors.password.message === 'string' ? errors.password.message : 'Unexpected error format'}</p>)}
          </label>
          <div className="flex">
            <input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              value={password}
              className="field-input"
              placeholder="Enter new password"
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              {...register("password" as any, { onChange: (e) => setPassword(e.target.value) })}
            />
            <button
              onClick={(e) => togglePassword(e, "rescue2")}
              className="eyeButton">{mostrarPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
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
              Updating password...
            </div>
          ) : <p>Update Password</p>}
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

  return tsxml_rescuePass2;
}
