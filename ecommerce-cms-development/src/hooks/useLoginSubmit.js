import Cookies from "js-cookie";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useLocation } from "react-router-dom";

//internal import
import { AdminContext } from "@/context/AdminContext";
import AdminServices from "@/services/AdminServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const useLoginSubmit = () => {
  const [loading, setLoading] = useState(false);
  // OTP step state: null = not started, "pending" = OTP sent, waiting verify
  const [otpStep, setOtpStep] = useState(null);
  const [savedCredentials, setSavedCredentials] = useState(null);

  const { dispatch } = useContext(AdminContext);
  const history = useHistory();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async ({
    name,
    email,
    verifyEmail,
    password,
    otp,
    role,
  }) => {
    setLoading(true);
    const cookieTimeOut = 0.5;

    try {
      if (location.pathname === "/login") {
        if (otpStep === null) {
          // Step 1: Validate credentials and send OTP
          await AdminServices.sendLoginOtp({ email, password });
          setSavedCredentials({ email, password });
          setOtpStep("pending");
          notifySuccess("OTP sent to your email. Please verify.");
          reset({ email, password }); // keep fields for UX but show OTP input
        } else {
          // Step 2: Submit credentials + OTP
          const res = await AdminServices.loginAdmin({
            email: savedCredentials.email,
            password: savedCredentials.password,
            otp,
          });

          if (res) {
            notifySuccess("Login Success!");
            dispatch({ type: "USER_LOGIN", payload: res.user });
            Cookies.set("tokens", JSON.stringify(res.tokens), {
              expires: cookieTimeOut,
              sameSite: "None",
              secure: true,
            });
            Cookies.set("adminInfo", JSON.stringify(res.user), {
              expires: cookieTimeOut,
              sameSite: "None",
              secure: true,
            });
            history.replace("/dashboard");
          }
        }
      }

      if (location.pathname === "/signup") {
        const res = await AdminServices.registerAdmin({
          name,
          email,
          password,
          role,
        });

        if (res) {
          notifySuccess("Register Success!");
          dispatch({ type: "USER_LOGIN", payload: res });
          Cookies.set("adminInfo", JSON.stringify(res), {
            expires: cookieTimeOut,
            sameSite: "None",
            secure: true,
          });
          history.replace("/");
        }
      }

      if (location.pathname === "/forgot-password") {
        const res = await AdminServices.forgetPassword({ verifyEmail });
        notifySuccess(res.message);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      if (location.pathname === "/login") {
        setOtpStep(null);
        setSavedCredentials(null);
        reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!savedCredentials) return;
    setLoading(true);
    try {
      await AdminServices.sendLoginOtp(savedCredentials);
      notifySuccess("OTP resent to your email.");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOtp = () => {
    setOtpStep(null);
    setSavedCredentials(null);
    reset();
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
    otpStep,
    resendOtp,
    cancelOtp,
  };
};

export default useLoginSubmit;
