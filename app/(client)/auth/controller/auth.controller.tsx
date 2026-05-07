"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInSocial, signUp, verifyOTP, checkEmailExists } from "@/lib/auth/auth-actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { authClient } from "@/lib/auth/auth-client";
import { useForm } from "react-hook-form";

import { loginSchema, registerSchema, rescuePassSchema1, rescuePassSchema2 } from "../schemas/authSchemas"
import { zodResolver } from "@hookform/resolvers/zod";

export function useAuthController() {
  const [pendingVerification, setPendingVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Login
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
    setFocus: setFocusLogin,
    formState: { errors: errorsLogin },
  } = useForm({ resolver: zodResolver(loginSchema), mode: "onChange" });

  // Registro
  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegister,
    resetField: resetFieldRegister,
    setFocus: setFocusRegister,
    formState: { errors: errorsRegister },
  } = useForm({ resolver: zodResolver(registerSchema), mode: "onChange" });

  // Rescue Pass 1 (Email)
  const {
    register: regRescue1,
    handleSubmit: handleRescue1Submit,
    reset: resetRescue1,
    setFocus: setFocusRescue1,
    formState: { errors: errorsRescue1 },
  } = useForm({ resolver: zodResolver(rescuePassSchema1), mode: "onChange" });

  // Rescue Pass 2 (Nueva Pass + OTP)
  const {
    register: regRescue2,
    handleSubmit: handleRescue2Submit,
    reset: resetRescue2,
    setFocus: setFocusRescue2,
    formState: { errors: errorsRescue2 },
  } = useForm({ resolver: zodResolver(rescuePassSchema2), mode: "onChange" });

  // DURACION MENSAJE ERROR. Verificar el tiempo que se le da al OTP en el hook Before y el plugin emailOTP de AUTH.TS
  const signInLockDuration: number = 60000; // milisegundos
  const otpLockDuration: number = 300000; // milisegundos

  useEffect(() => {
    if (!sessionStorage.getItem('loginForm_started')) {
      setError("Error message checked !");
      setSuccess(`Success message checked !`);
      setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      sessionStorage.setItem('loginForm_started', 'true');
    }
  }, [])

  /* ###################################################################################################################*/

  /* --- CONTROLLER: SOCIAL AUTH --- */
  /* AuthSocial  --   */
  const handleSocialAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await signInSocial(provider);
      clearApp();
      setSuccess(`Login success !`);
    } catch (err) {
      !isRedirectError(err) && setError(`Error authenticating with ${provider}: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  /* --- CONTROLLER: LOGIN --- */
  /* AuthLogin  --  loginSchema */
  const handleEmailAuthLogin = handleLoginSubmit(async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signIn(email, password);

      if (result && result.user) {
        if (!result.user.emailVerified) {
          try {
            const otpRes = await authClient.emailOtp.sendVerificationOtp({
              email: email,
              type: "email-verification",
            });

            if (otpRes.error) {
              throw otpRes.error;
            }

            setPendingVerification(true);
            const callbackURL = searchParams.get("callbackURL") || "/auth";
            setIsSignIn(true);

            router.refresh();
            setTimeout(() => {
              router.push(callbackURL);
            }, 100);

          } catch (otpError: any) {
            if (otpError.status === 429 || otpError.code === "TOO_MANY_REQUESTS") {
              throw new Error("RATE_LIMIT_EXCEEDED");
            }
            throw new Error(otpError.message || "Error al enviar el código");
          }
          return;
        }

        clearApp();
        setSuccess(`Login success !`);

        const callbackURL = searchParams.get("callbackURL") || "/";
        router.refresh();
        setTimeout(() => {
          router.push(callbackURL);
        }, 100);
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        setError(`⚠️ 1.Too many attempts. For security, please wait ${signInLockDuration * (1 / 60000)} ${signInLockDuration * (1 / 60000) == 1 ? 'minute' : 'minutes'}.`);
        setTimeout(() => {
          setError('');
        }, signInLockDuration);
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  });

  /* --- CONTROLLER: REGISTER --- */
  /* AuthRegister  --  registerSchema */
  const handleEmailAuthRegister = handleRegisterSubmit(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signUp(email, password, name);
      if (result && result.user) {
        setPendingVerification(true);
      } else {
        setError("Could not initialize verification");
      }
    } catch (err: any) {
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        setError(`⚠️ 1.Too many attempts. For security, please wait ${signInLockDuration * (1 / 60000)} ${signInLockDuration * (1 / 60000) == 1 ? 'minute' : 'minutes'}.`);
        setTimeout(() => {
          setError('');
        }, signInLockDuration);
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      // setIsLoading(false);
    }
  });

  /* --- CONTROLLER: VERIFICAR EMAIL EN REGISTER --- */
  /* AuthRegisterOtp  --  registerOTPSchema */
  const handleVerifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await verifyOTP(email, otpCode);

      if (response?.error) {
        if (response.status === 429 || response.status === "TOO_MANY_REQUESTS") {
          const minutes = otpLockDuration / 60000;
          setError(`⚠️ Too many attempts. Please wait ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`);
          setTimeout(() => setError(''), otpLockDuration);
        } else if (response.status === 403 || response.code === "TOO_MANY_ATTEMPTS") {
          setError("Code invalidated for security reasons. Request a new one.");
        } else {
          setError("Incorrect or expired code.");
        }
        return;
      }

      setSuccess(`Account created! Thanks for joining us`);
      setPendingVerification(false);
      setIsSignIn(true);
      router.refresh();

      const callbackURL = searchParams.get("callbackURL") || "/auth";
      setTimeout(() => {
        router.push(callbackURL);
      }, 100);

    } catch (err) {
      console.error("Verification error:", err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* --- CONTROLLER: RESCUE PASSWORD 1 - USER/EMAIL EXISTS --- */
  /* AuthRescuePass1  --  rescuePassSchema1 */
  const handleRescuePass = handleRescue1Submit(async () => {
    setIsLoading(true);
    setError("");

    if (!email) {
      setIsLoading(false);
      return;
    }

    try {
      const exists = await checkEmailExists(email);
      if (!exists) {
        setError(`User ${email} doesn't exists !`);
        setIsLoading(false);
        return;
      }

      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        const isRateLimit =
          error.status === 429 ||
          error.code === "TOO_MANY_REQUESTS" ||
          (typeof error.message === 'string' && error.message.includes("TOO_MANY_REQUESTS"));

        if (isRateLimit) {
          const minutes = otpLockDuration / 60000;
          setError(`⚠️ Too many attempts. Please wait ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`);
          setTimeout(() => setError(''), otpLockDuration);
        } else {
          setError(`Error: ${error.status} - ${error.message || 'Unknown error'}`);
        }
        return;
      }

      setStep(2);
      resetRescue1();
      setPassword('');
      setTimeout(() => setFocusRescue1("otp" as any), 100);

    } catch (error) {
      setError(`ERROR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  });

  /* --- CONTROLLER: RESCUE PASSWORD 2 - UPDATE DATA (resetPassword) --- */
  /* AuthRescuePass2  --  rescuePassSchema2 */
  const handleResetPassword = handleRescue2Submit(async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: email,
        otp: otpCode,
        password: password
      });

      if (error) {
        const isRateLimit =
          error.status === 429 ||
          error.code === "TOO_MANY_REQUESTS" ||
          (typeof error.message === 'string' && error.message.includes("TOO_MANY_REQUESTS"));

        if (isRateLimit) {
          const minutes = otpLockDuration / 60000;
          setError(`⚠️ Too many attempts. Please wait ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`);
          setTimeout(() => setError(''), otpLockDuration);
        } else {
          setError(`Error: ${error?.message || "Error attempting to reset password"}`);
        }
        return;
      }

      clearApp();
      setSuccess(`Your password has been changed successfully`);

    } catch (err) {
      console.error("Reset password unexpected error:", err);
      setError("A technical error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  });

  /* ###################################################################################################################*/

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      // callbackURL: "/",
      // PROXI.TS
      // REMEMBERME QUEDA FALSE PARA QUE NO PERSISTA LA COOKIE EN EL NAVEGADOR Y PERMITA UN LOGIN NUEVO EN CADA INICIO DE NAVEGADOR(PROXI.TS)
      rememberMe: false,
    });

    if (error) {
      const isRateLimit =
        error.status === 429 ||
        error.code === "TOO_MANY_REQUESTS" ||
        (typeof error.message === 'string' && error.message.includes("TOO_MANY_REQUESTS"));

      if (isRateLimit) throw new Error("RATE_LIMIT_EXCEEDED");
      if (error.status === 403) return { user: { emailVerified: false } };
      throw new Error(error.message || "Invalid email or password");
    }

    // PROXI.TS
    // Creamos la cookie de control manualmente para que el Proxy 
    // la vea en la siguiente petición y no nos eche.
    document.cookie = "browser_session=active; path=/; SameSite=Lax";
    // redirigimos a la home limpia
    window.location.href = "/";

    return data;
  };

  const togglePassword = (e: any, form: string) => {
    e.preventDefault();
    setMostrarPassword(!mostrarPassword);
    // console.log(form)
    if (form == 'login') setFocusLogin('password');
    if (form == 'register') setFocusRegister('password');
    if (form == 'rescue2') setFocusRescue2('password');
  };

  const handleToggleSignIn = () => {
    setIsSignIn(!isSignIn);
    setError("");
    setName("");
    resetFieldRegister("name");
  };

  const handleForgotPassword = () => {
    clearApp();
    setIsForgotPassword(true);
  };

  const clearApp = () => {
    resetLogin();
    resetRegister();
    resetRescue1();
    resetRescue2();

    setError("");
    setSuccess("");
    setIsForgotPassword(false);
    setPendingVerification(false);
    setIsSignIn(true);
    setIsLoading(false);
    setStep(1);
    setName("");
    setOtpCode("");
    setPassword("");
    setEmail("");
    setMostrarPassword(false);
  };
  const clearForm = () => {
    resetLogin();
    resetRegister();
    resetRescue1();
    resetRescue2();

    setError("");
    setSuccess("");
    setIsLoading(false);
    setName("");
    setOtpCode("");
    setPassword("");
    setEmail("");
    setMostrarPassword(false);
  };

  return {
    // Estados
    pendingVerification,
    otpCode,
    isSignIn,
    email,
    password,
    name,
    isLoading,
    error,
    success,
    mostrarPassword,
    isForgotPassword,
    step,

    errorsLogin,
    errorsRegister,
    errorsRescue1,
    errorsRescue2,

    // Setters necesarios para la vista
    setOtpCode,
    setEmail,
    setPassword,
    setName,

    // Funciones
    regLogin,
    regRegister,
    regRescue1,
    regRescue2,

    togglePassword,
    clearApp,
    clearForm,
    handleSocialAuth,
    handleRescuePass,
    handleEmailAuthRegister,
    handleEmailAuthLogin,
    handleVerifyCode,
    handleToggleSignIn,
    handleForgotPassword,
    handleResetPassword,
  };
}