"use client";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import CheckboxInput from "@/app/components/Shared/form/CheckboxInput";
import InputArea from "@/app/components/Shared/form/InputArea";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import AuthLayout from "@/app/components/Themes/KidsTheme/AuthLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

const LoginPage = () => {
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
			// ✅ Go back if user had a previous page, else go home
			if (
				document.referrer &&
				!document.referrer.includes("/login") &&
				!document.referrer.includes("/signup")
			) {
				router.back();
			} else {
				router.push("/");
			}
		}
	};
	return (
		<AuthLayout>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6 md:w-[75%]"
				noValidate>
				<div>
					<h1 className="h2 font-semibold">Sign In</h1>
					<p className="text-muted font-medium mt-3">
						Don't have an account yet?{" "}
						<BaseLink href="/signup" className="text-secondary">
							Sign Up
						</BaseLink>
					</p>
				</div>

				<InputArea
					name={"email"}
					label={"Email:"}
					type={"email"}
					register={register}
					placeholder={"Enter your email"}
					errorName={errors.email}
				/>
				<InputArea
					name={"password"}
					label={"Password:"}
					type={"password"}
					register={register}
					placeholder={"Enter your password"}
					errorName={errors.password}
				/>
				<div className="flex justify-end">
					<BaseLink
						href="/forgot-password"
						className="text-secondary text-sm font-medium">
						Forgot password?
					</BaseLink>
				</div>
				<CheckboxInput
					name="remember"
					label="Remember Me"
					required={false}
					register={register}
					errorName={errors.remember}
				/>
				<PrimaryButton className="w-full">Sign In</PrimaryButton>
			</form>
		</AuthLayout>
	);
};

export default LoginPage;
