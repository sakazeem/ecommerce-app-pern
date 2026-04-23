"use client";

import SpinLoader from "@/app/components/Shared/SpinLoader";
import OrderService from "@/app/services/OrderService";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function TrackOrderPage() {
	const searchParams = useSearchParams();
	const paramsTrackingId = searchParams.get("id");
	const [trackingId, setTrackingId] = useState(paramsTrackingId || "");
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [courierTrackingStatus, setCourierTrackingStatus] = useState(null);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		// setLoading(true);
		setError("");
		setOrder(null);
		if (window.location.href.includes(`id=${trackingId}`)) {
			fetchOrder();
		} else {
			router.push(`/order-tracking?id=${trackingId}`);
		}
	};

	const fetchOrder = async () => {
		setLoading(true);
		setError("");
		setOrder(null);

		await OrderService.trackOrder(paramsTrackingId)
			.then((res) => {
				setCourierTrackingStatus(res.order.trackingStatus || null);
				setOrder(res.order);
			})
			.catch((err) => {
				setError(err.message || "Failed to fetch order");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (paramsTrackingId) {
			fetchOrder();
		}
	}, [paramsTrackingId]);

	return (
		<div className="md:!max-w-4xl container-layout mx-auto section-layout">
			<h1 className="h1 font-bold text-secondary mb-6 text-center">
				Track Your Order
			</h1>

			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className="flex flex-col md:flex-row gap-3 mb-8 justify-center items-center relative">
				<input
					type="text"
					placeholder="ORD-1775391111174-00"
					value={trackingId}
					onChange={(e) => setTrackingId(e.target.value)}
					className="w-full border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					required
				/>
				<button
					type="submit"
					className="absolute top-0.25 right-0.25 bg-primary text-light px-6 py-3 rounded-r-lg hover:brightness-90 transition duration-300 font-medium shadow-md">
					{loading ? "Checking..." : "Track Order"}
				</button>
			</form>

			{/* Error */}
			{/* {error && (
				<p className="text-center text-red-400 font-semibold mb-4">{error}</p>
			)} */}

			{/* Order Details */}
			{!paramsTrackingId ? null : loading ? (
				<>
					<SpinLoader />
				</>
			) : !order ? (
				<h4 className="text-center h4 text-red-400">Order not found</h4>
			) : (
				<>
					{courierTrackingStatus && (
						<div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 p4 space-y-6 mb-6">
							<div className="flex items-center justify-between">
								<h3 className="text-base font-semibold text-gray-800">
									Shipment Tracking
								</h3>
								{order.tracking_id && (
									<span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
										Order # {order.tracking_id}
									</span>
								)}
							</div>
							<div className="flex flex-col">
								{courierTrackingStatus
									.sort((a, b) => new Date(b.createdon) - new Date(a.createdon))
									.map((item, index) => {
										const isDelivered = item.status
											.toLowerCase()
											.includes("delivered");
										const isLast = index === courierTrackingStatus.length - 1;

										return (
											<div key={index} className="flex gap-4">
												{/* Icon + connector line */}
												<div className="flex flex-col items-center flex-shrink-0 w-8">
													{isDelivered ? (
														<div className="w-8 h-8 rounded-full bg-green-50 border-2 border-green-600 flex items-center justify-center z-10 flex-shrink-0">
															<svg
																width="14"
																height="14"
																viewBox="0 0 24 24"
																fill="none"
																stroke="#3B6D11"
																strokeWidth="2.5"
																strokeLinecap="round"
																strokeLinejoin="round">
																<polyline points="20 6 9 17 4 12" />
															</svg>
														</div>
													) : (
														<div className="w-3 h-3 my-2.5 rounded-full bg-white border-2 border-gray-300 z-10 flex-shrink-0" />
													)}
													{!isLast && (
														<div
															className={`w-0.5 flex-1 min-h-[20px] ${isDelivered ? "bg-green-200" : "bg-gray-200"}`}
														/>
													)}
												</div>

												{/* Content */}
												<div
													className={`pb-5 ${isLast ? "pb-0" : ""} ${isDelivered ? "pt-1" : "pt-1.5"}`}>
													<p
														className={`text-sm m-0 ${isDelivered ? "font-medium text-green-700" : "text-gray-800"}`}>
														{item.status}
													</p>
													<p className="text-xs text-gray-400 mt-1 m-0">
														{item.createdon}
													</p>
												</div>
											</div>
										);
									})}
							</div>
						</div>
					)}

					<div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 p4 space-y-6">
						<div className="flex justify-between items-center flex-wrap gap-3">
							<h2 className="h3 font-semibold text-gray-800">
								Order # {order.tracking_id}
								{order.courier_tracking_id ? (
									<div className="font-normal text-base flex items-center gap-2">
										Tracking Id #{" "}
										<span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-customGray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-customGray-600">
											{order.courier_tracking_id}
										</span>
										<button
											onClick={() => {
												navigator.clipboard.writeText(
													order.courier_tracking_id,
												);
												toast.success("Tracking ID copied to clipboard");
											}}
											className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
											title="Copy to clipboard">
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
												/>
											</svg>
										</button>
									</div>
								) : null}
							</h2>
							<span
								className={`px-4 py-1 rounded-full text-sm font-bold uppercase p4 tracking-wide shadow-sm ${
									order.status === "pending"
										? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300"
										: order.status === "in_progress"
											? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
											: order.status === "cancelled"
												? "bg-red-100 text-red-800 ring-1 ring-red-300"
												: order.status === "delivered"
													? "bg-green-100 text-green-800 ring-1 ring-green-300"
													: "bg-gray-100 text-gray-800"
								}`}>
								{order.status}
							</span>
						</div>

						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<p>
									<strong>Payment Method:</strong> {order.payment_method}
								</p>
								<p>
									<strong>Order Amount:</strong> Rs {order.order_amount}
								</p>
								<p>
									<strong>Shipping:</strong> Rs {order.shipping}
								</p>
								<p className="text-lg font-semibold">
									<strong>Total Amount:</strong> Rs {order.total}
								</p>
							</div>

							{/* Addresses */}
							<div className="space-y-4">
								<div>
									<strong className="block mb-1 text-gray-700">
										Shipping Address:
									</strong>
									<p>
										{order.shipping_address}
										{order.shipping_apartment &&
											`, ${order.shipping_apartment}`}
									</p>
									<p>
										{order.shipping_city}, {order.shipping_country}{" "}
										{order.shipping_postal_code}
									</p>
								</div>

								<div>
									<strong className="block mb-1 text-gray-700">
										Billing Address:
									</strong>
									<p>
										{order.billing_address}
										{order.billing_apartment && `, ${order.billing_apartment}`}
									</p>
									<p>
										{order.billing_city}, {order.billing_country}{" "}
										{order.billing_postal_code}
									</p>
								</div>
							</div>
						</div>

						{/* Order Items */}
						<div>
							<strong className="block mb-2 text-gray-700">Items:</strong>
							<ul className="divide-y divide-gray-200 border-t border-b">
								{order.order_items.map((item, idx) => (
									<li
										key={`${item.productId}-${idx}`}
										className="py-3 flex justify-between items-center">
										<span>
											{item.product_title} x {item.quantity}
										</span>
										<span className="font-semibold">Rs {item.price}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
