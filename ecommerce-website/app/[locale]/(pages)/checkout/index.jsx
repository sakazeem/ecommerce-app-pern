"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/app/store/cartStore";
import BasePrice from "@/app/components/BaseComponents/BasePrice";
import PrimaryButton from "@/app/components/Shared/PrimaryButton";
import BaseImage from "@/app/components/BaseComponents/BaseImage";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { toast } from "react-toastify";
import OrderService from "@/app/services/OrderService";
import ThankYouScreen from "./ThankYouScreen";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import { trackEvent } from "@/app/utils/trackEvent";
import Link from "next/link";
import { triggerAuthDrawer } from "@/app/store/authEvents";
import { useAuth } from "@/app/providers/AuthProvider";

export default function CheckoutPage() {
	const {
		cart,
		clearCart,
		verifyAndSyncCart,
		cartLoading,
		addToCartLoading,
		syncLoading,
		verifyLoading,
	} = useCartStore();
	const [loading, setLoading] = useState(false);
	const [ibftReceipt, setIbftReceipt] = useState(null);
	const { isAuthenticated, user } = useAuth();
	useEffect(() => {
		verifyAndSyncCart(isAuthenticated);
	}, []);
	const paymentMethods = [
		{
			id: "cod",
			label: "Cash on Delivery (COD)",
			description: "Pay Cash On Delivery",
			disabled: false,
		},
		{
			id: "ibft",
			label: "IBFT (Inter Bank Funds Transfer)",
			disabled: false,
			description: (
				<div className="text-sm text-gray-600 space-y-1">
					<p>
						<strong>Bank Name:</strong> Meezan Bank
					</p>
					<p>
						<strong>Title of Account:</strong> B.BABIES N BABA
					</p>
					<p>
						<strong>Branch:</strong> Meezan Bank- Godhra Camp Branch
					</p>
					<p>
						<strong>Account Number:</strong> 99990113990738
					</p>
					<p>
						<strong>IBAN:</strong> PK70MEZN0099990113990738
					</p>
					<div className="mt-4 pt-4 border-t border-gray-200">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Payment Receipt <span className="text-red-500">*</span>
						</label>
						<input
							type="file"
							accept="image/*,.pdf"
							onChange={(e) => setIbftReceipt(e.target.files[0] || null)}
							className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-2 cursor-pointer file:mr-3 file:py-1 file:px-3 file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary"
						/>
						{ibftReceipt && (
							<p className="text-xs text-green-600 mt-1">
								✓ {ibftReceipt.name}
							</p>
						)}
						<p className="text-xs text-gray-400 mt-1">
							Accepted: JPG, PNG, PDF (max 10 MB)
						</p>
					</div>
				</div>
			),
		},
		{
			id: "payfast",
			label: "PAYFAST (Pay via Debit/Credit/Wallet/Bank Account)",
			disabled: true,
			comingSoon: true,
		},
		// {
		// 	id: "jazzcash",
		// 	label: "Jazz Cash / EasyPaisa",
		// 	disabled: false,
		// },
	];

	const [voucher, setVoucher] = useState("");
	const [orderSuccess, setOrderSuccess] = useState(false);
	const [orderSummary, setOrderSummary] = useState(null);

	const savedAddress = useMemo(() => {
		if (!user?.addresses?.length) return null;

		const shipping =
			user.addresses.find((a) => a.type === "shipping" && a.is_default) ||
			user.addresses.find((a) => a.type === "shipping") ||
			user.addresses[0];

		const billing =
			user.addresses.find((a) => a.type === "billing" && a.is_default) ||
			user.addresses.find((a) => a.type === "billing");

		return { shipping, billing };
	}, [user?.addresses]);
	const [formData, setFormData] = useState({
		email: user?.email || "",
		name: user?.name || "",
		phone: user?.phone || "",
		city: "Karachi",
		address: "",
		postalCode: "",
		country: "Pakistan",
		paymentMethod: "cod",
		billingSameAsShipping: true,
	});
	const [billingAddress, setBillingAddress] = useState({
		country: "Pakistan",
		name: user?.name || "",
		address: "",
		city: "Karachi",
		postalCode: "",
		phone: user?.phone || "",
	});

	useEffect(() => {
		if (user) {
			setFormData((prev) => ({
				...prev,
				email: user.email || "",
				name: user.name || "",
				phone: user.phone || "",
			}));

			setBillingAddress((prev) => ({
				...prev,
				name: user.name || "",
				phone: user.phone || "",
			}));
		}
	}, [user]);

	useEffect(() => {
		if (!savedAddress?.shipping) return;

		setFormData((prev) => ({
			...prev,
			address: savedAddress.shipping?.address || "",
			city: savedAddress.shipping?.city || "Karachi",
			postalCode: savedAddress.shipping?.postal_code || "",
			country: savedAddress.shipping?.country || "Pakistan",
		}));

		if (savedAddress?.billing) {
			setBillingAddress((prev) => ({
				...prev,
				address: savedAddress.billing?.address || "",
				city: savedAddress.billing?.city || "Karachi",
				postalCode: savedAddress.billing?.postal_code || "",
				country: savedAddress.billing?.country || "Pakistan",
			}));
		}
	}, [savedAddress]);

	// ------------------ CALCULATIONS ------------------
	const subtotal = cart.reduce((acc, item) => {
		const price =
			(item.selectedVariant?.price || 0) *
			(1 - (item.selectedVariant?.discount_percentage || 0) / 100);

		return acc + price * item.quantity;
	}, 0);

	const [shipping, setShipping] = useState(
		subtotal > 0 ? (subtotal > 3000 ? 0 : 150) : 0,
	);

	const discount = voucher ? 0 : 0; // extend later
	const total = subtotal + shipping - discount;

	useEffect(() => {
		trackEvent("InitiateCheckout", {
			value: total,
			shipping: shipping,
			currency: "PKR",
			contents: cart.map((item) => ({
				id: item.id,
				title: item.title,
				sku: item.sku,
				quantity: item.quantity,
				price: item.selectedVariant?.price || 0,
			})),
			items: cart.map((item) => ({
				item_id: item.id,
				item_name: item.title,
				sku: item.sku,
				quantity: item.quantity,
				price: item.selectedVariant?.price || 0,
			})),
		});
	}, []);

	// ------------------ HANDLERS ------------------
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "city") {
			const normalizedCity = value
				.trim()
				.toLowerCase()
				.replace(/[^a-z\s]/g, ""); // remove commas, dashes, etc.

			const isKarachi =
				normalizedCity.includes("karachi") || normalizedCity === "khi";
			setShipping(subtotal > 3000 ? 0 : isKarachi ? 150 : 200);
		}
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!cart.length) {
			toast.error("Your cart is empty");
			return;
		}

		if (formData.paymentMethod === "ibft" && !ibftReceipt) {
			toast.error(
				"Please upload your payment receipt to complete the IBFT order.",
			);
			return;
		}

		if (!validatePhone(formData.phone)) {
			toast.error(
				"Phone number must be between 10 to 15 digits and may start with +",
			);
			return;
		}

		if (
			!formData.billingSameAsShipping &&
			billingAddress.phone &&
			!validatePhone(billingAddress.phone)
		) {
			toast.error(
				"Billing phone number must be between 10 to 15 digits and may start with +",
			);
			return;
		}
		if (formData.paymentMethod === "ibft" && !ibftReceipt) {
			toast.error(
				"Please upload your payment receipt to complete the IBFT order.",
			);
			return;
		}

		setLoading(true);

		const orderPayload = {
			customer: formData,
			billingAddress: formData.billingSameAsShipping ? null : billingAddress,
			items: cart.map((item) => {
				const unitPrice =
					(item.selectedVariant?.price || 0) *
					(1 - (item.selectedVariant?.discount_percentage || 0) / 100);

				return {
					...item,
					unitPrice,
					finalPrice: Number((unitPrice * item.quantity).toFixed(2)),
				};
			}),
			summary: {
				subtotal,
				shipping,
				total,
			},
		};

		const fd = new FormData();
		fd.append("order", JSON.stringify(orderPayload));
		if (ibftReceipt) {
			fd.append("receipt", ibftReceipt);
		}

		await OrderService.confirmOrder(fd)
			.then((res) => {
				// ✅ Success UI state
				setOrderSummary({
					...orderPayload,
					paymentMethod: formData.paymentMethod,
					orderId: res?.order?.tracking_id || Date.now(), // fallback safe ID
				});

				setOrderSuccess(true);
				clearCart(isAuthenticated);
				setIbftReceipt(null);

				toast.success("Order placed successfully!");

				setFormData({
					email: "",
					name: "",
					// lastName: "",
					address: "",
					city: "Karachi",
					postalCode: "",
					country: "Pakistan",
					phone: "",
					paymentMethod: "cod",
					billingSameAsShipping: true,
				});
				setBillingAddress({
					country: "Pakistan",
					name: "",
					// firstName: "",
					// lastName: "",
					address: "",
					city: "Karachi",
					postalCode: "",
					phone: "",
				});
			})
			.catch((err) => {
				toast.error("Something went wrong while placing the order.");
				console.error("ORDER ERROR", err);
			})
			.finally(() => {
				setLoading(false);
			});

		trackEvent("Purchase", {
			value: orderPayload.summary.total,
			currency: "PKR",
			content_ids: orderPayload.items.map((i) => i.id),
			contents: orderPayload.items.map((i) => ({
				id: i.id,
				title: i.title,
				sku: i.sku,
				quantity: i.quantity,
				price: i.selectedVariant?.price || 0,
			})),
			items: orderPayload.items.map((i) => ({
				item_id: i.id,
				item_name: i.title,
				quantity: i.quantity,
				price: i.selectedVariant?.price || 0,
			})),
		});

		if (formData.paymentMethod !== "cod") {
			trackEvent("AddPaymentInfo", {
				value: orderPayload.summary.total,
				currency: "PKR",
			});
		}
	};
	const paymentLabelMap = {
		cod: "Cash on Delivery (COD)",
		ibft: "IBFT (Inter Bank Funds Transfer)",
	};
	// ------------------ UI ------------------

	return (
		<div className="relative">
			{loading ? (
				<div className="absolute inset-0 bg-gray-100 opacity-75 flex py-50 items-center justify-center">
					<SpinLoader />
				</div>
			) : null}
			<section
				className={`max-w-7xl mx-auto px-4 py-10  ${loading ? "opacity-50 pointer-events-none" : ""}`}>
				{orderSuccess ? (
					<ThankYouScreen
						order={orderSummary}
						paymentLabelMap={paymentLabelMap}
					/>
				) : (
					<form
						onSubmit={handleSubmit}
						className="grid grid-cols-1 lg:grid-cols-12 gap-10">
						{/* LEFT */}
						<div className="lg:col-span-7 space-y-8">
							{/* Contact */}
							<section>
								<div className="flex justify-between items-center">
									<h2 className="text-lg font-semibold mb-3">Contact</h2>
									{!isAuthenticated && (
										<button
											type="button"
											onClick={() => {
												triggerAuthDrawer();
											}}
											className="text-primary p4 mb-3 underline cursor-pointer">
											Sign in
										</button>
									)}
								</div>
								<input
									type="email"
									name="email"
									placeholder="Email"
									className="w-full border rounded-md p-3"
									required
									value={formData.email}
									onChange={handleChange}
								/>
							</section>

							{/* Delivery */}
							<section>
								<h2 className="text-lg font-semibold mb-3">Delivery</h2>

								<select
									name="country"
									className="w-full border rounded-md p-3 mb-4"
									value={formData.country}
									onChange={handleChange}>
									<option>Pakistan</option>
								</select>

								<div className="grid grid-cols-1 gap-4 mb-4">
									<input
										name="name"
										placeholder="Name"
										className="border rounded-md p-3"
										required
										value={formData.name}
										onChange={handleChange}
									/>
									{/* <input
						name="lastName"
						placeholder="Last name"
						className="border rounded-md p-3"
						required
						value={formData.lastName}
						onChange={handleChange}
					/> */}
								</div>

								<input
									name="address"
									placeholder="Address"
									className="w-full border rounded-md p-3 mb-4"
									required
									value={formData.address}
									onChange={handleChange}
								/>

								<div className="grid grid-cols-2 gap-4 mb-4">
									<input
										name="city"
										placeholder="City"
										className="border rounded-md p-3"
										required
										value={formData.city}
										onChange={handleChange}
									/>
									<input
										name="postalCode"
										placeholder="Postal code"
										className="border rounded-md p-3"
										value={formData.postalCode}
										onChange={handleChange}
									/>
								</div>

								<input
									name="phone"
									placeholder="Phone"
									// placeholder="+00000000000"
									className="w-full border rounded-md p-3"
									required
									value={formData.phone}
									onChange={(e) => {
										const value = e.target.value;

										// Allow only digits and optional + at start
										if (/^\+?\d*$/.test(value)) {
											setFormData((prev) => ({
												...prev,
												phone: value,
											}));
										}
									}}
								/>
							</section>

							{/* Shipping */}
							{/* <section>
						<h2 className="text-lg font-semibold mb-3">Shipping method</h2>
						<label className="flex items-center justify-between border rounded-md p-4 cursor-pointer">
							<div className="flex items-center gap-2">
								<input type="radio" checked readOnly />
								<span>Standard</span>
							</div>
							<span>Rs 200</span>
						</label>
					</section> */}

							{/* Payment */}
							<section>
								<h2 className="text-lg font-semibold mb-3">Payment</h2>
								<p className="text-sm text-gray-500 mb-4">
									All transactions are secure and encrypted.
								</p>

								{paymentMethods.map((method, idx) => {
									const isSelected = formData.paymentMethod === method.id;

									return (
										<label
											key={`payment-method-${idx}`}
											className={`block border rounded-md mb-3 cursor-pointer transition-all
          ${isSelected ? "border-secondary bg-secondary/10" : "border-gray-300"}
          ${method.disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}>
											{/* Radio Row */}
											<div className="flex items-center gap-3 p-4">
												<input
													type="radio"
													name="paymentMethod"
													value={method.id}
													disabled={method.disabled}
													checked={isSelected}
													onChange={handleChange}
													// className="accent-secondary"
												/>

												<span className="font-medium">{method.label}</span>

												{method.comingSoon && (
													<span className="ml-auto text-xs text-gray-500">
														Coming Soon
													</span>
												)}
											</div>

											{/* Animated Details */}
											<div
												className={`overflow-hidden transition-all duration-300 ease-in-out rounded-b-md
            ${
							isSelected && method.description
								? "max-h-96 opacity-100"
								: "max-h-0 opacity-0"
						}
          `}>
												<div className="border-t bg-light text-gray-600 px-4 py-3">
													{method.description}
												</div>
											</div>
										</label>
									);
								})}
							</section>

							{/* Billing Address */}
							<section>
								<h2 className="text-lg font-semibold mb-3">Billing address</h2>

								<div className="border rounded-md overflow-hidden">
									{/* Same as shipping */}
									<label
										className={`flex items-center gap-3 p-4 border-b cursor-pointer ${
											formData.billingSameAsShipping
												? "bg-secondary/10 border-secondary"
												: ""
										}`}>
										<input
											type="radio"
											name="billingSameAsShipping"
											checked={formData.billingSameAsShipping}
											onChange={() =>
												setFormData({
													...formData,
													billingSameAsShipping: true,
												})
											}
										/>
										Same as shipping address
									</label>

									{/* Different billing */}
									<label
										className={`flex items-center gap-3 p-4 border-t cursor-pointer ${
											!formData.billingSameAsShipping
												? "bg-secondary/10 border-secondary"
												: ""
										}`}>
										<input
											type="radio"
											name="billingSameAsShipping"
											checked={!formData.billingSameAsShipping}
											onChange={() =>
												setFormData({
													...formData,
													billingSameAsShipping: false,
												})
											}
										/>
										Use a different billing address
									</label>

									{/* Billing Form */}
									{!formData.billingSameAsShipping && (
										<div className="p-4 space-y-4 border-t bg-white">
											<select
												className="w-full border rounded-md p-3"
												value={billingAddress.country}
												onChange={(e) =>
													setBillingAddress({
														...billingAddress,
														country: e.target.value,
													})
												}>
												<option>Pakistan</option>
											</select>

											<div className="grid grid-cols-1 gap-4">
												<input
													placeholder="Name"
													className="border rounded-md p-3"
													value={billingAddress.name}
													onChange={(e) =>
														setBillingAddress({
															...billingAddress,
															name: e.target.value,
														})
													}
												/>
												{/* <input
							placeholder="Last name"
							className="border rounded-md p-3"
							value={billingAddress.lastName}
							onChange={(e) =>
								setBillingAddress({
									...billingAddress,
									lastName: e.target.value,
								})
							}
						/> */}
											</div>

											<input
												placeholder="Address"
												className="border rounded-md p-3 w-full"
												value={billingAddress.address}
												onChange={(e) =>
													setBillingAddress({
														...billingAddress,
														address: e.target.value,
													})
												}
											/>

											{/* <input
							placeholder="Apartment, suite, etc. (optional)"
							className="border rounded-md p-3 w-full"
							value={billingAddress.apartment}
							onChange={(e) =>
								setBillingAddress({
									...billingAddress,
									apartment: e.target.value,
								})
							}
						/> */}

											<div className="grid grid-cols-2 gap-4">
												<input
													placeholder="City"
													className="border rounded-md p-3"
													value={billingAddress.city}
													onChange={(e) =>
														setBillingAddress({
															...billingAddress,
															city: e.target.value,
														})
													}
												/>
												<input
													placeholder="Postal code (optional)"
													className="border rounded-md p-3"
													value={billingAddress.postalCode}
													onChange={(e) =>
														setBillingAddress({
															...billingAddress,
															postalCode: e.target.value,
														})
													}
												/>
											</div>

											<input
												placeholder="Phone (optional)"
												className="border rounded-md p-3 w-full"
												value={billingAddress.phone}
												onChange={(e) =>
													setBillingAddress({
														...billingAddress,
														phone: e.target.value,
													})
												}
											/>
										</div>
									)}
								</div>
							</section>

							<PrimaryButton type="submit" className="w-full">
								Complete order
							</PrimaryButton>
						</div>

						{/* RIGHT */}
						{cartLoading || addToCartLoading || syncLoading || verifyLoading ? (
							<div className="lg:col-span-5 bg-gray-50 p-6 rounded-lg self-start">
								<SpinLoader />
							</div>
						) : (
							<div className="lg:col-span-5 bg-gray-50 p-6 rounded-lg self-start">
								{/* Cart */}
								<div className="space-y-4 mb-6">
									{cart.map((item, idx) => {
										return (
											<div key={`item-${idx}`} className="flex gap-4">
												<div className="relative">
													<BaseImage
														src={
															item?.selectedVariant?.image
																? ENV_VARIABLES.IMAGE_BASE_URL +
																	item.selectedVariant.image
																: item.thumbnail
																	? ENV_VARIABLES.IMAGE_BASE_URL +
																		item.thumbnail
																	: item.images?.[0]
																		? ENV_VARIABLES.IMAGE_BASE_URL +
																			item.images?.[0]
																		: null
														}
														width={64}
														height={64}
														className="rounded-xl shadow-md w-20 h-20 object-contain border"
													/>
													<p className="p6 text-light px-2 py-0.5 flex justify-center items-center rounded-sm absolute -top-2 -right-2 bg-dark">
														{item.quantity}
													</p>
												</div>

												<div className="flex-1">
													<p className="p4 font-bold capitalize">
														{item.title?.toLowerCase()}
													</p>
													<p className="p5 text-gray-500">
														Sku: {item.sku || "-"}
													</p>
													<p className="p5 text-gray-500">
														Qty: {item.quantity}
													</p>
												</div>
												<BasePrice
													price={(
														(item.selectedVariant?.price || 0) *
														(1 -
															(item.selectedVariant?.discount_percentage || 0) /
																100) *
														item.quantity
													).toFixed(2)}
												/>
											</div>
										);
									})}
								</div>

								{/* Voucher */}
								{/* <div className="flex gap-2 mb-6">
						<input
							placeholder="Discount code"
							className="border rounded-md p-2 flex-1"
							value={voucher}
							onChange={(e) => setVoucher(e.target.value)}
						/>
						<button type="button" className="border rounded-md px-4 text-sm">
							Apply
						</button>
					</div> */}

								{/* Totals */}
								<div className="space-y-2 p4">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<BasePrice price={subtotal} />
									</div>
									<div className="flex justify-between">
										<span>Shipping</span>
										<BasePrice price={shipping} />
									</div>
									<hr />
									<h4 className="flex justify-between font-medium h5">
										<span>Total</span>
										<BasePrice price={total} />
									</h4>
								</div>
							</div>
						)}
					</form>
				)}
			</section>
		</div>
	);
}
