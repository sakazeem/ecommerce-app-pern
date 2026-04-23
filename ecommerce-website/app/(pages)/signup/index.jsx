"use client";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import CheckboxInput from "@/app/components/Shared/form/CheckboxInput";
import InputArea from "@/app/components/Shared/form/InputArea";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import AuthLayout from "@/app/components/Themes/KidsTheme/AuthLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const SignupPage = () => {
	const [isOtpVerification, setIsOtpVerification] = useState(true);
	const [saveValues, setSaveValues] = useState(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const { register: signUp, sendOtp } = useAuth();
	const router = useRouter();
	const onSubmit = async (values) => {
		if (isOtpVerification) {
			await sendOtp(values.email, values.name);
			setSaveValues(values);
			setIsOtpVerification(false);
			toast.success("Otp has been send to you email, please verify otp");
		} else {
			const user = await signUp(
				saveValues.email,
				saveValues.password,
				saveValues.name,
				values.otp,
			);
			// const user = await signUp(values.email, values.password, values.name);
			if (user) {
				toast.success("Registered Successfully");
				router.push("/");
			}
		}
	};
	return (
		<AuthLayout>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6 md:w-[75%]">
				<div>
					<h1 className="h2 font-semibold">
						{isOtpVerification ? "Sign Up" : "Verify Otp"}
					</h1>
					<p className="text-muted font-medium mt-3">
						Already have an account?{" "}
						<BaseLink href="/login" className="text-secondary">
							Sign In
						</BaseLink>
					</p>
				</div>

				{isOtpVerification ? (
					<>
						{" "}
						<InputArea
							name="name"
							label="Name:"
							register={register}
							placeholder="Enter your name"
							errorName={errors.name}
						/>
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
						<CheckboxInput
							name="terms"
							label="I agree with Privacy Policy and Terms of Use"
							register={register}
							errorName={errors.terms}
						/>
					</>
				) : (
					<InputArea
						name="otp"
						label="Otp:"
						register={register}
						placeholder="Please enter otp received on email"
						errorName={errors.name}
					/>
				)}
				<PrimaryButton className="w-full">
					{isOtpVerification ? "Sign Up" : "Verify"}
				</PrimaryButton>
			</form>
		</AuthLayout>
	);
};

export default SignupPage;
