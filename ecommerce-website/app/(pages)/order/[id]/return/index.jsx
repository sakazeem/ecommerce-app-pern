"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ReturnedService from "@/app/services/ReturnedService";
import { toast } from "react-toastify";

const ReturnRequestPage = ({ params }) => {
	const router = useRouter();
	const { id: orderId } = useParams();

	const [items, setItems] = useState([]);
	const [selectedItemId, setSelectedItemId] = useState(null);
	const [quantity, setQuantity] = useState(1);
	const [type, setType] = useState("refund");
	const [reason, setReason] = useState("");
	const [customerNote, setCustomerNote] = useState("");
	const [video, setVideo] = useState(null);
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [touched, setTouched] = useState({});
	const [validationErrors, setValidationErrors] = useState({});

	// Fetch eligible items
	useEffect(() => {
		ReturnedService.getReturnEligibleItems(orderId)
			.then((res) => setItems(res.order_items ?? []))
			.catch((err) =>
				setError(err.response?.data?.message || "Failed to load items"),
			);
	}, [orderId]);

	// Validation rules
	const validateField = (name, value) => {
		switch (name) {
			case "selectedItemId":
				return !value ? "Please select an item to return" : "";
			case "quantity":
				const selectedItem = items.find((i) => i.id === selectedItemId);
				const maxQty = selectedItem?.quantity || 1;
				if (!value || value < 1) return "Quantity must be at least 1";
				if (value > maxQty) return `Maximum quantity available: ${maxQty}`;
				return "";
			case "reason":
				if (!value || value.trim().length === 0)
					return "Please provide a reason for return";
				if (value.trim().length < 10)
					return "Reason must be at least 10 characters";
				if (value.trim().length > 500)
					return "Reason must be less than 500 characters";
				return "";
			case "customerNote":
				if (value && value.length > 300)
					return "Note must be less than 300 characters";
				return "";
			case "video":
				if (!value) return "Video is required";
				const videoSize = value.size / 1024 / 1024; // Convert to MB
				if (videoSize > 50) return "Video size must be less than 50MB";
				return "";
			case "images":
				if (value.length > 5) return "Maximum 5 images allowed";
				for (let img of value) {
					const imgSize = img.size / 1024 / 1024;
					if (imgSize > 5) return "Each image must be less than 5MB";
				}
				return "";
			default:
				return "";
		}
	};

	// Validate all fields
	const validateForm = () => {
		const errors = {
			selectedItemId: validateField("selectedItemId", selectedItemId),
			quantity: validateField("quantity", quantity),
			reason: validateField("reason", reason),
			customerNote: validateField("customerNote", customerNote),
			video: validateField("video", video),
			images: validateField("images", images),
		};

		setValidationErrors(errors);
		return !Object.values(errors).some((error) => error !== "");
	};

	// Handle field blur
	const handleBlur = (fieldName) => {
		setTouched({ ...touched, [fieldName]: true });
		const error = validateField(
			fieldName,
			fieldName === "selectedItemId"
				? selectedItemId
				: fieldName === "quantity"
					? quantity
					: fieldName === "reason"
						? reason
						: fieldName === "customerNote"
							? customerNote
							: fieldName === "video"
								? video
								: images,
		);
		setValidationErrors({ ...validationErrors, [fieldName]: error });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Mark all fields as touched
		setTouched({
			selectedItemId: true,
			quantity: true,
			reason: true,
			customerNote: true,
			video: true,
			images: true,
		});

		if (!validateForm()) {
			toast.error("Please fix all validation errors");
			return;
		}

		setLoading(true);
		setError("");

		// try {
		const formData = new FormData();
		formData.append("order_id", orderId);
		formData.append("order_item_id", selectedItemId.toString());
		formData.append("quantity", quantity.toString());
		formData.append("type", type);
		formData.append("reason", reason);
		formData.append("customer_note", customerNote);

		if (video) formData.append("video", video);
		images.forEach((img) => formData.append("images", img));

		await ReturnedService.requestReturn(formData)
			.then((res) => {
				toast.success("Return request submitted successfully!");
				// setTimeout(() => {
				// 	if (window?.history?.length > 1) {
				// 		router.back();
				// 	} else {
				// 		router.push("/");
				// 	}
				// }, 300);
			})
			.catch((err) => {
				setError(err?.message || "Failed to submit return");
				toast.error(err?.message || "Failed to submit return request");
			})
			.finally(() => {
				setLoading(false);
			});

		// router.push("/orders");
		// } catch (err) {
		// 	setError(err.response?.data?.message || "Failed to submit return");
		// 	toast.error("Failed to submit return request");
		// } finally {
		// 	setLoading(false);
		// }
	};

	const selectedItem = items.find((i) => i.id === selectedItemId);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/10 to-secondary/10 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto section-layout">
				{/* Header Section */}
				<div className="text-center mb-8 max-md:mb-4 animate-fadeIn">
					{/* <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-4 shadow-lg">
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
							/>
						</svg>
					</div> */}
					<h1 className="h2 font-bold bg-secondary bg-clip-text text-transparent mb-2">
						Return Request
					</h1>
					{/* <p className="text-slate-600 text-lg">
						We're here to help with your return or exchange
					</p> */}
				</div>

				{/* Main Form Card */}
				<div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-sm border border-primary/20 animate-slideUp">
					{error && (
						<div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
							<div className="flex items-center">
								<svg
									className="w-5 h-5 text-red-500 mr-3"
									fill="currentColor"
									viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
								<p className="text-red-700 font-medium">{error}</p>
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Select Item */}
						<div className="form-group">
							<label className="block p4 font-semibold text-slate-700 mb-2">
								Select Item to Return
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative">
								<select
									value={selectedItemId ?? ""}
									onChange={(e) => {
										setSelectedItemId(Number(e.target.value));
										handleBlur("selectedItemId");
									}}
									onBlur={() => handleBlur("selectedItemId")}
									className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 appearance-none cursor-pointer ${
										touched.selectedItemId && validationErrors.selectedItemId
											? "border-red-500"
											: "border-slate-200 hover:border-primary"
									}`}>
									<option value="" disabled>
										Choose an item from your order
									</option>
									{items.map((item) => (
										<option key={item.id} value={item.id}>
											{item.product_title} (Available: {item.quantity})
										</option>
									))}
								</select>
								<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
									<svg
										className="w-5 h-5 text-slate-400"
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
								</div>
							</div>
							{touched.selectedItemId && validationErrors.selectedItemId && (
								<p className="mt-2 p4 text-red-600 flex items-center animate-slideDown">
									<svg
										className="w-4 h-4 mr-1"
										fill="currentColor"
										viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									{validationErrors.selectedItemId}
								</p>
							)}
						</div>

						{/* Quantity and Type Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Quantity */}
							<div className="form-group">
								<label className="block p4 font-semibold text-slate-700 mb-2">
									Quantity
									<span className="text-red-500 ml-1">*</span>
								</label>
								<input
									type="number"
									min={1}
									max={selectedItem?.quantity || 1}
									value={quantity}
									onChange={(e) => {
										setQuantity(Number(e.target.value));
										handleBlur("quantity");
									}}
									onBlur={() => handleBlur("quantity")}
									className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
										touched.quantity && validationErrors.quantity
											? "border-red-500"
											: "border-slate-200 hover:border-primary"
									}`}
									placeholder="Enter quantity"
								/>
								{touched.quantity && validationErrors.quantity && (
									<p className="mt-2 p4 text-red-600 flex items-center animate-slideDown">
										<svg
											className="w-4 h-4 mr-1"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
										{validationErrors.quantity}
									</p>
								)}
							</div>

							{/* Type */}
							<div className="form-group">
								<label className="block p4 font-semibold text-slate-700 mb-2">
									Request Type
									<span className="text-red-500 ml-1">*</span>
								</label>
								<div className="relative">
									<select
										value={type}
										onChange={(e) => setType(e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary transition-all duration-200 appearance-none cursor-pointer">
										<option value="refund">💰 Refund</option>
										<option value="exchange">🔄 Exchange</option>
									</select>
									<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
										<svg
											className="w-5 h-5 text-slate-400"
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
									</div>
								</div>
							</div>
						</div>

						{/* Reason */}
						<div className="form-group">
							<label className="block p4 font-semibold text-slate-700 mb-2">
								Reason for Return
								<span className="text-red-500 ml-1">*</span>
							</label>
							<textarea
								value={reason}
								onChange={(e) => {
									setReason(e.target.value);
									handleBlur("reason");
								}}
								onBlur={() => handleBlur("reason")}
								className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none ${
									touched.reason && validationErrors.reason
										? "border-red-500"
										: "border-slate-200 hover:border-primary"
								}`}
								rows={4}
								placeholder="Please describe why you're returning this item (minimum 10 characters)"></textarea>
							<div className="flex justify-between items-center mt-2">
								<div>
									{touched.reason && validationErrors.reason && (
										<p className="p4 text-red-600 flex items-center animate-slideDown">
											<svg
												className="w-4 h-4 mr-1"
												fill="currentColor"
												viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
											{validationErrors.reason}
										</p>
									)}
								</div>
								<span
									className={`p4 ${
										reason.length > 500
											? "text-red-600 font-semibold"
											: "text-slate-500"
									}`}>
									{reason.length}/500
								</span>
							</div>
						</div>

						{/* Customer Note */}
						<div className="form-group">
							<label className="block p4 font-semibold text-slate-700 mb-2">
								Additional Notes
								<span className="text-slate-400 text-xs ml-2">(Optional)</span>
							</label>
							<textarea
								value={customerNote}
								onChange={(e) => {
									setCustomerNote(e.target.value);
									handleBlur("customerNote");
								}}
								onBlur={() => handleBlur("customerNote")}
								className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none ${
									touched.customerNote && validationErrors.customerNote
										? "border-red-500"
										: "border-slate-200 hover:border-primary"
								}`}
								rows={3}
								placeholder="Any additional information you'd like to share"></textarea>
							<div className="flex justify-between items-center mt-2">
								<div>
									{touched.customerNote && validationErrors.customerNote && (
										<p className="p4 text-red-600 flex items-center animate-slideDown">
											<svg
												className="w-4 h-4 mr-1"
												fill="currentColor"
												viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
											{validationErrors.customerNote}
										</p>
									)}
								</div>
								<span
									className={`p4 ${
										customerNote.length > 300
											? "text-red-600 font-semibold"
											: "text-slate-500"
									}`}>
									{customerNote.length}/300
								</span>
							</div>
						</div>

						{/* Media Upload Section */}
						<div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-dashed border-primary/30">
							<h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
								<svg
									className="w-6 h-6 mr-2 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								Upload Media
							</h3>

							{/* Video Upload */}
							<div className="mb-6">
								<label className="block p4 font-semibold text-slate-700 mb-3">
									Upload Video
									<span className="text-red-500 ml-1">*</span>
									<span className="text-slate-500 text-xs ml-2 font-normal">
										(Max 50MB)
									</span>
								</label>
								<div className="relative">
									<input
										type="file"
										accept="video/*"
										onChange={(e) => {
											setVideo(e.target.files?.[0] || null);
											handleBlur("video");
										}}
										onBlur={() => handleBlur("video")}
										className="hidden"
										id="video-upload"
									/>
									<label
										htmlFor="video-upload"
										className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
											touched.video && validationErrors.video
												? "border-red-500 bg-red-50"
												: video
													? "border-green-500 bg-green-50 hover:bg-green-100"
													: "border-primary bg-white hover:bg-primary/50"
										}`}>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											{video ? (
												<>
													<svg
														className="w-10 h-10 mb-3 text-green-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													<p className="p4 text-slate-700 font-medium">
														{video.name}
													</p>
													<p className="text-xs text-slate-500 mt-1">
														{(video.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</>
											) : (
												<>
													<svg
														className="w-10 h-10 mb-3 text-primary"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
														/>
													</svg>
													<p className="mb-2 p4 text-slate-700">
														<span className="font-semibold">
															Click to upload
														</span>{" "}
														or drag and drop
													</p>
													<p className="text-xs text-slate-500">
														MP4, MOV, AVI (MAX. 50MB)
													</p>
												</>
											)}
										</div>
									</label>
								</div>
								{touched.video && validationErrors.video && (
									<p className="mt-2 p4 text-red-600 flex items-center animate-slideDown">
										<svg
											className="w-4 h-4 mr-1"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
										{validationErrors.video}
									</p>
								)}
							</div>

							{/* Images Upload */}
							<div>
								<label className="block p4 font-semibold text-slate-700 mb-3">
									Upload Images
									<span className="text-slate-400 text-xs ml-2 font-normal">
										(Optional, Max 5 images)
									</span>
								</label>
								<div className="relative">
									<input
										type="file"
										accept="image/*"
										multiple
										onChange={(e) => {
											setImages(
												e.target.files ? Array.from(e.target.files) : [],
											);
											handleBlur("images");
										}}
										onBlur={() => handleBlur("images")}
										className="hidden"
										id="images-upload"
									/>
									<label
										htmlFor="images-upload"
										className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
											touched.images && validationErrors.images
												? "border-red-500 bg-red-50"
												: images.length > 0
													? "border-green-500 bg-green-50 hover:bg-green-100"
													: "border-primary bg-white hover:bg-primary/50"
										}`}>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											{images.length > 0 ? (
												<>
													<svg
														className="w-10 h-10 mb-3 text-green-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													<p className="p4 text-slate-700 font-medium">
														{images.length} image(s) selected
													</p>
													<p className="text-xs text-slate-500 mt-1">
														Total:{" "}
														{(
															images.reduce((sum, img) => sum + img.size, 0) /
															1024 /
															1024
														).toFixed(2)}{" "}
														MB
													</p>
												</>
											) : (
												<>
													<svg
														className="w-10 h-10 mb-3 text-primary"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
													<p className="mb-2 p4 text-slate-700">
														<span className="font-semibold">
															Click to upload
														</span>{" "}
														or drag and drop
													</p>
													<p className="text-xs text-slate-500">
														PNG, JPG, GIF (MAX. 5MB each)
													</p>
												</>
											)}
										</div>
									</label>
								</div>
								{touched.images && validationErrors.images && (
									<p className="mt-2 p4 text-red-600 flex items-center animate-slideDown">
										<svg
											className="w-4 h-4 mr-1"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
										{validationErrors.images}
									</p>
								)}
							</div>
						</div>

						{/* Submit Button */}
						<div className="pt-4">
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-secondary text-white font-semibold py-4 px-6 rounded-xl hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-4 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center">
								{loading ? (
									<>
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
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
										Submitting Request...
									</>
								) : (
									<>
										<svg
											className="w-5 h-5 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Submit Return Request
									</>
								)}
							</button>
						</div>

						{/* Help Text */}
						{/* <div className="pt-4 text-center">
							<p className="p4 text-slate-500">
								Need help?{" "}
								<a
									href="/support"
									className="text-primary hover:text-secondary font-medium underline">
									Contact our support team
								</a>
							</p>
						</div> */}
					</form>
				</div>

				{/* Footer Info */}
				<div className="mt-8 text-center p4 text-slate-600">
					<p>
						🔒 Your information is secure and will only be used to process your
						return
					</p>
				</div>
			</div>

			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slideUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-5px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes shake {
					0%,
					100% {
						transform: translateX(0);
					}
					10%,
					30%,
					50%,
					70%,
					90% {
						transform: translateX(-5px);
					}
					20%,
					40%,
					60%,
					80% {
						transform: translateX(5px);
					}
				}

				.animate-fadeIn {
					animation: fadeIn 0.6s ease-out;
				}

				.animate-slideUp {
					animation: slideUp 0.8s ease-out;
				}

				.animate-slideDown {
					animation: slideDown 0.3s ease-out;
				}

				.animate-shake {
					animation: shake 0.5s ease-out;
				}
			`}</style>
		</div>
	);
};

export default ReturnRequestPage;
