"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";

interface AuthRegisterProps<T extends FieldValues> {
  // Estados
  email: string;
  isLoading: boolean;
  mostrarPassword: boolean;
  password: string;
  name: string;
  errors: FieldErrors<T>;

  // Setters
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  setName: (val: string) => void;

  // Funciones
  register: UseFormRegister<T>;
  togglePassword: (e: React.MouseEvent | React.KeyboardEvent, form: string) => void;
  handleEmailAuthRegister: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AuthRegister<T extends FieldValues>({
  email,
  isLoading,
  mostrarPassword,
  password,
  name,
  errors,
  setEmail,
  setPassword,
  setName,
  register,
  togglePassword,
  handleEmailAuthRegister,
}: AuthRegisterProps<T>) {

  const tsxml_register =
    <form onSubmit={handleEmailAuthRegister} noValidate>
      <div className="items-center justify-center text-sm flex flex-col gap-3">
        <div className="field-group w-full">
          <label
            htmlFor="name"
            className="field-label"
          >
            Full Name
            {errors.name && (<p className='input-error'>{typeof errors.name.message === 'string' ? errors.name.message : ''}</p>)}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            className="field-input"
            placeholder="Enter your full name"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            {...register("name" as any, { onChange: (e) => setName(e.target.value) })}
          />
        </div>

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
            placeholder="Enter your email"
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            {...register("email" as any, { onChange: (e) => setEmail(e.target.value) })}
          />
        </div>

        <div className="field-group w-full">
          <label
            htmlFor="password"
            className="field-label"
          >
            Password
            {errors.password && (<p className='input-error'>{typeof errors.password.message === 'string' ? errors.password.message : 'Unexpected error format'}</p>)}
          </label>
          <div className="flex">
            <input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              className="field-input"
              placeholder="Enter your password"
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              {...register("password" as any, { onChange: (e) => setPassword(e.target.value) })}
            />
            <button
              onClick={(e) => togglePassword(e, "register")}
              className="eyeButton">{mostrarPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="basebutton appbutton border-2"
        >
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
              Creating account...
            </div>
          ) : <p>Create Account</p>}
        </button>
      </div>
    </form>


  return tsxml_register;
}
