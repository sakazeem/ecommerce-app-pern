"use client";

import { ENV_VARIABLES } from "@/app/constants/env_variables";
import useWindowSize from "@/app/hooks/useWindowSize";
import { useCartStore } from "@/app/store/cartStore";
import { Eye, Heart, Repeat, ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import BaseImage from "../../BaseComponents/BaseImage";
import BasePrice from "../../BaseComponents/BasePrice";
import Overlay from "../../Shared/Overlay";
import PrimaryButton from "../../Shared/PrimaryButton";
import Ratings from "../../Shared/Ratings";
import QuickViewModal from "../../Shared/QuickViewModal";
import { useAuthUIStore } from "@/app/store/useAuthUIStore";
import { useAuth } from "@/app/providers/AuthProvider";
import { useScrollRestoration } from "@/app/hooks/useScrollRestoration";

const MOBILE_NAV_DELAY = 500; // ms
const LONG_PRESS_DURATION = 1; // ms

const ProductCard = ({ product }) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const windowSize = useWindowSize();
  const isMobile = windowSize?.width < 768;
  const [isHoverActive, setIsHoverActive] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const navTimer = useRef(null);
  const router = useRouter();
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [attributeOptions, setAttributeOptions] = useState({});
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleFavourite, favourites } = useCartStore();
  const { openCartDrawer } = useAuthUIStore();
  const { saveTargetProduct } = useScrollRestoration();
  const [imageLoaded, setImageLoaded] = useState(false);

  const randomRating = useMemo(() => {
    return Math.floor(Math.random() * 9 + 2) / 2;
  }, [product]);

  const isFavourite = favourites?.some((f) => f.id === product.id);

  const discountedPrice = (
    (product.base_price || product.price) *
    (1 - (product.base_discount_percentage || 0) / 100)
  ).toFixed(2);

  const thumbnailImage = product.thumbnail
    ? ENV_VARIABLES.IMAGE_BASE_URL + product.thumbnail
    : product.image || null;

  const hoverImage =
    product.images?.length > 1
      ? ENV_VARIABLES.IMAGE_BASE_URL + product.images[1]
      : product.thumbnail
        ? ENV_VARIABLES.IMAGE_BASE_URL + product.thumbnail
        : product.image || null;

  const navigateToProduct = () => {
    saveTargetProduct(product.id); // 👈 save before navigating
    router.push(`/product/${product.slug || product.id}`);
  };

  const startPress = () => {
    if (!isMobile) return;
    longPressTriggered.current = false;
    pressTimer.current = setTimeout(() => {
      setIsLongPressed(true);
      longPressTriggered.current = true;
    }, LONG_PRESS_DURATION);
  };

  const endPress = () => {
    if (!isMobile) return;
    clearTimeout(pressTimer.current);
    setTimeout(() => setIsLongPressed(false), 1500);
  };

  const handleClick = () => {
    if (isMobile) {
      setIsHoverActive(true);
      navigateToProduct();
      // navTimer.current = setTimeout(navigateToProduct, 400);
    } else {
      navigateToProduct();
    }
  };

  const findSelectedVariant = () => {
    if (!product?.variants || !selectedAttributes) return null;
    return product.variants.find((variant) =>
      variant.attributes?.every(
        (attr) => selectedAttributes[attr.name] === attr.value,
      ),
    );
  };

  const handleAddToCart = () => {
    const selectedVariant = findSelectedVariant();
    if (!selectedVariant) {
      toast.error("Selected variant not available");
      return;
    }
    addToCart(
      {
        id: product.id,
        title: product.title,
        sku: product.sku,
        slug: product.slug,
        thumbnail: product.thumbnail,
        base_price: product.base_price || product.price,
        base_discount_percentage:
          product.discount || product.base_discount_percentage,
        quantity: 1,
        selectedVariant,
      },
      1,
      isAuthenticated,
    );
    openCartDrawer();
  };

  const handleFavourite = () => {
    toggleFavourite(product, isAuthenticated);
    toast.success(
      isFavourite ? "Removed from favourites!" : "Added to favourites!",
    );
  };

  useEffect(() => {
    if (!product) return;
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
    const defaults = {};
    Object.entries(options).forEach(([name, values]) => {
      defaults[name] = values[0];
    });
    setSelectedAttributes(defaults);
  }, [product]);

  const isOutOfStock =
    product.variants?.filter((v) => v.stock === 0).length ===
    product.variants?.length;

  if (!product) return null;

  return (
    <>
      <div
        data-product-id={product.id} // 👈 used by scrollToProduct
        className="
				relative w-full h-full overflow-hidden
				rounded-md border border-gray-200 bg-light
				shadow-sm hover:shadow-md transition-all duration-300
				flex flex-col hover:border hover:border-secondary active:border-2 active:border-secondary
				"
      >
        {/* Product Image */}
        <div
          className="
					group relative w-full aspect-square overflow-hidden cursor-pointer
					select-none [-webkit-tap-highlight-color:transparent] 
				"
          onClick={handleClick}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          onTouchCancel={endPress}
        >
          <BaseImage
            src={thumbnailImage}
            alt={product.title}
            width={600}
            height={600}
            onLoad={() => setImageLoaded(true)}
            className={`
    absolute inset-0 w-full h-full object-cover rounded-t-md
    transition-opacity duration-700 ease-in-out
    ${imageLoaded ? "opacity-100" : "opacity-0"}
    ${isLongPressed ? "opacity-0" : ""}
    md:group-hover:opacity-0
  `}
          />

          <BaseImage
            src={hoverImage}
            alt={product.title}
            width={600}
            height={600}
            className={`
    absolute inset-0 w-full h-full object-cover rounded-t-md
    transition-all duration-700 ease-in-out transform
    ${isLongPressed ? "opacity-100 scale-110" : "opacity-0 scale-100"}
    md:group-hover:opacity-100 md:group-hover:scale-110
  `}
          />

          <img
            src="/bnb-logo-loader.gif"
            alt="loading"
            className={`
            absolute inset-0 m-auto
            w-16 h-16
            object-contain
            transition-opacity duration-500 ease-in-out
            ${imageLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}
          `}
          />
          {/* Overlay (desktop only, does not block hover) */}
          {/* <div
					className={`
						absolute inset-0 transition-opacity duration-300
						${
							isLongPressed
								? "opacity-100 pointer-events-auto"
								: "opacity-0 pointer-events-none"
						}
						md:group-hover:opacity-100 md:group-hover:pointer-events-auto
					`}>
					<Overlay />
				</div> */}

          {/* Action buttons */}
          {/* <div className="flex flex-col gap-1 md:gap-2 absolute top-2 right-2 md:top-3 md:right-3"> */}
          <div
            className="
			absolute top-2 right-2 md:top-3 md:right-3
			flex flex-col gap-1 md:gap-2
			opacity-0 translate-y-2 scale-95 pointer-events-none
			transition-all duration-300 ease-out
			group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto
			max-md:opacity-100 max-md:pointer-events-auto max-md:translate-y-0 max-md:scale-100
		"
          >
            <button
              title="Add to Favorites"
              onClick={(e) => {
                e.stopPropagation();
                handleFavourite();
              }}
              className="bg-light rounded-full p-1 md:p-2 shadow hover:brightness-95 transition"
            >
              <Heart
                className={`size-3.5 md:size-4 ${
                  isFavourite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>

            <button
              title="Compare"
              onClick={(e) => e.stopPropagation()}
              className="bg-light rounded-full p-1 md:p-2 shadow hover:brightness-95 transition"
            >
              <Repeat className="size-3.5 md:size-4" />
            </button>
            <button
              title="Quick View"
              onClick={(e) => {
                e.stopPropagation();
                setViewModalOpen(true);
              }}
              className="bg-light rounded-full p-1 md:p-2 shadow hover:brightness-95 transition"
            >
              <Eye className="size-3.5 md:size-4" />
            </button>
          </div>
          {/* Discount Badge */}
          {product.base_discount_percentage > 0 && (
            <div
              className="
						absolute top-2 left-2 md:top-3 md:left-3
						z-20 rounded-full bg-secondary
						py-2 px-3 max-md:pt-2.5 max-md:pb-1.5 max-md:px-2
						p7 font-normal konnect-font text-white
						shadow-md select-none text-center
						flex flex-col justify-center items-center
						max-md:leading-none!
					"
            >
              <p>{product.base_discount_percentage}%</p>
              <p className="max-md:leading-2.5!">OFF</p>
            </div>
          )}
          {isOutOfStock && (
            <div
              className="
					absolute top-12 left-2 md:top-16 md:left-3
						z-20 rounded-full bg-gray-400
						py-2 px-3 max-md:pt-2.5 max-md:pb-1.5 max-md:px-1.5
						p7 text-sm font-normal konnect-font text-white
						shadow-md select-none
						w-9 md:w-12 h-9 md:h-12
						text-center flex flex-col justify-center items-center
						max-md:leading-none!
		"
            >
              Sold out
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-3 max-md:gap-1 px-4 py-3 border-t border-gray-100 max-md:px-2 max-md:py-2">
          <h5
            onClick={navigateToProduct}
            className="flex-1 h7 font-normal line-clamp-1 capitalize text-headingLight hover:text-secondary cursor-pointer transition-colors duration-300"
          >
            {product.title.toLowerCase()}
          </h5>

          <h6 className="flex font-normal gap-1 h7">
            {product.base_discount_percentage > 0 && (
              <BasePrice
                className="text-muted line-through"
                price={product.base_price}
              />
            )}
            <BasePrice className="text-secondary" price={discountedPrice} />
          </h6>

          <Ratings rating={product.avg_rating || randomRating} />

          <div className="flex flex-col gap-0.5">
            <PrimaryButton
              isSmall
              disabled={isOutOfStock}
              onClick={() => {
                handleAddToCart();
              }}
              className="w-full mt-4 flex items-center justify-between gap-2 bg-transparent border-primary hover:border-secondary text-primary border"
              justifyContent="justify-between"
              hoverBgColor={isOutOfStock ? "bg-gray-400" : "bg-secondary"}
              borderColor="bg-secondary"
            >
              {isOutOfStock ? "Sold Out" : "Add To Cart"}
              <ShoppingCartIcon
                style={{
                  width: "20px",
                }}
              />
            </PrimaryButton>
          </div>
        </div>
      </div>
      <QuickViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        slug={product.slug}
      />
    </>
  );
};

export default ProductCard;
