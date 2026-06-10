import ProductServices from "@/app/services/ProductServices";
import ProductsSliderClient from "./ProductsSliderClient";

const ProductsSliderServer = async (props) => {
	const {
		isFetchProducts,
		selectedProductIds,
		categoryId,
		query,
		poolCategoryIds,
		limit,
		productsData,
		...rest
	} = props;

	const effectiveLimit = limit || 10;

	let products = [];
	let total = 0;

	// CASE 1: admin selected products
	if (isFetchProducts && selectedProductIds?.length) {
		const res = await ProductServices.getProductsByIds(selectedProductIds);
		products = res?.records || [];
		total = res?.total || 0;
	}

	// CASE 2: category/query products
	else if (isFetchProducts) {
		const res = await ProductServices.getCategoryFilteredProducts({
			page: 1,
			limit: effectiveLimit,
			...(categoryId
				? { filters: { categories: [categoryId] } }
				: query
					? { filterQuery: query }
					: {}),
			...(poolCategoryIds ? { poolCategoryIds } : {}),
		});

		products = res?.records || [];
		total = res?.total || 0;
	}

	// CASE 3: static data
	else {
		products = productsData || [];
	}

	return (
		<ProductsSliderClient
			{...rest}
			products={products}
			total={total}
			effectiveLimit={effectiveLimit}
			isFetched={isFetchProducts}
			selectedProductIds={selectedProductIds}
		/>
	);
};

export default ProductsSliderServer;
