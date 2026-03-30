import React, { useState } from "react";
import Label from "@/app/components/Shared/form/Label";
import Error from "./Error";
import { Eye, EyeOff } from "lucide-react"; // or any icon library you use

const InputArea = ({
	name,
	label,
	type,
	Icon,
	register,
	readOnly,
	defaultValue,
	autocomplete,
	placeholder,
	required = true,
	pattern,
	patternMessage = "Invalid input",
	errorName,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	const isPassword = type === "password";

	return (
		<section>
			<Label htmlFor={name} label={label} required={required} />

			<div className="relative">
				{/* Left icon */}
				{Icon && (
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span className="text-gray-800 sm:text-base">
							<Icon />
						</span>
					</div>
				)}

				<input
					{...register(`${name}`, {
						required: required ? `${label} is required!` : false,
						pattern: pattern
							? {
									value: pattern,
									message: patternMessage,
								}
							: type === "email"
								? {
										value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
										message: "Please enter a valid email address",
									}
								: undefined,
					})}
					type={isPassword && showPassword ? "text" : type}
					name={name}
					readOnly={readOnly}
					defaultValue={defaultValue}
					placeholder={placeholder}
					autoComplete={autocomplete}
					className={`${
						Icon ? "py-2 pl-10 pr-10" : "py-2 px-4 md:px-2 pr-10"
					} w-full appearance-none border text-sm opacity-75 text-input rounded-md placeholder-body min-h-12 transition duration-200 focus:ring-0 ease-in-out bg-white border-gray-200 focus:outline-none focus:border-emerald-500 h-11 md:h-12 ${
						readOnly ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
					}`}
				/>

				{/* Password toggle icon */}
				{isPassword && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
						{!showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				)}

				<Error errorName={errorName} />
			</div>
		</section>
	);
};

export default InputArea;
