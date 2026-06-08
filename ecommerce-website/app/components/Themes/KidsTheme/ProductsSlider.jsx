"use client";
import clsx from "clsx";
import BaseSlider from "../../BaseComponents/BaseSlider";
import SectionTitle from "../../Shared/SectionTitle";
import ProductCard from "./ProductCard";
import ProductServices from "@/app/services/ProductServices";
import SpinLoader from "../../Shared/SpinLoader";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useMemo } from "react";
import { ProductsGridSkeleton } from "./SkeletonLoaders";

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
	poolCategoryIds,
	selectedProductIds, // 🎯 cherry-picked product IDs from admin
}) => {
	const effectiveLimit = limit || 10;

	// 🎯 If specific products were hand-picked by admin, fetch only those
	const { data: selectedProducts, isLoading: isLoadingSelected } =
		useFetchReactQuery(
			() => ProductServices.getProductsByIds(selectedProductIds),
			["selectedProducts", selectedProductIds?.join(",")],
			{ enabled: isFetchProducts && Boolean(selectedProductIds?.length) },
		);

	const { data: products, isLoading: isLoadingCat } = useFetchReactQuery(
		() =>
			ProductServices.getCategoryFilteredProducts({
				page: 1,
				limit: effectiveLimit,
				...(categoryId
					? { filters: { categories: [categoryId] } }
					: query
						? { filterQuery: query }
						: {}),
				...(poolCategoryIds ? { poolCategoryIds } : {}),
			}),
		["latestProducts", categoryId, limit, query, poolCategoryIds],
		{ enabled: isFetchProducts && !selectedProductIds?.length },
	);

	const isLoading = selectedProductIds?.length
		? isLoadingSelected
		: isLoadingCat;

	// Use selected products if available, otherwise fall back to category fetch
	const activeData = selectedProductIds?.length ? selectedProducts : products;

	const slidesData = useMemo(() => {
		return isFetchProducts ? activeData?.records : productsData;
	}, [
		isFetchProducts,
		JSON.stringify(activeData),
		JSON.stringify(productsData),
	]);

	// Hide "View All" if all available products are already shown,
	// or if products were manually cherry-picked (they already ARE the selection)
	const hasMore = selectedProductIds?.length
		? false
		: isFetchProducts
			? activeData?.total != null && activeData.total > effectiveLimit
			: productsData?.length >= effectiveLimit;

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
			{isLoading ? (
				<ProductsGridSkeleton />
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
