import { useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";

//internal import
import OrderServices from "@/services/OrderServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import DrawerHeader from "../newComponents/DrawerHeader";

const OrderDetailsDrawer = ({ id, data }) => {
	const [orderDetails, setOrderDetails] = useState({});
	const [loading, setLoading] = useState(true);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [showStatusDropdown, setShowStatusDropdown] = useState(false);
	const [courierTrackingId, setCourierTrackingId] = useState("");
	const [isEditingTracking, setIsEditingTracking] = useState(false);
	const [isSavingTracking, setIsSavingTracking] = useState(false);

	const orderStatuses = ["pending", "in_progress", "cancelled", "delivered"];

	const getOrderDetails = async () => {
		if (!id) return;
		try {
			setLoading(true);
			const res = await OrderServices.getOrderById(id);
			if (res) {
				setOrderDetails(res);
				setCourierTrackingId(res.courier_tracking_id || "");
			}
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getOrderDetails();
	}, [id]);

	const handleStatusUpdate = async (newStatus) => {
		try {
			setIsUpdatingStatus(true);
			setShowStatusDropdown(false);

			// Call your API to update the status
			await OrderServices.updateOrderStatus(id, { status: newStatus });

			// Update local state
			setOrderDetails((prev) => ({ ...prev, status: newStatus }));

			notifySuccess(`Order status updated to ${newStatus}`);
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const handleSaveCourierTracking = async () => {
		try {
			setIsSavingTracking(true);

			// Call your API to update the courier tracking ID
			await OrderServices.updateOrder(id, {
				courier_tracking_id: courierTrackingId,
			});

			// Update local state
			setOrderDetails((prev) => ({
				...prev,
				courier_tracking_id: courierTrackingId,
			}));
			setIsEditingTracking(false);

			notifySuccess("Courier tracking ID updated successfully");
		} catch (err) {
			notifyError(err ? err.response?.data?.message : err.message);
		} finally {
			setIsSavingTracking(false);
		}
	};

	const handleCancelTrackingEdit = () => {
		setCourierTrackingId(orderDetails.courier_tracking_id || "");
		setIsEditingTracking(false);
	};

	const getStatusBadge = (status) => {
		const statusConfig = {
			pending: {
				bg: "bg-amber-50 dark:bg-amber-900/20",
				text: "text-amber-700 dark:text-amber-400",
				border: "border-amber-200 dark:border-amber-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			in_progress: {
				bg: "bg-blue-50 dark:bg-blue-900/20",
				text: "text-blue-700 dark:text-blue-400",
				border: "border-blue-200 dark:border-blue-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			cancelled: {
				bg: "bg-red-50 dark:bg-red-900/20",
				text: "text-red-700 dark:text-red-400",
				border: "border-red-200 dark:border-red-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
				),
			},
			delivered: {
				bg: "bg-emerald-50 dark:bg-emerald-900/20",
				text: "text-emerald-700 dark:text-emerald-400",
				border: "border-emerald-200 dark:border-emerald-800",
				icon: (
					<svg
						className="w-3 h-3 mr-1.5"
						fill="currentColor"
						viewBox="0 0 20 20">
						<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
						<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
					</svg>
				),
			},
		};

		const config = statusConfig[status] || statusConfig.pending;

		return (
			<span
				className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border ${config.bg} ${config.text} ${config.border}`}>
				{config.icon}
				{status}
			</span>
		);
	};

	if (loading) {
		return (
			<>
				<DrawerHeader id={id} updateTitle={"Order Details"} />
				<div className="flex items-center justify-center h-96">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
				</div>
			</>
		);
	}

	return (
		<>
			<DrawerHeader id={id} updateTitle={"Order Details"} />

			<Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-customGray-700 dark:text-customGray-200">
				<div className="p-6 space-y-6">
					{/* Order Header */}
					<div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-customGray-800 dark:to-customGray-750 rounded-xl p-5 border border-gray-200 dark:border-customGray-600">
						<div className="flex items-center justify-between mb-3">
							<div>
								<h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
									Order #{orderDetails.tracking_id}
								</h2>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									Placed on{" "}
									{new Date(orderDetails.created_at).toLocaleDateString(
										"en-US",
										{
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										},
									)}
								</p>
							</div>

							{/* Status Update Dropdown */}
							<div className="relative">
								<button
									onClick={() => setShowStatusDropdown(!showStatusDropdown)}
									disabled={isUpdatingStatus}
									className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
									{getStatusBadge(orderDetails.status)}
									<svg
										className={`w-4 h-4 text-gray-500 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{/* Dropdown Menu */}
								{showStatusDropdown && (
									<div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-customGray-800 border border-gray-200 dark:border-customGray-600 z-50">
										<div className="py-1">
											<div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-customGray-600">
												Update Status
											</div>
											{orderStatuses.map((status) => (
												<button
													key={status}
													onClick={() => handleStatusUpdate(status)}
													disabled={status === orderDetails.status}
													className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between
														${
															status === orderDetails.status
																? "bg-gray-100 dark:bg-customGray-700 cursor-not-allowed"
																: "hover:bg-gray-50 dark:hover:bg-customGray-750 cursor-pointer"
														}
													`}>
													<span className="capitalize font-medium">
														{status}
													</span>
													{status === orderDetails.status && (
														<svg
															className="w-4 h-4 text-green-600 dark:text-green-400"
															fill="currentColor"
															viewBox="0 0 20 20">
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													)}
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Close dropdown when clicking outside */}
						{showStatusDropdown && (
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowStatusDropdown(false)}
							/>
						)}
					</div>

					{/* Courier Tracking ID Section */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center">
								<div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
									<svg
										className="w-5 h-5 text-orange-600 dark:text-orange-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
										/>
									</svg>
								</div>
								<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
									Courier Tracking
								</h3>
							</div>

							{!isEditingTracking && (
								<button
									onClick={() => setIsEditingTracking(true)}
									className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									{courierTrackingId ? "Edit" : "Add"}
								</button>
							)}
						</div>

						<div className="pl-13">
							{!isEditingTracking ? (
								<div>
									{courierTrackingId ? (
										<div className="flex items-center gap-2">
											<span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-customGray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-customGray-600">
												{courierTrackingId}
											</span>
											<button
												onClick={() => {
													navigator.clipboard.writeText(courierTrackingId);
													notifySuccess("Tracking ID copied to clipboard");
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
									) : (
										<p className="text-sm text-gray-500 dark:text-gray-400 italic">
											No tracking ID added yet
										</p>
									)}
								</div>
							) : (
								<div className="space-y-3">
									<input
										type="text"
										value={courierTrackingId}
										onChange={(e) => setCourierTrackingId(e.target.value)}
										placeholder="Enter courier tracking ID"
										className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-customGray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-customGray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
									/>
									<div className="flex gap-2">
										<button
											onClick={handleSaveCourierTracking}
											disabled={isSavingTracking || !courierTrackingId.trim()}
											className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
											{isSavingTracking ? (
												<>
													<svg
														className="animate-spin h-4 w-4"
														fill="none"
														viewBox="0 0 24 24">
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													Saving...
												</>
											) : (
												<>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
													Save
												</>
											)}
										</button>
										<button
											onClick={handleCancelTrackingEdit}
											disabled={isSavingTracking}
											className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-customGray-700 dark:hover:bg-customGray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Customer Information */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-blue-600 dark:text-blue-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Customer Information
							</h3>
						</div>

						<div className="space-y-3 pl-13">
							<div className="flex items-start">
								<span className="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
									Name
								</span>
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{orderDetails.guest_first_name
										? `${orderDetails.guest_first_name} ${orderDetails.guest_last_name || ""}`
										: orderDetails.user?.name || "-"}
								</span>
							</div>
							<div className="flex items-start">
								<span className="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
									Email
								</span>
								<span className="text-sm text-gray-700 dark:text-gray-300">
									{orderDetails.user?.email || orderDetails.guest_email || "-"}
								</span>
							</div>
							<div className="flex items-start">
								<span className="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
									Phone
								</span>
								<span className="text-sm text-gray-700 dark:text-gray-300">
									{orderDetails.user?.phone || orderDetails.guest_phone || "-"}
								</span>
							</div>
						</div>
					</div>

					{/* Shipping Address */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-green-600 dark:text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Shipping Address
							</h3>
						</div>

						<div className="pl-13">
							<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
								{orderDetails.shipping_apartment &&
									`${orderDetails.shipping_apartment}, `}
								{orderDetails.shipping_address}
								<br />
								{orderDetails.shipping_city},{" "}
								{orderDetails.shipping_postal_code}
								<br />
								{orderDetails.shipping_country}
							</p>
						</div>
					</div>

					{/* Order Items */}
					<div className="bg-white dark:bg-customGray-800 rounded-xl border border-gray-200 dark:border-customGray-600 shadow-sm overflow-hidden">
						<div className="flex items-center px-5 py-4 bg-gray-50 dark:bg-customGray-750 border-b border-gray-200 dark:border-customGray-600">
							<div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-purple-600 dark:text-purple-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Order Items ({orderDetails.order_items?.length || 0})
							</h3>
						</div>

						<div className="divide-y divide-gray-200 dark:divide-customGray-600">
							{orderDetails.order_items?.map((item) => (
								<div
									key={item.id}
									className="p-5 hover:bg-gray-50 dark:hover:bg-customGray-750 transition-colors">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
												{item.product_title}
											</h4>
											<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
												SKU: {item.product?.sku}
											</h4>

											{/* Product Attributes */}
											{item.product_variant?.attributes &&
												item.product_variant.attributes.length > 0 && (
													<div className="flex flex-wrap gap-2 mb-2">
														{item.product_variant.attributes.map((attr) => (
															<span
																key={attr.id}
																className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-customGray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-customGray-600">
																<span className="capitalize">
																	{attr.name.en}:
																</span>
																<span className="ml-1 capitalize">
																	{attr.pva.value.en}
																</span>
															</span>
														))}
													</div>
												)}

											<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
												<span className="flex items-center">
													<span className="font-medium mr-1">Qty:</span>{" "}
													{item.quantity}
												</span>
												<span className="flex items-center">
													<span className="font-medium mr-1">Price:</span> Rs.{" "}
													{parseFloat(item.price / item.quantity).toFixed(2)}
												</span>
											</div>
										</div>

										<div className="ml-4 text-right">
											<p className="text-base font-bold text-gray-900 dark:text-gray-100">
												Rs. {parseFloat(item.price).toFixed(2)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Payment Summary */}
					<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-customGray-800 dark:to-customGray-750 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							</div>
							<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
								Payment Summary
							</h3>
						</div>

						<div className="space-y-3 pl-13">
							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-600 dark:text-gray-400">
									Subtotal
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-100">
									Rs. {parseFloat(orderDetails.order_amount).toFixed(2)}
								</span>
							</div>

							<div className="flex justify-between items-center text-sm">
								<span className="text-gray-600 dark:text-gray-400">
									Shipping Fee
								</span>
								<span className="font-medium text-gray-900 dark:text-gray-100">
									Rs. {parseFloat(orderDetails.shipping).toFixed(2)}
								</span>
							</div>

							<div className="border-t border-gray-300 dark:border-customGray-600 pt-3 mt-3">
								<div className="flex justify-between items-center">
									<span className="text-base font-bold text-gray-900 dark:text-gray-100">
										Total Amount
									</span>
									<span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
										Rs. {parseFloat(orderDetails.total).toFixed(2)}
									</span>
								</div>
							</div>

							<div className="pt-3 mt-3 border-t border-gray-300 dark:border-customGray-600">
								<div className="flex items-center justify-between">
									<span className="text-xs text-gray-500 dark:text-gray-400">
										Payment Method
									</span>
									<span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase bg-gray-200 dark:bg-customGray-700 text-gray-700 dark:text-gray-300">
										{orderDetails.payment_method === "cod"
											? "Cash on Delivery"
											: orderDetails.payment_method}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Scrollbars>
		</>
	);
};

export default OrderDetailsDrawer;
