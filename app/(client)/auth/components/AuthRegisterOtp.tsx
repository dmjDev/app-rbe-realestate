"use client";

import { FieldValues } from "react-hook-form";

interface AuthRegisterOptProps<T extends FieldValues> {
  // Estados
  otpCode: string;
  email: string;
  isLoading: boolean;
  
  setOtpCode: (code: string) => void;
  
  clearApp: () => void;
  handleVerifyCode: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AuthRegisterOpt<T extends FieldValues>({
  otpCode,
  email,
  isLoading,
  
  setOtpCode,
  
  clearApp,
  handleVerifyCode,
}: AuthRegisterOptProps<T>) {

  const tsxml_register_otp =
    <form onSubmit={handleVerifyCode} noValidate>
      <div className="items-center justify-center text-sm flex flex-col gap-3">
        <div className="w-full">
          <label
            htmlFor="otp"
            className="field-label"
          >
            Please enter the verification code received via email <b className="txtsecondary">{email}</b>
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            value={otpCode}
            className="field-input"
            placeholder="Enter OTP code"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            onChange={(e) => setOtpCode(e.target.value)}
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
              Verifying email...
            </div>
          ) : <p>Verify email</p>}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => { clearApp(); }}
          className="basebutton appblackbutton mb-6">
          Back to Sign Up
        </button>
      </div>
    </form>

  return tsxml_register_otp;
}
