import React from "react";
import BaseLink from "../../BaseComponents/BaseLink";
import BaseImage from "../../BaseComponents/BaseImage";
import { ENV_VARIABLES } from "@/app/constants/env_variables";

export default function HomeBanner({ config }) {
	return (
		<BaseLink href={config.link || "/"}>
			<BaseImage
				src={ENV_VARIABLES.IMAGE_BASE_URL + config.image}
				alt="banner"
				className="w-full h-auto max-md:min-h-[16vh] object-cover md:object-contain cursor-pointer"
			/>
		</BaseLink>
	);
}
