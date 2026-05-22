import React from "react";
import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

//internal import
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputAreaLogin from "@/components/form/input/InputAreaLogin";
import ImageLight from "@/assets/img/login-office.jpeg";
import ImageDark from "@/assets/img/login-office-dark.jpeg";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import CMButton from "@/components/form/button/CMButton";

const Login = () => {
  const { t } = useTranslation();
  const {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
    otpStep,
    resendOtp,
    cancelOtp,
  } = useLoginSubmit();

  return (
    <>
      <div className="flex items-center min-h-screen p-6 bg-customGray-50 dark:bg-customGray-900">
        <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-customWhite rounded-lg shadow-xl dark:bg-customGray-800">
          <div className="flex flex-col overflow-y-auto md:flex-row">
            <div className="h-32 md:h-auto md:w-1/2">
              <img
                aria-hidden="true"
                className="object-cover w-full h-full dark:hidden"
                src={ImageLight}
                alt="Office"
              />
              <img
                aria-hidden="true"
                className="hidden object-cover w-full h-full dark:block"
                src={ImageDark}
                alt="Office"
              />
            </div>
            <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
              <div className="w-full">
                <h1 className="mb-2 text-2xl font-semibold text-customGray-700 dark:text-customGray-200">
                  {otpStep === "pending" ? "Verify OTP" : "Login"}
                </h1>

                {otpStep === "pending" && (
                  <p className="mb-6 text-sm text-customGray-500 dark:text-customGray-400">
                    A 6-digit OTP has been sent to your email.
                  </p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Step 1: Email + Password */}
                  {otpStep === null && (
                    <>
                      <LabelArea label="Email" />
                      <InputAreaLogin
                        required={true}
                        register={register}
                        label="Email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        placeholder="john@doe.com"
                      />
                      <Error errorName={errors.email} />

                      <div className="mt-6" />

                      <LabelArea label="Password" />
                      <InputAreaLogin
                        required={true}
                        register={register}
                        label="Password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="***************"
                      />
                      <Error errorName={errors.password} />
                    </>
                  )}

                  {/* Step 2: OTP input */}
                  {otpStep === "pending" && (
                    <>
                      <LabelArea label="Enter OTP" />
                      <InputAreaLogin
                        required={true}
                        register={register}
                        label="OTP"
                        name="otp"
                        type="text"
                        autoComplete="one-time-code"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                      <Error errorName={errors.otp} />
                    </>
                  )}

                  {loading ? (
                    <CMButton
                      disabled={loading}
                      type="submit"
                      className="bg-customTeal-600 rounded-md mt-4 h-12 w-full"
                    />
                  ) : (
                    <Button
                      disabled={loading}
                      type="submit"
                      className="mt-4 h-12 w-full"
                    >
                      {otpStep === "pending"
                        ? "Verify & Login"
                        : t("LoginTitle")}
                    </Button>
                  )}
                </form>

                {/* OTP step helpers */}
                {otpStep === "pending" && (
                  <div className="mt-4 flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading}
                      className="text-customTeal-500 hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={cancelOtp}
                      className="text-customGray-500 hover:underline"
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
