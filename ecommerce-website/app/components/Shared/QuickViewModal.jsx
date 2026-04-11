"use client";

import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useStore } from "@/app/providers/StoreProvider";
import ProductServices from "@/app/services/ProductServices";
import { useCartStore } from "@/app/store/cartStore";
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Heart, ShoppingCartIcon, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import BasePrice from "../BaseComponents/BasePrice";
import PrimaryButton from "./PrimaryButton";
import ProductImageSliderWithoutThumbnails from "./ProductImageSliderWithoutThumbnails";
import SocialShare from "./SocialShare";
import SpinLoader from "./SpinLoader";
import { useAuthUIStore } from "@/app/store/useAuthUIStore";
import { trackEvent } from "@/app/utils/trackEvent";
import { useAuth } from "@/app/providers/AuthProvider";

export default function QuickViewModal({ isOpen, onClose, slug }) {
	const [quantity, setQuantity] = useState(1);
	const [selectedAttributes, setSelectedAttributes] = useState({});
	const [attributeOptions, setAttributeOptions] = useState({});
	const store = useStore();
	const { isAuthenticated } = useAuth();
	const { addToCart, toggleFavourite, favourites } = useCartStore();
	const { openCartDrawer } = useAuthUIStore();
	const [selectedVariant, setSelectedVariant] = useState(null);

	// Fetch product
	const { data: product, isLoading } = useFetchReactQuery(
		() => ProductServices.getProductBySlug(store.themeName, slug),
		["productDetails", slug],
		{ enabled: isOpen },
	);
	const discountedPrice = useMemo(() => {
		if (!product) return null;
		const price =
			selectedVariant?.price ?? (product.base_price || product.price);
		const discount =
			selectedVariant?.discount_percentage ??
			(product.discount || product.base_discount_percentage);
		return (price * (1 - discount / 100)).toFixed(2);
	}, [product, selectedVariant]);
	// Build attribute options when product loads
	useEffect(() => {
		if (!product) return;
		// const discountedPrice = (
		// 	(product.base_price || product.price) *
		// 	(1 - (product.discount || product.base_discount_percentage) / 100)
		// ).toFixed(2);

		trackEvent("ViewContent", {
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

		// Set defaults (first value)
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

	if (!isOpen || !product) return null;

	const isOutOfStock =
		product.variants?.filter((v) => v.stock === 0).length ===
		product.variants?.length;

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
				// sku: product.sku,
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

	const handleSelectAttribute = (name, value) => {
		setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
				{/* Backdrop */}
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0">
					<div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
				</TransitionChild>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex items-center justify-center p-4 max-md:p-2 h-full">
						<TransitionChild
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95">
							<DialogPanel className="w-full max-w-4xl  rounded-2xl overflow-hidden inline-block md:p-10 max-md:px-2 max-md:py-2">
								{isLoading ? (
									<SpinLoader />
								) : !product ? (
									<h3 className="py-10 text-center h3">Product Not Found</h3>
								) : (
									<section className="w-full rounded-2xl bg-white shadow-xl relative">
										<button
											onClick={onClose}
											aria-label="Close modal"
											className="md:hidden absolute -right-3 -top-3 max-md:-right-1.5 max-md:-top-1.5 z-[9999] rounded-full p-1.5 max-md:p-1 bg-secondary text-light transition hover:brightness-90 shadow-lg">
											<X className="h-4 w-4 max-md:h-3 max-md:w-3" />
										</button>
										<section className="md:flex flex-col md:flex-row w-full items-start relative rounded-2xl max-md:overflow-y-auto custom-scrollbar/ max-md:max-h-[calc(100vh-100px)]">
											<button
												onClick={onClose}
												aria-label="Close modal"
												className="max-md:hidden absolute -right-3 -top-3 z-[9999] rounded-full p-1.5 bg-secondary text-light transition hover:brightness-90 shadow-lg">
												<X className="h-4 w-4" />
											</button>
											{/* Left Section - Image Slider */}
											<ProductImageSliderWithoutThumbnails
												images={[product.thumbnail, ...product.images]}
												discount={product.discount}
												selectedVariant={selectedVariant}
											/>

											{/* Right Section - Product Info */}
											<div className="max-md:mt-4 px-4 pt-2 flex flex-col md:overflow-y-auto md:h-[calc(100%-32px)] max-md:h-full md:w-1/2 md:absolute top-5 right-0">
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
				">
															Out of Stock
														</span>
													)}
												</h1>

												{/* Price */}
												<div className="flex items-center gap-3 mb-3 flex-wrap">
													{(selectedVariant?.discount_percentage ||
														product.discount ||
														product.base_discount_percentage) > 0 && (
														<BasePrice
															className="text-muted h5 line-through text-sm md:text-base"
															price={
																selectedVariant?.price ||
																product.base_price ||
																product.price
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
												<p className="leading-relaxed mb-4 pb-4 border-b p4 text-sm md:text-base text-[#999999]">
													{product.excerpt || product.description}
												</p>

												{/* Attributes */}
												{Object.entries(attributeOptions).filter(
													([name, values]) => values.length > 1,
												).length > 0 && (
													<div className="space-y-4 pb-4">
														{Object.entries(attributeOptions).map(
															([name, values]) =>
																values.length > 1 && (
																	<div
																		key={name}
																		className="flex items-center gap-2 flex-wrap">
																		<span className="font-medium capitalize">
																			Select {name}:
																		</span>
																		<div className="flex gap-2 flex-wrap">
																			{values.map((value) => (
																				<button
																					key={value}
																					onClick={() =>
																						handleSelectAttribute(name, value)
																					}
																					className={`px-3 py-1 border rounded-md capitalize transition
                          							${
																					selectedAttributes[name] === value
																						? "bg-light border-primary"
																						: "bg-light text-gray-700 border-gray-300 hover:bg-gray-100"
																				}`}>
																					{value}
																				</button>
																			))}
																		</div>
																	</div>
																),
														)}
													</div>
												)}

												{/* Quantity & Buttons */}
												<div className="flex items-end gap-3 max-md:gap-1 mb-4 pb-4 border-b">
													<div className="flex flex-wrap items-center gap-3 mb-4/ p4 text-sm md:text-base">
														<span className="font-medium">Quantity:</span>
														<div className="flex items-center border rounded-md">
															<button
																onClick={() =>
																	setQuantity((q) => Math.max(1, q - 1))
																}
																className="px-3 py-1 border-r text-lg">
																-
															</button>
															<span className="px-4">{quantity}</span>
															<button
																onClick={() => setQuantity((q) => q + 1)}
																className="px-3 py-1 border-l text-lg">
																+
															</button>
														</div>
													</div>
													<PrimaryButton
														className="min-w-40 flex items-center justify-center gap-2 rounded-full bg-transparent border border-primary text-primary"
														onClick={handleAddToCart}
														isSmall
														disabled={isOutOfStock}>
														<ShoppingCartIcon
															className="cursor-pointer hover:text-primary transition"
															style={{ width: "20px" }}
														/>
														{isOutOfStock ? "Out of Stock" : "Add To Cart"}
													</PrimaryButton>
													<button
														title="Add to Favorites"
														onClick={(e) => {
															e.stopPropagation();
															handleFavourite();
														}}
														className="border border-[#999999] text-[#999999] rounded-full p-1 md:p-2 shadow hover:brightness-95 transition">
														<Heart
															className={`size-3.5 md:size-4 ${isFavourite ? "fill-red-500 text-red-500" : ""}`}
														/>
													</button>
												</div>

												{/* SKU and Categories */}
												<div className="mb-4 p4 text-[#999999] space-y-1 text-sm md:text-base">
													<p>
														<span className="font-medium">SKU:</span>{" "}
														{selectedVariant?.sku || product.sku}
													</p>
													{/* Attributes */}
													{Object.entries(attributeOptions).map(
														([name, values]) => (
															<div
																key={name}
																className="flex items-center gap-2 flex-wrap capitalize">
																<span className="font-medium ">{name}:</span>
																<span className="">{values?.join(", ")}</span>
															</div>
														),
													)}
												</div>

												{/* Social Share */}
												<div>
													<SocialShare />
												</div>
											</div>
										</section>
									</section>
								)}
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
