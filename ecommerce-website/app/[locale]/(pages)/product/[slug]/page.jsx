import Layout from "@/app/components/Shared/layout/Layout";
import ProductDetailsPage from "./ProductDetailsPage";
import ProductServices from "@/app/services/ProductServices";

const SITE_URL = "https://babiesnbaba.com";
const CDN_BASE = "https://cdn.babiesnbaba.com";
const DEFAULT_OG_IMAGE = `${CDN_BASE}/ogimage-1781639460371.png`;

/**
 * Resolve the full image URL for Open Graph / Twitter cards.
 *
 * The API returns thumbnails in two possible shapes:
 *   1. Already a full URL  → "https://cdn.babiesnbaba.com/foo.jpg"
 *   2. A relative path     → "/foo.jpg"  or  "foo.jpg"
 *
 * NEXT_PUBLIC_IMAGE_BASE_URL should be "https://cdn.babiesnbaba.com"
 * (without a trailing slash).  We fall back to CDN_BASE when the
 * env-var is not set so the build never breaks.
 */
function resolveImageUrl(thumbnail) {
  if (!thumbnail) return DEFAULT_OG_IMAGE;

  // Already a full URL — use as-is
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }

  // Relative path — prepend CDN base
  const base =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "") ?? CDN_BASE;
  const path = thumbnail.startsWith("/") ? thumbnail : `/${thumbnail}`;
  return `${base}${path}`;
}

/**
 * Strip HTML tags and collapse whitespace so the description is
 * plain text suitable for meta tags (WhatsApp / Facebook crawlers
 * do not render HTML in og:description).
 */
function toPlainText(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ") // remove tags
    .replace(/&nbsp;/g, " ") // decode common entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const response = await ProductServices.getProductBySlug("KidsTheme", slug);
    const data = response?.data ?? response; // handle both axios shapes

    const title =
      data?.title?.trim() || data?.name?.trim() || "Products | BabiesNBaba";

    // `excerpt` may contain HTML; strip it for clean meta description
    const rawDescription = data?.excerpt || data?.description || "";
    const description =
      toPlainText(rawDescription) ||
      "Shop quality baby products at BabiesNBaba.";

    const imageUrl = resolveImageUrl(data?.thumbnail);
    const productUrl = `${SITE_URL}/product/${slug}`;

    return {
      title,
      description,

      alternates: {
        canonical: productUrl,
      },

      openGraph: {
        type: "website",
        url: productUrl,
        siteName: "BabiesNBaba",
        locale: "en_US",
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
    console.error(
      "[generateMetadata] Error fetching product:",
      slug,
      error?.message ?? error,
    );

    // Return sensible fallback — never return null or an empty object,
    // as that wipes all inherited root metadata (including og:image).
    return {
      title: "Products | BabiesNBaba",
      description:
        "Discover a wide range of products at BabiesNBaba — clothes, toys, gift boxes and more.",
      openGraph: {
        type: "website",
        url: `${SITE_URL}/product/${slug}`,
        siteName: "BabiesNBaba",
        images: [
          {
            url: DEFAULT_OG_IMAGE,
            width: 1200,
            height: 630,
            alt: "BabiesNBaba",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: [DEFAULT_OG_IMAGE],
      },
    };
  }
}

const Products = () => (
  <Layout>
    <ProductDetailsPage />
  </Layout>
);

export default Products;
