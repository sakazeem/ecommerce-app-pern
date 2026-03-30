"use client";

import AuthLayout from "@/app/components/Themes/KidsTheme/AuthLayout";
import InputArea from "@/app/components/Shared/form/InputArea";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import AuthServices from "@/app/services/AuthServices";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm();

	const onSubmit = async (values) => {
		try {
			await AuthServices.forgotPassword({ email: values.email });
			toast.success("Password reset link sent to your email");
			reset();
		} catch (err) {
			toast.error(err.message || "Failed to send reset link");
		}
	};

	return (
		<AuthLayout>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6 md:w-[75%]"
				noValidate>
				<div>
					<h1 className="h2 font-semibold">Forgot Password</h1>
					<p className="text-muted font-medium mt-3">
						Enter your email and we will send a reset link.
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

				<PrimaryButton className="w-full" disabled={isSubmitting}>
					Send Reset Link
				</PrimaryButton>

				<p className="text-muted text-sm text-center">
					Remembered your password?{" "}
					<BaseLink href="/login" className="text-secondary">
						Sign In
					</BaseLink>
				</p>
			</form>
		</AuthLayout>
	);
};

export default ForgotPasswordPage;
