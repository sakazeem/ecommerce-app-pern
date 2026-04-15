"use client";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useStore } from "@/app/providers/StoreProvider";
import ProductServices from "@/app/services/ProductServices";
import BaseTab from "../../BaseComponents/BaseTabs";
import Loader from "../../Shared/Loader";
import ProductCard from "./ProductCard";
import { useState } from "react";
import SectionTitle from "../../Shared/SectionTitle";
import SpinLoader from "../../Shared/SpinLoader";

const PopularCatTabs = ({ title, tabs, productsPerTab }) => {
	const store = useStore();
	const [activeTabIndex, setActiveTabIndex] = useState(0);

	const popularTabs = tabs || store.content.popularTabs || [];
	const activeTab = popularTabs[activeTabIndex];

	const { data, isLoading } = useFetchReactQuery(
		() =>
			ProductServices.getCategoryFilteredProducts({
				...(activeTab?.id ? { filters: { categories: [activeTab.id] } } : {}),
				limit: productsPerTab || 10,
				page: 1,
			}),
		["popularCatProducts", activeTab?.id || "", productsPerTab],
		{ enabled: !!activeTab?.id },
	);

	return (
		<section className="container-layout">
			{title && <SectionTitle title={title} className="justify-center" />}

			<BaseTab
				defaultIndex={0}
				onChange={(index) => setActiveTabIndex(index)}
				tabs={popularTabs.map((tab) => ({
					label: tab.title,
					content: () => {
						if (isLoading && activeTab?.id === tab.id) return <SpinLoader />;

						const products = data?.records || [];
						if (products.length === 0) {
							return <p className="text-center p4">No products available.</p>;
						}

						return (
							<div className="grid grid-cols-5 max-md:grid-cols-2 gap-6 max-md:gap-3">
								{products.map((product) => (
									<ProductCard
										key={`${tab.title}-product-${product.id}`}
										product={product}
									/>
								))}
							</div>
						);
					},
				}))}
			/>
		</section>
	);
};

export default PopularCatTabs;
