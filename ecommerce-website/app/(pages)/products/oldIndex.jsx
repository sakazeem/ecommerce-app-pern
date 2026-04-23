"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import FilterSidebar from "@/app/components/Shared/FiltersSidebar";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import ProductsSlider from "@/app/components/Themes/KidsTheme/ProductsSlider";

import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useStore } from "@/app/providers/StoreProvider";
import ProductServices from "@/app/services/ProductServices";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
	const searchParams = useSearchParams();
	const paramsCategory = searchParams.get("category");
	const paramsBrand = searchParams.get("brand");
	const paramsSearch = searchParams.get("search");
	const store = useStore();
	const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
	const [selectedFilters, setSelectedFilters] = useState({
		categories: [],
		brands: [],
		price: null,
		size: null,
		color: null,
	});

	const [defaultFilters, setDefaultFilters] = useState(null);

	const [page, setPage] = useState(1);
	const [products, setProducts] = useState([]);
	const [hasMore, setHasMore] = useState(true);

	const loaderRef = useRef(null);

	const { data, isLoading } = useFetchReactQuery(
		() =>
			ProductServices.getFilteredProducts({
				themeName: store.themeName,
				filters: selectedFilters,
				defaultFilters,
				search: paramsSearch,
				page,
				limit: PRODUCTS_PER_PAGE,
			}),
		[
			"filteredProducts",
			store.themeName,
			JSON.stringify(selectedFilters),
			JSON.stringify(defaultFilters || {}),
			paramsSearch?.toString() || "",
			page,
		],
		{
			enabled: !!store.themeName && defaultFilters !== null,
			keepPreviousData: true,
		},
		// {
		// 	enabled: !!store.themeName && defaultFilters !== null && hasMore,
		// 	keepPreviousData: true,
		// },
	);

	/* ============================
	   Reset on filter change
	============================ */
	useEffect(() => {
		setProducts([]);
		setPage(1);
		setHasMore(true);
	}, [selectedFilters, searchParams.toString(), defaultFilters]);

	/* ============================
	   Append fetched products
	============================ */
	// useEffect(() => {
	// 	if (!data?.records) return;

	// 	setProducts((prev) => [...prev, ...data.records]);

	// 	if (data.records.length < PRODUCTS_PER_PAGE) {
	// 		setHasMore(false);
	// 	}
	// }, [data]);
	useEffect(() => {
		if (!data?.records) return;

		setProducts((prev) => [...prev, ...data.records]);
		setIsFetchingNextPage(false);

		if (data.records.length < PRODUCTS_PER_PAGE) {
			setHasMore(false);
		}
	}, [data]);

	/* ============================
	   Infinite Scroll Observer
	============================ */
	// useEffect(() => {
	// 	if (!loaderRef.current || isLoading || !hasMore) return;

	// 	const observer = new IntersectionObserver(
	// 		(entries) => {
	// 			if (entries[0].isIntersecting) {
	// 				setPage((prev) => prev + 1);
	// 			}
	// 		},
	// 		{ rootMargin: "200px" }, // preload before reaching bottom
	// 	);

	// 	observer.observe(loaderRef.current);

	// 	return () => observer.disconnect();
	// }, [isLoading, hasMore]);
	useEffect(() => {
		if (!loaderRef.current || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const firstEntry = entries[0];

				if (firstEntry.isIntersecting && !isLoading && !isFetchingNextPage) {
					setIsFetchingNextPage(true);
					setPage((prev) => prev + 1);
				}
			},
			{ rootMargin: "200px" },
		);

		observer.observe(loaderRef.current);

		return () => observer.disconnect();
	}, [isLoading, hasMore, isFetchingNextPage]);

	return (
		<main>
			<section className="container-layout section-layout">
				<section className="grid md:grid-cols-4 gap-10">
					<FilterSidebar
						selectedFilters={selectedFilters}
						setSelectedFilters={setSelectedFilters}
						paramsCategory={paramsCategory}
						paramsBrand={paramsBrand}
						defaultFilters={defaultFilters}
						setDefaultFilters={setDefaultFilters}
					/>

					<section className="md:col-span-3">
						<h4 className="h4 font-bold mb-4 border-b pb-1">Results</h4>

						{products.length > 0 ? (
							<ProductsSlider
								productsData={products}
								isSlider={false}
								showTitle={false}
							/>
						) : !isLoading ? (
							<h4 className="h4 text-muted text-center section-layout">
								No products found, please adjust filters
							</h4>
						) : null}

						{/* Loader trigger */}
						{hasMore && (
							<div ref={loaderRef} className="flex justify-center py-10">
								<SpinLoader />
							</div>
						)}
					</section>
				</section>
			</section>

			<div className="w-full h-px bg-border-color" />

			<section className="container-layout section-layout">
				<ProductsSlider
					productsData={products.slice(0, 5)}
					isSlider={false}
					title="Recently Viewed Products"
					columns="grid-cols-5"
				/>
			</section>
		</main>
	);
};

export default ProductsPage;
