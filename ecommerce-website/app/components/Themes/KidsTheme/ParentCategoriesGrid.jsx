"use client";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import BaseImage from "../../BaseComponents/BaseImage";
import BaseLink from "../../BaseComponents/BaseLink";
import SectionTitle from "../../Shared/SectionTitle";

const ParentCategoriesGrid = ({
	title,
	data = [],
	bgColor,
	// bgColor = "bg-secondary/80",
	showTitle = true,
}) => {
	return (
		<section className="container-layout">
			{title && (
				<SectionTitle title={title} href={`/products?category=${title}`} />
			)}
			<section className="grid grid-cols-2 md:grid-cols-4 justify-between gap-6 max-md:gap-3 items-stretch">
				{data?.map((pCat, idx) => (
					<div key={idx}>
						<BaseLink
							href={`/products?category=${pCat.slug}`}
							style={{
								backgroundColor: bgColor || "transparent",
							}}
							className={`${
								showTitle ? "p-2" : ""
							} h-full  text-light block rounded-lg hover:scale-105 transition-all duration-500 hover:shadow-lg`}>
							<BaseImage
								src={
									pCat.icons
										? ENV_VARIABLES.IMAGE_BASE_URL + "sm-image-" + pCat.icons
										: pCat.icon
								}
								key={idx}
								style={{
									backgroundColor: bgColor || "transparent",
								}}
								className={`w-full rounded-lg ${
									showTitle ? "md:h-80" : "md:h-full"
								}  object-cover`}
							/>
							{showTitle && (
								<p className="text-center capitalize mt-2 p3 font-normal">
									{pCat.title}
								</p>
							)}
						</BaseLink>
					</div>
				))}
			</section>
		</section>
	);
};
export default ParentCategoriesGrid;
