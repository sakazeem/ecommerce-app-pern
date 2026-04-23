"use client";

import BaseImage from "@/app/components/BaseComponents/BaseImage";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import OrderService from "@/app/services/OrderService";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const OrderDetails = () => {
	const { id } = useParams();
	const router = useRouter();

	const { data: order, isLoading } = useFetchReactQuery(
		() => OrderService.getOrderByTrackingId(id),
		["order-details", id],
	);

	if (isLoading) {
		return <div className="p-10 text-center">Loading order details...</div>;
	}

	if (!order) {
		return <div className="p-10 text-center">Order not found</div>;
	}

	/* -------- GROUP PRODUCTS -------- */
	const productMap = {};

	order.order_items.forEach((item) => {
		const productId = item.product_id;

		if (!productMap[productId]) {
			productMap[productId] = {
				title: item.product_title,
				price: item.price,
				quantity: item.quantity,
				image: item.product?.thumbnail || item.product?.images?.[0] || "",
				sku: item.product.sku,
			};
		} else {
			productMap[productId].quantity += item.quantity;
		}
	});

	const products = Object.values(productMap);

	return (
		<div className="max-w-5xl mx-auto p-6 space-y-6">
			{/* ---------- HEADER ---------- */}
			<div className="flex items-center gap-3">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-1 text-gray-600 hover:text-black">
					<ChevronLeft className="w-5 h-5" />
					Back
				</button>
			</div>

			{/* ---------- ORDER SUMMARY ---------- */}
			<div className="bg-white border rounded-lg p-6 space-y-4">
				<h2 className="h4 text-secondary font-semibold">
					Order #{order.tracking_id}
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p5 text-gray-600">
					<div>
						<p>
							<span className="font-medium">Status:</span>{" "}
							<span className="capitalize">{order.status}</span>
						</p>
						<p>
							<span className="font-medium">Tracking ID:</span>{" "}
							{order.tracking_id}
						</p>
						<p>
							<span className="font-medium">Payment:</span>{" "}
							{order.payment_method.toUpperCase()}
						</p>
					</div>

					<div>
						<p>
							<span className="font-medium">Order Date:</span>{" "}
							{new Date(order.created_at).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "short",
								year: "numeric",
							})}
						</p>
						<p>
							<span className="font-medium">Total:</span> Rs {order.total}
						</p>
					</div>
				</div>
			</div>

			{/* ---------- PRODUCTS ---------- */}
			<div className="bg-white border rounded-lg p-6">
				<h3 className="h4 text-secondary font-semibold mb-4">Items</h3>

				<div className="space-y-4">
					{products.map((product, idx) => (
						<div
							key={idx}
							className="flex items-center gap-4 border-b pb-4 last:border-b-0">
							<BaseImage
								src={
									product.image
										? ENV_VARIABLES.IMAGE_BASE_URL + product.image
										: null
								}
								alt={product.title}
								width={600}
								height={600}
								className="w-20 h-20 object-cover rounded-lg"
							/>

							<div className="flex-1">
								<p className="font-medium capitalize">
									{product.title?.toLowerCase()}
								</p>
								<p className="p5 text-gray-500">SKU: {product.sku}</p>
								<p className="p5 text-gray-500">Qty: {product.quantity}</p>
							</div>

							<div className="font-medium">
								Rs {(Number(product.price) * product.quantity).toFixed(2)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ---------- SHIPPING ---------- */}
			<div className="bg-white border rounded-lg p-6">
				<h3 className="h4 text-secondary font-semibold mb-2">
					Shipping Address
				</h3>

				<p className="p5 text-gray-600">
					{order.shipping_address}, {order.shipping_city},{" "}
					{order.shipping_country}, {order.shipping_postal_code}
				</p>
			</div>

			{/* ---------- BILLING ---------- */}
			<div className="bg-white border rounded-lg p-6">
				<h3 className="h4 text-secondary font-semibold mb-2">
					Billing Summary
				</h3>

				<div className="space-y-2 p5">
					<div className="flex justify-between">
						<span>Subtotal</span>
						<span>Rs {order.order_amount}</span>
					</div>
					<div className="flex justify-between">
						<span>Shipping</span>
						<span>Rs {order.shipping}</span>
					</div>
					<div className="flex justify-between font-semibold">
						<span>Total</span>
						<span>Rs {order.total}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetails;
