"use client";

import clsx from "clsx";
import BaseSlider from "../../../../BaseComponents/BaseSlider";
import SectionTitle from "../../../../Shared/SectionTitle";
import ProductCard from "../../ProductCard";

const ProductsSliderClient = ({
	title,
	slug,
	columns = "grid-cols-4",
	isSlider = "both",
	showTitle = true,
	products = [],
	total = 0,
	effectiveLimit,
	categorySlug,
	query,
	isFetched,
	selectedProductIds,
}) => {
	const hasMore = selectedProductIds?.length
		? false
		: isFetched
			? total > effectiveLimit
			: products.length >= effectiveLimit;

	const viewAllParam = hasMore
		? categorySlug
			? categorySlug
			: query
				? `/products?${query}`
				: ""
		: undefined;

	return (
		<>
			{showTitle && <SectionTitle title={title} href={viewAllParam} />}

			{isSlider ? (
				<BaseSlider
					slides={products}
					slidesPerView={2}
					spaceBetween={12}
					slidesPerGroup={2}
					showNavigation={false}
					showPagination={false}
					breakpoints={{
						768: {
							slidesPerView: 5,
							showNavigation: true,
							showPagination: true,
							spaceBetween: 24,
						},
					}}
					renderSlide={(product) => (
						<ProductCard product={product} key={product.id} />
					)}
				/>
			) : (
				<section
					className={clsx(
						`grid ${columns} gap-6 max-md:gap-3 max-md:grid-cols-2 items-stretch`,
					)}>
					{products.map((product) => (
						<ProductCard product={product} key={product.id} />
					))}
				</section>
			)}
		</>
	);
};

export default ProductsSliderClient;
