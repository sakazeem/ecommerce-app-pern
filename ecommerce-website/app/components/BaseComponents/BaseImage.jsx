import Image from "next/image";
import noImage from "@/app/assets/no-image.png";

const BaseImage = ({
	src,
	alt = "",
	width,
	height,
	sizes,
	className = "",
	...props
}) => {
	const validSrc = src ? src : noImage;
	const isNetworkImage =
		typeof validSrc === "string" ? validSrc.startsWith("http") : false;
	return isNetworkImage ? (
		<Image
			src={validSrc}
			width={600}
			height={600}
			sizes={sizes}
			className={className}
			alt={alt}
			unoptimized
			{...props}
		/>
	) : (
		<Image
			src={validSrc}
			width={width}
			height={height}
			sizes={sizes}
			className={className}
			alt={alt}
			{...props}
		/>
	);
};

export default BaseImage;
