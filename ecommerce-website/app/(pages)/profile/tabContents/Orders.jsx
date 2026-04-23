import BaseImage from "@/app/components/BaseComponents/BaseImage";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import OrderService from "@/app/services/OrderService";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const orderSubmenu = [
	{ id: "all", label: "All orders" },
	{ id: ["pending"], label: "Pending" },
	{ id: ["in_progress"], label: "In Progress" },
	{ id: ["cancelled"], label: "Cancelled" },
	{ id: ["delivered"], label: "Delivered" },
	{
		id: ["return_requested", "returned", "refunded", "exchanged"],
		label: "Returned",
	},
];

const Orders = ({ setSearchQuery, searchQuery }) => {
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [activeOrderFilter, setActiveOrderFilter] = useState("all");

	/* ---------------- NORMALIZE API DATA ---------------- */
	const normalizeOrders = (orders = []) => {
		return orders.map((order) => {
			// Group products
			const productMap = {};

			order.order_items?.forEach((item) => {
				const productId = item.product_id;

				if (!productMap[productId]) {
					productMap[productId] = {
						product_id: productId,
						title: item.product_title,
						quantity: item.quantity,
						image: item.product?.images?.[0] || item.product?.thumbnail || "",
					};
				} else {
					productMap[productId].quantity += item.quantity;
				}
			});

			const products = Object.values(productMap);

			return {
				id: String(order.id),
				status: order.status,
				tracking_id: order.tracking_id,
				trackingId: order.tracking_id,
				courier_tracking_id: order.courier_tracking_id,
				courier_details: order.courier_details,
				date: order.created_at,
				deliveredDate: order.updated_at,
				items: products.reduce((sum, product) => sum + product.quantity, 0),
				products, // 👈 grouped products
				total: order.total,
				payment_method: order.payment_method,
			};
		});
	};

	/* ---------------- FETCH ORDERS ---------------- */
	const { data: myOrders, isLoading } = useFetchReactQuery(
		() => OrderService.myOrders(),
		["myOrders"],
	);

	/* ---------------- APPLY FILTERS ---------------- */
	const applyFilters = (orders) => {
		let filtered = [...orders];

		// Status filter
		if (activeOrderFilter !== "all") {
			filtered = filtered.filter((order) =>
				activeOrderFilter.includes(order.status),
			);
		}

		// Search filter
		if (searchQuery) {
			filtered = filtered.filter(
				(order) =>
					order.id.includes(searchQuery) ||
					order.trackingId.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		setFilteredOrders(filtered);
	};

	/* ---------------- EFFECT ---------------- */
	useEffect(() => {
		if (!myOrders) return;
		const normalized = normalizeOrders(myOrders);
		applyFilters(normalized);
	}, [myOrders, activeOrderFilter, searchQuery]);

	if (isLoading) {
		return (
			<div className="py-10 text-center">
				<SpinLoader />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* ---------------- FILTER TABS ---------------- */}
			<div className="flex flex-wrap gap-4 mb-6 border-b">
				{orderSubmenu.map((filter) => (
					<button
						key={filter.id}
						onClick={() => setActiveOrderFilter(filter.id)}
						className={`pb-3 px-2 font-medium transition-colors ${
							activeOrderFilter === filter.id
								? "text-gray-900 border-b-2 border-secondary"
								: "text-gray-500 hover:text-gray-900"
						}`}>
						{filter.label}
					</button>
				))}
			</div>

			{/* ---------------- SEARCH ---------------- */}
			{/* <div className="relative mb-6">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
				<input
					type="text"
					placeholder="Order ID / Tracking No."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
				/>
			</div> */}

			{/* ---------------- ORDERS LIST ---------------- */}
			{filteredOrders.length === 0 ? (
				<div className="text-center py-12 text-gray-500">No orders found</div>
			) : (
				filteredOrders.map((order) => {
					const orderCourierDetails = order.courier_details
						? JSON.parse(order.courier_details)
						: null;

					return (
						<div
							key={order.id}
							className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
							{/* ---------- HEADER ---------- */}
							<div className="flex justify-between items-start mb-4">
								<div className="flex justify-between items-center flex-wrap gap-3">
									<h2 className="h3 font-semibold text-gray-800">
										Order # {order.tracking_id}
										{orderCourierDetails?.trackingId ? (
											<div className="font-normal text-base flex items-center gap-2">
												Tracking Id #{" "}
												<span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-customGray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-customGray-600">
													{order.trackingId}
												</span>
												<button
													onClick={() => {
														navigator.clipboard.writeText(order.trackingId);
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
										className={`self-start mt-1 px-4 py-1 rounded-full text-sm font-bold uppercase p5 tracking-wide shadow-sm ${
											order.status === "pending"
												? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300"
												: order.status === "in_progress"
													? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
													: order.status === "cancelled"
														? "bg-red-100 text-red-800 ring-1 ring-red-300"
														: order.status === "delivered"
															? "bg-green-100 text-green-800 ring-1 ring-green-300"
															: "bg-orange-400 text-gray-600"
										}`}>
										{order.status?.replace("_", " ")}
									</span>
								</div>

								<button
									className="text-secondary flex items-center gap-1 font-medium"

									// disabled={!order.courier_tracking_id}
								>
									<Link
										href={`/order/${order.trackingId}`}
										className="flex items-center gap-1">
										View order details <ChevronRight className="w-4 h-4" />
									</Link>
								</button>
							</div>

							{/* ---------- PRODUCTS ---------- */}
							<div className="flex gap-6 mb-4 overflow-x-auto pt-6 pb-2">
								{order.products.map((product, idx) => {
									return (
										<div
											key={idx}
											className=" relative w-full max-w-40 flex-shrink-0/ text-center">
											{/* Quantity Badge */}
											{product.quantity > 1 && (
												<span className="absolute -top-2 -right-2 bg-secondary text-white text-xs px-2 py-0.5 rounded-full">
													×{product.quantity}
												</span>
											)}

											<BaseImage
												key={idx}
												src={
													product.image
														? ENV_VARIABLES.IMAGE_BASE_URL + product.image
														: null
												}
												alt={product.title}
												width={600}
												height={600}
												className="w-full mx-auto object-contain rounded-lg mb-2"
											/>

											<p className="p5 capitalize text-gray-500 text-left line-clamp-2">
												{product.title?.toLowerCase()}
											</p>
											<p className="p6 capitalize text-gray-500 text-left line-clamp-2">
												SKU:{product.sku}
											</p>
										</div>
									);
								})}
							</div>

							{/* ---------- IMAGES ---------- */}
							<div className="flex gap-3 mb-4 overflow-x-auto pb-2">
								{order.images?.slice(0, 6).map((img, idx) => (
									<BaseImage
										key={idx}
										src={img ? ENV_VARIABLES.IMAGE_BASE_URL + img : null}
										alt="product"
										width={600}
										height={600}
										className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
									/>
								))}

								{order.images?.length > 6 && (
									<div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
										<ChevronRight className="w-6 h-6 text-gray-400" />
									</div>
								)}
							</div>

							{/* ---------- DETAILS ---------- */}
							<div className="flex flex-wrap justify-between text-sm text-gray-600 mb-4 gap-4">
								<div>{order.items} items</div>

								<div>
									Order Time:{" "}
									{new Date(order.date).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</div>

								{/* <div>Order ID: {order.id}</div> */}
							</div>

							{/* ---------- ACTIONS ---------- */}
							<div className="flex flex-wrap gap-3">
								<button
									className="flex-1 min-w-[150px] bg-secondary disabled:bg-muted text-white py-3 rounded-lg font-medium"
									// disabled
									disabled={!orderCourierDetails?.trackingId}>
									{orderCourierDetails?.trackingId ? (
										<Link
											// href={`https://cclpak.com/tracking?trackingno=${orderCourierDetails.trackingId}`}
											// target="_blank"
											href={`/order-tracking?id=${order.trackingId}`}
											className="">
											Track
										</Link>
									) : (
										<p>Track</p>
									)}
								</button>

								<button className="flex-1 min-w-[150px] border py-3 rounded-lg font-medium">
									<Link
										href={`/orders/${order.trackingId}/review`}
										className="">
										{/* Track */}
										Leave a review
									</Link>
								</button>

								{[
									"delivered",
									"return_requested",
									"returned",
									"refunded",
									"exchanged",
								].includes(order.status) && (
									<button className="flex-1 min-w-[150px] bg-primary text-light border py-3 rounded-lg font-medium">
										<Link href={`/order/${order.id}/return`} className="">
											Return / Refund
										</Link>
									</button>
								)}
								{/* {[
								// "delivered",
								"return_requested",
								"returned",
								"refunded",
								"exchanged",
							].includes(order.status) && (
								<button className="flex-1 min-w-[150px] bg-primary text-light border py-3 rounded-lg font-medium">
									Cancel return request
								</button>
							)} */}

								{/* <button className="flex-1 min-w-[150px] border py-3 rounded-lg font-medium">
								Buy this again
							</button> */}
							</div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default Orders;
