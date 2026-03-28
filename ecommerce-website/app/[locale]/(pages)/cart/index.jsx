"use client";

import { Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/app/components/Shared/PrimaryButton";
import { useCartStore } from "@/app/store/cartStore";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { toast } from "react-toastify";
import BasePrice from "@/app/components/BaseComponents/BasePrice";
import BaseImage from "@/app/components/BaseComponents/BaseImage";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect } from "react";

export default function CartPage() {
	const { cart, removeFromCart, addToCart, verifyAndSyncCart } = useCartStore();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		verifyAndSyncCart(isAuthenticated);
	}, []);

	// Update quantity handler
	const updateQuantity = (product, type) => {
		if (type === "increase") {
			addToCart(product, 1, isAuthenticated);
		} else {
			// Decrease only if quantity > 1
			const current = cart.find((item) => item.id === product.id);
			if (current && current.quantity > 1) {
				// Update by setting negative quantity (you can also add a decrease function in your store)
				addToCart(product, -1, isAuthenticated);
			}
		}
	};

	const removeItem = (id) => {
		removeFromCart(id, isAuthenticated);
		toast.success("Item removed from cart");
	};

	const getSubtotal = () =>
		cart.reduce((acc, item) => {
			const discountedPrice =
				(item.selectedVariant?.price || 0) *
				(1 - (item.selectedVariant?.discount_percentage || 0) / 100);
			const price = discountedPrice ?? 0;
			return acc + price * item.quantity;
		}, 0);

	const shipping = 0; // fixed for now — you can replace later
	const subtotal = getSubtotal();
	const total = subtotal + shipping;

	return (
		<section className="max-w-7xl mx-auto px-4 py-10">
			<h1 className="h4 font-semibold mb-6">Shopping Cart</h1>

			{cart.length === 0 ? (
				<div className="text-center py-5 text-muted/">
					<h3 className="h3">Your cart is empty.</h3>
					<PrimaryButton
						className="mt-6 mx-auto bg-primary text-white flex items-center gap-2"
						link={"/"}>
						<ArrowLeft size={18} />
						Continue Shopping
					</PrimaryButton>
				</div>
			) : (
				<div className="grid lg:grid-cols-3 gap-10">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-6">
						{cart.map((item, idx) => {
							const discountedPrice =
								(item.selectedVariant?.price || 0) *
								(1 - (item.selectedVariant?.discount_percentage || 0) / 100);
							const price = discountedPrice ?? 0;
							const subtotal = price * item.quantity;
							return (
								<div
									key={`${item.id}-${idx}`}
									className="flex flex-col sm:flex-row items-center gap-6 max-md:gap-4 border p-4 rounded-lg">
									<BaseImage
										src={
											item?.selectedVariant?.image
												? ENV_VARIABLES.IMAGE_BASE_URL +
													item.selectedVariant.image
												: item.thumbnail
													? ENV_VARIABLES.IMAGE_BASE_URL + item.thumbnail
													: item.images?.[0]
														? ENV_VARIABLES.IMAGE_BASE_URL + item.images?.[0]
														: null
										}
										alt={item.title}
										width={120}
										height={120}
										className="w-32 h-32 rounded-md object-contain"
									/>

									<div className="flex-1 text-center sm:text-left">
										<h5 className="flex-1 h7 font-normal line-clamp-2 capitalize text-heading hover:text-secondary cursor-pointer transition-colors duration-300">
											{item.title}
											<br />
											<span className="text-headingLight">
												{" "}
												{item.selectedVariant?.attributes?.find(
													(attr) => attr.name.toLowerCase() === "size",
												)?.value
													? `Size: (${item.selectedVariant.attributes.find((attr) => attr.name.toLowerCase() === "size").value})`
													: ""}
											</span>
										</h5>
										<p className="p6 text-headingLight font-normal line-clamp-1">
											SKU: {item.sku || "-"}
										</p>
										<h6 className="flex font-normal gap-1 h7">
											{item.selectedVariant?.discount_percentage > 0 && (
												<BasePrice
													className="text-headingLight line-through"
													price={item.selectedVariant?.price || 0}
												/>
											)}
											<BasePrice
												className="text-secondary"
												price={discountedPrice}
											/>
										</h6>
									</div>

									{/* Quantity Controls */}
									<div className="flex items-center gap-3 border rounded-md px-2">
										<button
											onClick={() => updateQuantity(item, "decrease")}
											className="px-2 py-1 p2">
											-
										</button>
										<span className="p4">{item.quantity}</span>
										<button
											onClick={() => updateQuantity(item, "increase")}
											className="px-2 py-1 p2">
											+
										</button>
									</div>

									{/* Subtotal */}
									<BasePrice
										price={subtotal}
										className="w-20 text-right font-semibold"
									/>

									{/* Remove */}
									<button
										onClick={() => removeItem(item)}
										className="text-muted hover:text-red-600 transition">
										<Trash2 size={18} />
									</button>
								</div>
							);
						})}
					</div>

					{/* Summary */}
					<div className="border rounded-lg p-6 h-fit bg-gray-50">
						<h2 className="h4 font-semibold mb-4">Order Summary</h2>

						<div className="flex justify-between mb-2">
							<span>Subtotal</span>
							<BasePrice price={subtotal} />
						</div>
						{/* <div className="flex justify-between mb-2">
							<span>Shipping</span>
							<BasePrice price={shipping} />
						</div> */}

						<hr className="my-3" />

						<div className="flex justify-between h6 font-semibold mb-4">
							<span>Total</span>
							<BasePrice price={total} />
						</div>

						<PrimaryButton
							link={"/checkout"}
							className="w-full bg-primary text-white flex items-center justify-center gap-2">
							{/* className="w-full bg-primary text-light flex items-center justify-center gap-2"> */}
							Proceed to Checkout <ArrowRight size={18} />
						</PrimaryButton>

						<PrimaryButton
							link={"/products"}
							textColor={"text-light"}
							style={{ color: "#fff" }}
							className="w-full mt-3 flex bg-primary text-white items-center justify-center gap-2">
							<ArrowLeft size={18} />
							Continue Shopping
						</PrimaryButton>
					</div>
				</div>
			)}
		</section>
	);
}
