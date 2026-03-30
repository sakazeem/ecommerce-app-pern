"use client";

import BaseLink from "@/app/components/BaseComponents/BaseLink";
import CheckboxInput from "@/app/components/Shared/form/CheckboxInput";
import InputArea from "@/app/components/Shared/form/InputArea";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function LoginForm({ onSuccess, switchToSignup }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (values) => {
    const user = await login(values.email, values.password);
    if (user) {
      onSuccess();
      toast.success("Logged Inn Successfully");
      // if (
      // 	document.referrer &&
      // 	!document.referrer.includes("/login") &&
      // 	!document.referrer.includes("/signup")
      // ) {
      // 	router.back();
      // } else {
      // 	router.push("/");
      // }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div>
        <h1 className="h2 font-semibold">Sign In</h1>
        <p className="text-muted font-medium mt-3">
          Don't have an account yet?{" "}
          <button
            type="button"
            onClick={switchToSignup}
            className="text-secondary font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>

      <InputArea
        name="email"
        label="Email:"
        type="email"
        register={register}
        placeholder="Enter your email"
        errorName={errors.email}
      />

      <InputArea
        name="password"
        label="Password:"
        type="password"
        register={register}
        placeholder="Enter your password"
        errorName={errors.password}
      />
      <div className="flex justify-end">
        <BaseLink
          href="/forgot-password"
          className="text-secondary text-sm font-medium"
        >
          Forgot password?
        </BaseLink>
      </div>
      <CheckboxInput
        name="remember"
        label="Remember Me"
        register={register}
        errorName={errors.remember}
        required={false}
      />

      <PrimaryButton className="w-full">Sign In</PrimaryButton>
    </form>
  );
}
