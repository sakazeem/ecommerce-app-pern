"use client";

import AuthLayout from "@/app/components/Themes/KidsTheme/AuthLayout";
import InputArea from "@/app/components/Shared/form/InputArea";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import AuthServices from "@/app/services/AuthServices";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const onSubmit = async (values) => {
		if (!token) {
			toast.error("Reset token is missing or invalid");
			return;
		}
		try {
			await AuthServices.resetPassword(token, { password: values.password });
			toast.success("Password updated. Please sign in.");
			router.push("/login");
		} catch (err) {
			toast.error(err.message || "Failed to reset password");
		}
	};

	return (
		<AuthLayout>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6 md:w-[75%]"
				noValidate>
				<div>
					<h1 className="h2 font-semibold">Reset Password</h1>
					<p className="text-muted font-medium mt-3">
						Enter a new password for your account.
					</p>
				</div>

				<InputArea
					name={"password"}
					label={"New Password:"}
					type={"password"}
					register={register}
					placeholder={"Enter new password"}
					errorName={errors.password}
				/>

				<PrimaryButton className="w-full" disabled={isSubmitting}>
					Update Password
				</PrimaryButton>

				<p className="text-muted text-sm text-center">
					Back to{" "}
					<BaseLink href="/login" className="text-secondary">
						Sign In
					</BaseLink>
				</p>
			</form>
		</AuthLayout>
	);
};

export default ResetPasswordPage;
