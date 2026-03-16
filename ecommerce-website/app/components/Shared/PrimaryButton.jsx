"use client";
import { useRouter } from "next/navigation";
import React from "react";

const PrimaryButton = ({
	className = "",
	children,
	isSmall = false,
	onClick = () => {},
	link,
	disabled = false,

	// 🎨 Styling props
	bgColor = "bg-primary",
	hoverBgColor = "bg-primary",
	textColor = "text-primary",
	hoverTextColor = "text-light",
	borderColor = "border-primary",
	rounded = "rounded-full",
	justifyContent = "justify-center",
	style = {},
}) => {
	const router = useRouter();

	return (
    <>
      <button
        type="submit"
        onClick={() => {
          if (link) router.push(link);
          else onClick();
        }}
        style={style}
        disabled={disabled}
        className={`
				group
				relative
				overflow-hidden
				border
				${borderColor}
				${rounded}
				font-medium
				transition-all
				duration-300
				${textColor}
				${isSmall ? "px-3 py-1 text-xs" : "px-5 py-2 text-sm"}
				${className}
				disabled:border-gray-400 disabled:text-gray-400
				max-md:hidden
			`}
      >
        {/* 🔥 Hover sliding background */}
        <span
          className={`
					absolute
					inset-0
					-translate-x-full
					${hoverBgColor}
					transition-transform
					duration-300
					ease-out
					group-hover:translate-x-0
				`}
        />

        {/* Content */}
        <span
          style={style}
          className={`
					relative
					z-10
					flex
					items-center/
					justify-center/
					transition-all
					duration-300
					group-hover:text-light
					/group-hover:${hoverTextColor}
					flex ${justifyContent} items-center gap-2 w-full
				`}
        >
          {children}
        </span>
      </button>
      <button
        type="submit"
        onClick={() => {
          if (link) router.push(link);
          else onClick();
        }}
        style={style}
        disabled={disabled}
        className={`
				group
				relative
				overflow-hidden
				border
				${borderColor}
				${rounded}
				font-medium
				transition-all
				duration-300
				${textColor}
				${isSmall ? "px-3 py-1 text-xs" : "px-5 py-2 text-sm"}
				${className}
				max-md:text-light
				max-md:bg-primary

				md:hidden
			`}
      >
        {/* Content */}
        <span
          style={style}
          className={`
					relative
					z-10
					flex
					items-center/
					justify-center/
					transition-all
					duration-300
					group-hover:text-light
					/group-hover:${hoverTextColor}
					flex ${justifyContent} items-center gap-2 w-full
				`}
        >
          {children}
        </span>
      </button>
    </>
  );
};

export default PrimaryButton;
