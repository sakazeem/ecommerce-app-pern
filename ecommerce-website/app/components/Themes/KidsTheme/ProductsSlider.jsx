import clsx from "clsx";
import BaseSlider from "../../BaseComponents/BaseSlider";
import SectionTitle from "../../Shared/SectionTitle";
import ProductCard from "./ProductCard";
import ProductServices from "@/app/services/ProductServices";
import SpinLoader from "../../Shared/SpinLoader";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useMemo } from "react";

const ProductsSlider = ({
	title = "",
	slug = "",
	columns = "grid-cols-4",
	productsData = [],
	isSlider = "both", //onlyMobile
	showTitle = true,
	isMobileSlider,
	isFetchProducts = false,
	limit,
	categoryId,
	categorySlug,
	query,
}) => {
	const viewAllParam = categorySlug
		? categorySlug
		: query
			? `/products?${query}`
			: "";
	const { data: products, isLoading } = useFetchReactQuery(
		() =>
			ProductServices.getCategoryFilteredProducts({
				page: 1,
				limit: limit || 10,
				...(categoryId
					? { filters: { categories: [categoryId] } }
					: query
						? { filterQuery: query }
						: {}),
			}),
		["latestProducts", categoryId, limit, query],
		{ enabled: isFetchProducts },
	);

	const slidesData = useMemo(() => {
		return isFetchProducts ? products?.records : productsData;
	}, [isFetchProducts, JSON.stringify(products)]);
	return (
		<>
			{showTitle && <SectionTitle title={title} href={viewAllParam} />}
			{isLoading ? (
				<SpinLoader />
			) : isSlider ? (
				<BaseSlider
					slides={slidesData}
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
					{slidesData?.map((product) => (
						<ProductCard product={product} key={product.id} />
					))}
				</section>
			)}
		</>
	);
};

export default ProductsSlider;
