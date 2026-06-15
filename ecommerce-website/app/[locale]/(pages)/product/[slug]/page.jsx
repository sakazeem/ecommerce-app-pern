import Layout from "@/app/components/Shared/layout/Layout";
import { instanceWithoutCredentials } from "@/app/services/httpServices";
import ProductDetailsPage from "./ProductDetailsPage";
import { ENV_VARIABLES } from "@/app/constants/env_variables";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const response = await instanceWithoutCredentials.get(`/product/${slug}`);
    const data = response.data;

    const title = data.title || "Default Title";
    const description = data.excerpt || "Default description";

    const imageUrl = data.thumbnail
      ? `${ENV_VARIABLES.IMAGE_BASE_URL}${data.thumbnail}`
      : `https://cdn.babiesnbaba.com/og-default.jpg`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://babiesnbaba.com/product/${slug}`,
      },
      openGraph: {
        type: "website",
        url: `https://babiesnbaba.com/product/${slug}`,
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 1200,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error fetching product metadata:", error);
    // Don't return null here — that wipes ALL inherited metadata
    // (including the root og:image), which is why links showed
    // no preview at all when the API call failed.
    return {
      title: "Product | BabiesNBaba",
      description: "Shop quality baby products at BabiesNBaba.",
    };
  }
}

const Products = () => (
  <Layout>
    <ProductDetailsPage />
  </Layout>
);

export default Products;
