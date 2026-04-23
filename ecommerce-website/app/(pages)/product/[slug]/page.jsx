import Layout from "@/app/components/Shared/layout/Layout";
import { instanceWithoutCredentials } from "@/app/services/httpServices";
import ProductDetailsPage from "./ProductDetailsPage";
import { ENV_VARIABLES } from "@/app/constants/env_variables";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	try {
		// Get the full response object first
		const response = await instanceWithoutCredentials.get(`/product/${slug}`);

		// Then extract data from response
		const data = response.data;

		const title = data.title || "Default Title";
		const image = data.thumbnail
			? [`${ENV_VARIABLES.IMAGE_BASE_URL}${data.thumbnail}`]
			: [];
		const description = data.excerpt || "Default description";

		return {
			title,
			description,
			openGraph: {
				images: image,
				title,
				description,
			},
			twitter: {
				images: image,
				title,
				description,
			},
		};
	} catch (error) {
		console.error("Error fetching product metadata:", error);
		return null;
		return {
			title: "Product Not Found",
			description: "Product details",
		};
	}
}

const Products = () => (
	<Layout>
		<ProductDetailsPage />
	</Layout>
);

export default Products;
