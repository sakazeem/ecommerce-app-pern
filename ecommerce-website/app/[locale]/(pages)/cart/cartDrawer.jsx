"use client";

import BaseDrawer from "@/app/components/BaseComponents/BaseDrawer";
import BaseImage from "@/app/components/BaseComponents/BaseImage";
import BasePrice from "@/app/components/BaseComponents/BasePrice";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore } from "@/app/store/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartDrawer({ open, setOpen }) {
	const { cart, addToCart, removeFromCart, verifyAndSyncCart } = useCartStore();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (open) {
			verifyAndSyncCart(isAuthenticated);
		}
	}, [open]);
	const updateQty = (item, type) => {
		if (type === "inc") addToCart(item, 1, isAuthenticated);
		if (type === "dec" && item.quantity > 1)
			addToCart(item, -1, isAuthenticated);
	};

	const subtotal = cart.reduce((acc, item) => {
		const discountedPrice =
			(item.selectedVariant?.price || 0) *
			(1 - (item.selectedVariant?.discount_percentage || 0) / 100);

		return acc + discountedPrice * item.quantity;
	}, 0);

	const router = useRouter();

	const onClose = () => {
		setOpen(false);
	};
	if (!open) return null;
	return (
		<BaseDrawer
			open={open}
			onClose={onClose}
			title={`Shopping Cart (${cart.length})`}
			side="right"
			width="w-full sm:w-[420px]">
			{/* Content */}
			<div className="flex flex-col h-full">
				{/* Cart Items */}
				<div className="flex-1 overflow-y-auto space-y-5 pr-1">
					{cart.length === 0 ? (
						<p className="text-center text-muted mt-10">Your cart is empty</p>
					) : (
						cart.map((item, idx) => {
							const discountedPrice =
								(item.selectedVariant?.price || 0) *
								(1 - (item.selectedVariant?.discount_percentage || 0) / 100);
							return (
								<div
									key={`${item.id}-${idx}`}
									className="flex items-center gap-4 border-b pb-4">
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
										width={64}
										height={64}
										className="w-20 h-20 rounded object-contain"
									/>

									<div className="flex-1">
										<p className="p5 font-medium line-clamp-1  capitalize">
											{item.title?.toLowerCase()}
										</p>

										<p className="p6 text-headingLight font-normal line-clamp-1">
											SKU: {item.sku || "-"}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<BasePrice
												price={discountedPrice}
												className="text-secondary"
											/>
											{item.selectedVariant?.discount_percentage > 0 && (
												<BasePrice
													price={item.selectedVariant?.price || 0}
													className="text-muted line-through p5"
												/>
											)}
										</div>

										{/* Quantity */}
										<div className="flex items-center gap-2 mt-2">
											<button
												onClick={() => updateQty(item, "dec")}
												className="w-7 h-7 flex items-center justify-center border rounded">
												<Minus size={14} />
											</button>
											<span className="p4">{item.quantity}</span>
											<button
												onClick={() => updateQty(item, "inc")}
												className="w-7 h-7 flex items-center justify-center border rounded">
												<Plus size={14} />
											</button>
										</div>
									</div>

									<button
										onClick={() => removeFromCart(item, isAuthenticated)}
										className="text-muted hover:text-red-500">
										<Trash2 size={16} />
									</button>
								</div>
							);
						})
					)}
				</div>

				{/* Footer */}
				<div className="border-t pt-4 mt-4 space-y-3">
					<div className="flex justify-between h6 font-semibold">
						<span>Subtotal</span>
						<BasePrice price={subtotal} />
					</div>

					{/* <PrimaryButton link="/checkout" className="w-full" onClick={onClose}>
						Checkout
					</PrimaryButton> */}
					<CheckoutButton onClose={onClose} />

					<PrimaryButton
						// link="/cart"
						className="w-full bg-primary text-white"
						onClick={() => {
							router.push("/cart");
							onClose();
						}}>
						View Cart
					</PrimaryButton>
				</div>
			</div>
		</BaseDrawer>
	);
}

const CheckoutButton = ({ onClose }) => {
	const router = useRouter();
	const pathname = usePathname();

	const handleCheckout = () => {
		onClose?.(); // close drawer first

		if (pathname === "/checkout") {
			// Reload current page
			window.location.reload();
		} else {
			router.push("/checkout");
		}
	};

	return (
		<PrimaryButton className="w-full" onClick={handleCheckout}>
			Checkout
		</PrimaryButton>
	);
};
