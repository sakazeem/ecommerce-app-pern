import requests from "./httpServices";
import { serverGet } from "./serverFetch";

const ProductServices = {
	getProductSuggestions: async ({ search, categoryIds = [] }) => {
		try {
			const params = {};
			if (search) params.search = search;
			// Pass pool category IDs so BE returns only products from those categories
			if (categoryIds.length) params.categoryId = categoryIds;

			const data = await requests.get("/product/suggestions", { params });

			if (data && data.records?.length > 0) {
				return data;
			}
		} catch (err) {
			console.error("API error:", err);
		}
		return [];
	},
	getProducts: async ({
		themeName = "KidsTheme",
		categoryId,
		sort = "latest",
		limit,
		page,
	}) => {
		try {
			const params = { sort };

			if (categoryId) params.categoryId = categoryId;
			if (limit) params.limit = limit;
			if (page) params.page = page;

			// Pass params to requests.get without hardcoding query string
			const data = await requests.get("/product", { params });

			if (data && data.records?.length > 0) {
				return data;
			} else {
				return null;
			}
		} catch (err) {
			console.error("API error:", err);
		}

		const dataModule = await import(`../data/${themeName}/data`);
		// const dataModule  = await import(`./${themeName}/data.js`);
		return dataModule.latestProducts;
	},
	getLatestProducts: async (themeName = "KidsTheme", limit) => {
		try {
			const data = await requests.get(
				`/product?sort=latest${limit ? `&limit=${limit}` : ""}`,
			);
			if (data && data.records?.length > 0) {
				return data;
			}
		} catch (err) {
			console.error("API error:", err);
		}

		const dataModule = await import(`../data/${themeName}/data`);
		// const dataModule  = await import(`./${themeName}/data.js`);
		return dataModule.latestProducts;
	},

	// example filters
	// 	{
	// 	categories: [165, 153],
	// 	brands: [26, 14],
	// 	price: { min: 100, max: 200 },
	// 	size: "18-24m",
	// 	color: "brown"
	// 	}
	getCategoryFilteredProducts: async ({
		themeName = "KidsTheme",
		filters,
		defaultFilters,
		search,
		filterQuery,
		poolCategoryIds,
		page,
		limit,
	}) => {
		const params = {
			sort: "latest",
			...buildFilterParams(filters, defaultFilters),
		};

		if (limit) params.limit = limit;
		if (page) params.page = page;
		if (search) params.search = search;
		if (filterQuery) params.filterQuery = filterQuery;
		if (poolCategoryIds) params.poolCategoryIds = poolCategoryIds;

		try {
			const data = await requests.get(`/product/category-filter`, {
				params,
			});
			if (data) return data;
		} catch (err) {
			console.error("API error:", err);
		}

		const dataModule = await import(`../data/${themeName}/data`);
		// const dataModule  = await import(`./${themeName}/data.js`);
		return dataModule.latestProducts;
	},

	getFilteredProducts: async ({
		themeName = "KidsTheme",
		filters,
		defaultFilters,
		search,
		filterQuery,
		page,
		limit,
	}) => {
		const params = {
			sort: "latest",
			...buildFilterParams(filters, defaultFilters),
		};

		if (limit) params.limit = limit;
		if (page) params.page = page;
		if (search) params.search = search;
		if (filterQuery) params.filterQuery = filterQuery;

		try {
			const data = await requests.get(`/product/filter`, {
				params,
			});
			if (data) return data;
		} catch (err) {
			console.error("API error:", err);
		}

		const dataModule = await import(`../data/${themeName}/data`);
		// const dataModule  = await import(`./${themeName}/data.js`);
		return dataModule.latestProducts;
	},
	getProductBySlug: async (themeName, slug) => {
		try {
			const data = await requests.get(`/product/${slug}`);
			return data;
		} catch (err) {
			console.error("API error:", err);
		}

		const dataModule = await import(`../data/${themeName}/data`);
		// const dataModule  = await import(`./${themeName}/data.js`);
		return dataModule.latestProducts;
	},

	/**
	 * Fetch a specific list of products by their IDs.
	 * Used by homepage sections that have selected_product_ids configured.
	 * @param {number[]} productIds
	 */
	getProductsByIds: async (productIds = []) => {
		if (!productIds.length) return { records: [], total: 0 };
		try {
			const params = { productIds: productIds.join(",") };
			const data = await requests.get("/product/by-ids", { params });
			if (data && data.records?.length > 0) return data;
		} catch (err) {
			console.error("API error:", err);
		}
		return { records: [], total: 0 };
	},

	getProductBySlugServerSide: async (themeName, slug) => {
		try {
			return await serverGet(`/product/${slug}`, {
				revalidate: 300, // cache for 5 minutes
				tags: [`/product/${slug}`],
			});
		} catch (err) {
			console.error("API error:", err);
			return null;
		}
	},
};

export default ProductServices;

const buildFilterParams = (filters = {}, defaultFilters = {}) => {
	const params = {};

	// categories → repeated categoryId
	if (filters.categories?.length) {
		params.categoryId = filters.categories; // array
	} else if (defaultFilters.categories) {
		params.categoryId = [defaultFilters.categories]; // array
	}

	// brands → repeated brandId
	if (filters.brands?.length) {
		// params.vendorId = filters.brands; // array
		params.brandId = filters.brands; // array
	} else if (defaultFilters.brands) {
		// params.vendorId = [defaultFilters.brands]; // array
		params.brandId = [defaultFilters.brands]; // array
	}

	// price
	if (filters.price?.min != null) {
		params.minPrice = filters.price.min;
	}

	if (filters.price?.max != null) {
		params.maxPrice = filters.price.max;
	}

	// single values
	if (filters.color) {
		params.color = filters.color;
	}

	if (filters.size) {
		params.size = filters.size;
	}

	return params;
};
