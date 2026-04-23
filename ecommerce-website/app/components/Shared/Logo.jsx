import React from "react";
import BaseLink from "../BaseComponents/BaseLink";
import BaseImage from "../BaseComponents/BaseImage";

const Logo = ({ src, className = "", width = 120, height = 60 }) => {
	return (
		<BaseLink href="/" aria-label="Go to homepage">
			<BaseImage
				src={src}
				alt="logo"
				width={width}
				height={height}
				className={className}
			/>
		</BaseLink>
	);
};

export default Logo;
