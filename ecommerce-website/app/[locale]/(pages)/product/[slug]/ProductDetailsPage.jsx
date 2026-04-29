"use client";
import BaseImage from "@/app/components/BaseComponents/BaseImage";
import BasePrice from "@/app/components/BaseComponents/BasePrice";
import Loader from "@/app/components/Shared/Loader";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import ProductImageSlider from "@/app/components/Shared/ProductImageSlider";
import Ratings from "@/app/components/Shared/Ratings";
import SocialShare from "@/app/components/Shared/SocialShare";
import ProductsSlider from "@/app/components/Themes/KidsTheme/ProductsSlider";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useAuth } from "@/app/providers/AuthProvider";
import { useStore } from "@/app/providers/StoreProvider";
import ProductServices from "@/app/services/ProductServices";
import { useCartStore } from "@/app/store/cartStore";
import { useAuthUIStore } from "@/app/store/useAuthUIStore";
import { cleanHtmlContent } from "@/app/utils/cleanHtmlContent";
import { trackEvent } from "@/app/utils/trackEvent";
import { Heart, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const cleanKeyFeaturesText = (html) => {
  if (!html) return html;

  // 1️⃣ Remove repeated plain Key Features text
  html = html.replace(/Key Features(\s*Key Features)*/gi, "");

  // 2️⃣ Remove empty strong tags
  html = html.replace(/<strong>\s*<\/strong>/gi, "");

  // 3️⃣ Remove empty paragraphs
  html = html.replace(/<p>\s*<\/p>/gi, "");

  // 4️⃣ If UL exists and no strong Key Features exists → add it
  if (
    html.includes("<ul>") &&
    !html.includes("<strong>Key Features</strong>")
  ) {
    html = html.replace(/<ul>/, "<p><strong>Key Features</strong></p><ul>");
  }

  return html.trim();
};

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const store = useStore();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleFavourite, favourites } = useCartStore();
  const { openCartDrawer } = useAuthUIStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [attributeOptions, setAttributeOptions] = useState({});
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Fetch product
  const { data: product, isLoading } = useFetchReactQuery(
    () => ProductServices.getProductBySlug(store.themeName, slug),
    ["productBySlug", slug],
  );

  // Fetch latest products (optional)
  const { data: latestProducts, isLoading: latestProductsLoading } =
    useFetchReactQuery(
      () => ProductServices.getLatestProducts(store.themeName, 10),
      ["latestProducts"],
    );

  // Build attribute options when product loads
  useEffect(() => {
    if (!product) return;

    const discountedPrice = (
      (product.base_price || product.price) *
      (1 - (product.discount || product.base_discount_percentage) / 100)
    ).toFixed(2);

    trackEvent("PageView", {
      content_ids: [product.id],
      content_name: product.title,
      sku: product.sku,
      value: discountedPrice,
      currency: "PKR",
    });

    const attributeMap = {};
    product.variants?.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        const name = attr.name;
        const value = attr.value;
        if (!attributeMap[name]) attributeMap[name] = new Set();
        attributeMap[name].add(value);
      });
    });

    const options = Object.fromEntries(
      Object.entries(attributeMap).map(([name, values]) => [
        name,
        Array.from(values),
      ]),
    );
    setAttributeOptions(options);

    // Initialize selected attributes (first value as default)
    const defaults = {};
    Object.entries(options).forEach(([name, values]) => {
      defaults[name] = values[0];
    });
    setSelectedAttributes(defaults);
  }, [product]);
  const findSelectedVariant = () => {
    if (!product?.variants || !selectedAttributes) return null;

    return product.variants.find((variant) =>
      variant.attributes?.every(
        (attr) => selectedAttributes[attr.name] === attr.value,
      ),
    );
  };
  useEffect(() => {
    const selectedVariant = findSelectedVariant();
    setSelectedVariant(selectedVariant);
  }, [selectedAttributes]);

  const randomRating = useMemo(() => {
    return Math.floor(Math.random() * 9 + 2) / 2;
  }, [product]);
  const discountedPrice = useMemo(() => {
    if (!product) return null;
    const price =
      selectedVariant?.price ?? (product.base_price || product.price);
    const discount =
      selectedVariant?.discount_percentage ??
      (product.discount || product.base_discount_percentage);
    return (price * (1 - discount / 100)).toFixed(2);
  }, [product, selectedVariant]);

  if (isLoading || latestProductsLoading) return <Loader />;
  if (!product)
    return (
      <h1 className="py-10 text-center text-xl font-medium">
        Product Not Found
      </h1>
    );
  const isOutOfStock =
    product.variants?.filter((v) => v.stock === 0).length ===
    product.variants?.length;

  const handleSelectAttribute = (name, value) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
  };

  // {selectedVariant?.sku || product.sku}

  const handleAddToCart = () => {
    const selectedVariant = findSelectedVariant();

    if (!selectedVariant) {
      toast.error("Selected variant not available");
      return;
    }

    // use this later for stock check
    // if (selectedVariant.stock < quantity) {
    // 	toast.error("Not enough stock available");
    // 	return;
    // }
    // const variantPrice = selectedVariant.price ?? discountedPrice;

    addToCart(
      {
        id: product.id,
        title: product.title,
        sku: selectedVariant.sku || product.sku,
        slug: product.slug,
        thumbnail: product.thumbnail,
        base_price: product.base_price || product.price,
        base_discount_percentage:
          product.discount || product.base_discount_percentage,
        quantity,
        selectedVariant,
      },
      quantity,
      isAuthenticated,
    );
    openCartDrawer();

    // toast.success("Added to cart!");
  };

  const isFavourite = favourites?.some((f) => f.id === product.id);
  const handleFavourite = () => {
    toggleFavourite(product, isAuthenticated);
    toast.success(
      isFavourite ? "Removed from favourites!" : "Added to favourites!",
    );
  };

  return (
    <main>
      <section className="container-layout section-layout grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-10">
        {/* Left Section - Image Slider */}
        <ProductImageSlider
          images={[product.thumbnail, ...product.images]}
          discount={product.discount}
          selectedVariant={selectedVariant}
        />

        {/* Right Section - Product Info */}
        <div className="flex flex-col md:col-span-3">
          <h1 className="h4 capitalize text-title-color font-medium mb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl">
            {product.title?.toLowerCase()}
            {isOutOfStock && (
              <span
                className="
					inline-flex items-center
					px-2.5 pb-0.5 pt-1
					rounded-full
					text-sm font-semibold
					bg-red-50 text-red-600
					border border-red-200
					uppercase tracking-wide
					leading-none ml-4
				"
              >
                Sold Out
              </span>
            )}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Ratings rating={product.avg_rating || randomRating} />
            {product.total_reviews ? (
              <span className="p5 text-muted text-sm sm:text-base">
                ({product.total_reviews} reviews)
              </span>
            ) : null}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {(selectedVariant?.discount_percentage ||
              product.discount ||
              product.base_discount_percentage) > 0 && (
              <BasePrice
                className="text-muted h5 line-through text-sm md:text-base"
                price={
                  selectedVariant?.price || product.base_price || product.price
                }
              />
            )}
            <BasePrice
              className="h3 font-bold text-secondary text-xl md:text-2xl"
              price={discountedPrice}
            />
            {(selectedVariant?.discount_percentage ||
              product.discount ||
              product.base_discount_percentage) > 0 && (
              <p className="p5 konnect-font text-light bg-primary px-2 pt-1 pb-0.5 rounded-sm flex justify-center items-center">
                SAVE{" "}
                {selectedVariant?.discount_percentage ||
                  product.discount ||
                  product.base_discount_percentage}
                %
              </p>
            )}
          </div>

          {/* Description */}
          <p className="leading-relaxed mb-6 pb-6 border-b p4 text-sm md:text-base text-[#999999]">
            {product.excerpt}
          </p>

          {/* Attributes */}
          {Object.entries(attributeOptions).filter(
            ([name, values]) => values.length > 1,
          ).length > 0 && (
            <div className="space-y-4 pb-6">
              {Object.entries(attributeOptions).map(
                ([name, values]) =>
                  values.length > 1 && (
                    <div
                      key={name}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      <span className="font-medium capitalize">
                        Select {name}:
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {values.map((value) => {
                          const matchingVariant = product.variants?.find(
                            (variant) =>
                              variant.attributes?.every((attr) =>
                                attr.name === name
                                  ? attr.value === value
                                  : selectedAttributes[attr.name] ===
                                    attr.value,
                              ),
                          );
                          const isVariantOutOfStock =
                            matchingVariant?.stock === 0;

                          return (
                            <div
                              key={value}
                              className="flex flex-col items-center gap-0.5"
                            >
                              <button
                                onClick={() =>
                                  !isVariantOutOfStock &&
                                  handleSelectAttribute(name, value)
                                }
                                disabled={isVariantOutOfStock}
                                className={`px-3 py-1 border rounded-md capitalize transition
                    ${
                      isVariantOutOfStock
                        ? "opacity-40 cursor-not-allowed line-through border-gray-200 text-gray-400"
                        : selectedAttributes[name] === value
                          ? "bg-light border-primary"
                          : "bg-light text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                              >
                                {value}
                              </button>
                              {isVariantOutOfStock && (
                                <span className="text-[10px] text-red-400">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
              )}
            </div>
          )}

          {/* Quantity & Buttons */}
          <div className="flex items-start gap-3 max-md:gap-1 mb-6 pb-6 border-b">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-6/ p4 text-sm md:text-base">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 border-r text-lg"
                  >
                    -
                  </button>
                  <span className="px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 border-l text-lg disabled:opacity-30 disabled:bg-gray-400"
                    disabled={quantity >= selectedVariant?.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-md font-medium text-gray-700 pt-2">
                Stock left: {selectedVariant?.stock}
              </span>
            </div>

            <PrimaryButton
              className="min-w-40 flex items-center justify-center gap-2 rounded-full bg-transparent border border-primary text-primary"
              onClick={handleAddToCart}
              hoverBgColor={isOutOfStock ? "bg-gray-400" : "bg-primary"}
              isSmall
              disabled={isOutOfStock}
            >
              <ShoppingCartIcon style={{ width: "20px" }} />
              {isOutOfStock ? "Sold Out" : "Add To Cart"}
            </PrimaryButton>

            <button
              title="Add to Favorites"
              onClick={(e) => {
                e.stopPropagation();
                handleFavourite();
              }}
              className="border border-[#999999] text-[#999999] rounded-full p-1 md:p-2 shadow hover:brightness-95 transition"
            >
              <Heart
                className={`size-3.5 md:size-4 ${
                  isFavourite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>

          {product.similarProducts?.length > 0 ? (
            <div className="items-end gap-3 max-md:gap-1 mb-6 pb-6 border-b">
              <div className="flex flex-wrap items-center gap-3 mb-6/ p4 text-sm md:text-base">
                <span className="font-medium mb-3">Choose Style:</span>
              </div>
              <div className="flex gap-4 overflow-x-auto thin-scrollbar pb-2">
                {product.similarProducts?.map((prd, idx) => {
                  return (
                    <Link
                      href={`/product/${prd.slug}`}
                      key={idx}
                      className="flex flex-col items-center gap-2 border hover:border-secondary transition-all rounded-sm min-w-32 max-w-32"
                    >
                      <BaseImage
                        src={
                          prd.thumbnail
                            ? ENV_VARIABLES.IMAGE_BASE_URL + prd.thumbnail
                            : null
                        }
                        alt={prd.title}
                        className="w-full max-h-32 object-cover rounded-t-sm mx-auto border-b"
                      />
                      {/* <h5 className="px-2 flex-1 h7 font-normal line-clamp-3 capitalize text-headingLight hover:text-secondary cursor-pointer transition-colors duration-300">
												{prd.id}
											</h5> */}
                      <h5 className="px-2 flex-1 h7 font-normal line-clamp-3 capitalize text-headingLight hover:text-secondary cursor-pointer transition-colors duration-300">
                        {prd.title.toLowerCase()}
                      </h5>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* SKU & Categories */}
          <div className="mb-4 p4 text-[#999999] space-y-1 text-sm md:text-base">
            <p>
              <span className="font-medium">SKU:</span>{" "}
              {selectedVariant?.sku || product.sku}
            </p>
            {product.categories?.length > 0 && (
              <p className="capitalize">
                <span className="font-medium">Categories:</span>{" "}
                {product.categories?.map((v) => v.title).join(", ")}
              </p>
            )}

            {/* Attributes */}
            {Object.entries(attributeOptions).map(([name, values]) => (
              <div
                key={name}
                className="flex items-center gap-2 flex-wrap capitalize"
              >
                <span className="font-medium ">{name}:</span>
                <span className="">{values?.join(", ")}</span>
              </div>
            ))}
          </div>

          {/* Social Share */}
          <div className="mt-4">
            <SocialShare />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="col-span-1 md:col-span-6 mt-12/ border-t pt-4">
          <div className="flex flex-wrap gap-6 md:gap-8 mb-4 border-b pb-4 md:pb-6 md:justify-start">
            {["description", "reviews"].map((tab) => (
              <button
                key={tab}
                className={`capitalize font-medium text-sm sm:text-base h6 pb-1 ${
                  activeTab === tab
                    ? "border-b-2 border-dark text-dark"
                    : "text-muted"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "description" && product.description && (
            <div
              className="leading-relaxed text-sm md:text-base text-[#999999] product-description prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: cleanKeyFeaturesText(
                  cleanHtmlContent(product.description),
                ),
              }}
            />
          )}

          {activeTab === "reviews" && (
            <div>
              <h3 className="font-semibold mb-3 text-base md:text-lg">
                Customer Reviews
              </h3>
              {product.reviews?.length > 0 ? (
                product.reviews.map((r, i) => (
                  <div key={i} className="border-b py-3">
                    <p className="font-medium">{r.user}</p>
                    <Ratings rating={r.rating} />
                    <p className="text-dark/60 text-sm mt-1">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p>No Reviews Yet</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <section className="container-layout section-layout-bottom">
        <ProductsSlider
          productsData={
            latestProducts?.records?.length > 0
              ? latestProducts.records
              : store.content.allProducts.slice(7, 12)
          }
          isSlider={"onlyMobile"}
          title="Recently Viewed Products"
          columns="grid-cols-5"
        />
      </section>
    </main>
  );
}
