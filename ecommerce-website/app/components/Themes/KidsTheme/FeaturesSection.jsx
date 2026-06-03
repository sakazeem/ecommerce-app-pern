"use client";
import { useStore } from "@/app/providers/StoreProvider";
import React from "react";
import BaseImage from "../../BaseComponents/BaseImage";

const FeaturesSection = () => {
	const store = useStore();
	return (
		<section className="container-layout grid grid-cols-2 md:grid-cols-4 justify-between gap-6 max-md:gap-3 items-stretch">
			{store.content.features?.map((feature, i) => (
				<div
					key={`feature-${i}`}
					className="w-full border flex max-md:flex-col gap-2 max-md:gap-1 md:items-center rounded-md p-4 max-md:p-2">
					<BaseImage
						src={feature.icon}
						alt={feature.title}
						className="w-18 max-md:w-12 max-md:mb-1"
					/>
					<div>
						<h6 className="h7 font-bold">{feature.title}</h6>
						<p className="p6 md:mt-1">{feature.description}</p>
					</div>
				</div>
			))}
		</section>
	);
};

export default FeaturesSection;
