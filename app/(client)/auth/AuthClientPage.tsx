"use client";

import { useAuthController } from "./controller/auth.controller";
import AuthSocial from "./components/AuthSocial";
import AuthRescuePass2 from "./components/AuthRescuePass2";
import AuthRescuePass1 from "./components/AuthRescuePass1";
import { useEffect } from "react";
import AuthRegister from "./components/AuthRegister";
import AuthLogin from "./components/AuthLogin";
import AuthRegisterOpt from "./components/AuthRegisterOtp";
import MsgError from "../../../components/MsgError";
import MsgSuccess from "../../../components/MsgSuccess";
import ClearFields from "@/components/ClearFields";

export default function AuthClientPage() {
  const {
    // Estados
    pendingVerification,
    otpCode,
    isSignIn,
    email,
    isLoading,
    error,
    success,
    mostrarPassword,
    isForgotPassword,
    step,
    password,
    name,

    errorsLogin,
    errorsRegister,
    errorsRescue1,
    errorsRescue2,

    // Setters
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
    handleRescuePass,
    handleEmailAuthRegister,
    handleEmailAuthLogin,
    handleVerifyCode,
    handleToggleSignIn,
    handleForgotPassword,
    handleResetPassword,
    handleSocialAuth,
  } = useAuthController();

  useEffect(() => {
    // console.log('step', step)
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [step])


  const tsxml_auth =
    <main>
      <div className="form-main mt-5 mx-6 md:mx-20 lg:mx-40">
        <div className="form-container-600 p-1.25">

          <div className="form-header">
            <h1 className="txtprimary text-3xl font-bold mb-0">
              {isSignIn ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="txtsecondaryfaded">
              {isSignIn
                ? "Sign in to your account to continue"
                : "Sign up to get started with better-auth"}
            </p>
          </div>

          <div>
            {/* ERROR MESSAGE */}
            {error && (<MsgError error={error} />)}
            {/* SUCCESS MESSAGE */}
            {success && (<MsgSuccess success={success} />)}
          </div>

          <section className="form-section">
            {/* Social Authentication ########################################################################### 
                CONTROLLER: handleSocialAuth --- */}
            <AuthSocial
              isLoading={isLoading}
              handleSocialAuth={handleSocialAuth}
            />
            {/* ################################################################################################# */}

            { /* OR */}
            <div className="flex items-center w-full my-8">
              <div className="grow border-t border-dashed separator-bordercolor"></div>
              <span className="shrink mx-4 separator-textcolor font-medium uppercase text-sm tracking-wider">
                Or continue with
              </span>
              <div className="grow border-t border-dashed separator-bordercolor"></div>
            </div>

            {/* ################################################################################################## */}

            <div>
              {isForgotPassword ? (
                <>
                  {/* FORM: RECUPERAR CONTRASEÑA PASO 1 --- ########################################################### 
                      CONTROLLER: handleRescuePass --- rescuePassSchema1*/}
                  {step === 1 &&
                    <AuthRescuePass1
                      email={email}
                      isLoading={isLoading}
                      errors={errorsRescue1}

                      setEmail={setEmail}

                      register={regRescue1 as any}
                      clearApp={clearApp}
                      handleRescuePass={handleRescuePass}
                    />
                  }

                  {/* FORM: RECUPERAR CONTRASEÑA PASO 2 ---  ###########################################################
                      CONTROLLER: handleResetPassword -- rescuePassSchema2*/}
                  {step === 2 &&
                    <AuthRescuePass2
                      // Estados
                      otpCode={otpCode}
                      isSignIn={isSignIn}
                      email={email}
                      isLoading={isLoading}
                      mostrarPassword={mostrarPassword}
                      password={password}
                      errors={errorsRescue2}

                      // Setters
                      setOtpCode={setOtpCode}
                      setEmail={setEmail}
                      setPassword={setPassword}

                      // Funciones
                      register={regRescue2 as any}
                      togglePassword={togglePassword}
                      clearApp={clearApp}
                      handleResetPassword={handleResetPassword}
                    />
                  }
                </>

              ) : !pendingVerification ? (
                <>
                  {/* FORM: Name/Email/Password Form REGISTER ######################################################## 
                      CONTROLLER: handleEmailAuthRegister --- registerSchema*/}
                  {!isSignIn && (
                    <>
                      <AuthRegister
                        email={email}
                        isLoading={isLoading}
                        mostrarPassword={mostrarPassword}
                        password={password}
                        name={name}
                        errors={errorsRegister}

                        setEmail={setEmail}
                        setPassword={setPassword}
                        setName={setName}

                        register={regRegister as any}
                        togglePassword={togglePassword}
                        handleEmailAuthRegister={handleEmailAuthRegister}
                      />
                      <ClearFields clearForm={clearForm} isLoading={isLoading} />
                    </>
                  )}

                  {/* FORM: Email/Password Form LOGIN ################################################################ 
                      CONTROLLER: handleEmailAuthLogin --- loginSchema*/}
                  {isSignIn && (
                    <>
                      <AuthLogin
                        email={email}
                        isLoading={isLoading}
                        mostrarPassword={mostrarPassword}
                        password={password}
                        errors={errorsLogin}

                        setEmail={setEmail}
                        setPassword={setPassword}

                        register={regLogin as any}
                        togglePassword={togglePassword}
                        handleEmailAuthLogin={handleEmailAuthLogin}
                      />
                      <ClearFields clearForm={clearForm} isLoading={isLoading} />
                    </>
                  )}
                </>
              ) : (
                /* FORM: VERIFICAR EMAIL EN REGISTRO --- ############################################################# 
                  CONTROLLER: handleVerifyCode ---  registerOTPVerify*/
                <AuthRegisterOpt
                  otpCode={otpCode}
                  email={email}
                  isLoading={isLoading}

                  setOtpCode={setOtpCode}

                  clearApp={clearApp}
                  handleVerifyCode={handleVerifyCode}
                />
              )}
            </div>

            {(!pendingVerification && !isForgotPassword) && (
              <div className="items-center">
                {/* ENLACE "FORGOT PASSWORD" - BOTONES TIPO TEXTO */}
                {isSignIn && (
                  <div className="text-center">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => { handleForgotPassword(); }}
                      className="textbutton">
                      Forgot password?
                    </button>
                  </div>
                )}
                <div className="text-center">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { handleToggleSignIn(); }}
                    className="textbutton"
                  >
                    {isSignIn
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>

              </div>
            )}
          </section>

        </div>
      </div>
    </main>

  return tsxml_auth;
}
