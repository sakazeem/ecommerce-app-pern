"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import FilterSidebar from "@/app/components/Shared/FiltersSidebar";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import ProductsSlider from "@/app/components/Themes/KidsTheme/ProductsSlider";
import MobileFilterDrawer from "@/app/components/Shared/MobileFilterDrawer";
import { useStore } from "@/app/providers/StoreProvider";
import ProductServices from "@/app/services/ProductServices";
import { useScrollRestoration } from "@/app/hooks/useScrollRestoration";
import { SlidersHorizontal } from "lucide-react";
import { loadThemeComponents } from "@/app/components/Themes/autoLoader";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
	const searchParams = useSearchParams();
	const paramsCategory = searchParams.get("category");
	const paramsBrand = searchParams.get("brand");
	const paramsSearch = searchParams.get("search");
	const store = useStore();
	const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
	const [resolvedCategory, setResolvedCategory] = useState(null);
	const { getTargetProduct, clearTargetProduct, scrollToProduct } =
		useScrollRestoration();
	const { Footer } = loadThemeComponents(store.themeName);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const [selectedFilters, setSelectedFilters] = useState({
		categories: [],
		brands: [],
		price: null,
		size: null,
		color: null,
	});

	const [defaultFilters, setDefaultFilters] = useState(null);
	const loaderRef = useRef(null);
	const category = paramsCategory || "";
	const brand = paramsBrand || "";
	const search = paramsSearch || "";

	const scrollAttempted = useRef(false);

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useInfiniteQuery({
			queryKey: [
				"filteredProducts",
				JSON.stringify(selectedFilters || {}),
				JSON.stringify(defaultFilters || {}),
				search,
				category,
				brand,
			],
			queryFn: ({ pageParam = 1 }) =>
				ProductServices.getFilteredProducts({
					filters: selectedFilters,
					defaultFilters,
					search: paramsSearch,
					page: pageParam,
					limit: PRODUCTS_PER_PAGE,
				}),
			getNextPageParam: (lastPage, allPages) => {
				const totalPages = Math.ceil(lastPage.total / PRODUCTS_PER_PAGE);
				return allPages.length < totalPages ? allPages.length + 1 : undefined;
			},
			enabled: !!store.themeName && defaultFilters !== null,
			staleTime: 1000 * 60 * 30,
			gcTime: 1000 * 60 * 60,
			refetchOnWindowFocus: false,
			refetchOnMount: false, // 🔥 key fix
			// placeholderData: (prev) => prev,
		});

	const products = data?.pages.flatMap((page) => page.records) ?? [];

	useEffect(() => {
		if (scrollAttempted.current) return;
		if (!data || defaultFilters === null || isLoading) return;

		const targetId = getTargetProduct();
		if (!targetId) return;

		const isLoaded = products.some((p) => String(p.id) === String(targetId));

		if (isLoaded) {
			scrollAttempted.current = true;
			scrollToProduct(targetId, clearTargetProduct);
		} else if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		} else if (!hasNextPage) {
			scrollAttempted.current = true;
			clearTargetProduct();
		}
	}, [data?.pages.length, defaultFilters, isLoading, isFetchingNextPage]);

	useEffect(() => {
		if (!loaderRef.current || isFetchingNextPage || !hasNextPage) return;
		if (!scrollAttempted.current && getTargetProduct()) return; // wait for restore

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
			},
			{ rootMargin: "200px" },
		);
		observer.observe(loaderRef.current);
		return () => observer.disconnect();
	}, [isFetchingNextPage, hasNextPage, fetchNextPage, scrollAttempted.current]);

	return (
		<>
			<main>
				<section className="container-layout section-layout">
					{/* Mobile Filter Button */}
					<div className="md:hidden flex justify-between items-center mb-4">
						<button
							onClick={() => setMobileFilterOpen(true)}
							className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white shadow-sm">
							<SlidersHorizontal size={18} />
							Filters
						</button>
					</div>
					<section className="grid md:grid-cols-4 gap-10 relative">
						{/* Desktop Sidebar */}
						<aside className="md:col-span-1 max-md:hidden bg-light">
							<div className="sticky/ top-46/">
								<FilterSidebar
									selectedFilters={selectedFilters}
									setSelectedFilters={setSelectedFilters}
									paramsCategory={paramsCategory}
									paramsBrand={paramsBrand}
									defaultFilters={defaultFilters}
									setDefaultFilters={setDefaultFilters}
									onCategoryResolved={setResolvedCategory}
								/>
							</div>
						</aside>

						<section className="md:col-span-3">
							<h4 className="h4 font-bold mb-4 border-b pb-1">
								Results
								{resolvedCategory && (
									<span>
										{" > "}
										{resolvedCategory.translations?.[0]?.title ??
											resolvedCategory.title}
									</span>
								)}
							</h4>

							{isLoading ? (
								<div className="flex justify-center py-20">
									<SpinLoader />
								</div>
							) : products.length > 0 ? (
								<>
									{/* Render each page separately to ensure all products show */}
									{data?.pages.map((page, pageIndex) => (
										<div key={pageIndex} className="mb-8">
											<ProductsSlider
												productsData={page.records}
												isSlider={false}
												showTitle={false}
											/>
										</div>
									))}

									{/* Infinite scroll trigger */}
									{hasNextPage && (
										<div ref={loaderRef} className="flex justify-center py-10">
											{isFetchingNextPage && <SpinLoader />}
										</div>
									)}

									{/* End of results indicator */}
									{!hasNextPage && products.length > PRODUCTS_PER_PAGE && (
										<p className="text-center text-muted py-6 p4">
											You've reached the end of the results
										</p>
									)}
								</>
							) : (
								<h4 className="h4 text-muted text-center section-layout">
									No products found, please adjust filters
								</h4>
							)}
						</section>
					</section>
				</section>

				{/* Mobile Drawer */}
				{mobileFilterOpen && (
					<MobileFilterDrawer
						onClose={() => setMobileFilterOpen(false)}
						selectedFilters={selectedFilters}
						setSelectedFilters={setSelectedFilters}
						paramsCategory={paramsCategory}
						paramsBrand={paramsBrand}
						defaultFilters={defaultFilters}
						setDefaultFilters={setDefaultFilters}
					/>
				)}

				{/* <div className="w-full h-px bg-border-color" />

			<section className="container-layout section-layout">
				{recentlyViewed.length > 0 && (
					<ProductsSlider
						productsData={recentlyViewed}
						isSlider={false}
						title="Recently Viewed Products"
						columns="grid-cols-5"
					/>
				)}
			</section> */}
			</main>

			{!isLoading && isMobile && <Footer />}
		</>
	);
};

export default ProductsPage;
