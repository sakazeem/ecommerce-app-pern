"use client";

import BaseImage from "@/app/components/BaseComponents/BaseImage";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import OrderService from "@/app/services/OrderService";
import ReviewService from "@/app/services/ReviewService";
import { ChevronLeft, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const WriteReview = () => {
	const { trackingId } = useParams();
	const router = useRouter();

	const { data: order, isLoading } = useFetchReactQuery(
		() => OrderService.getOrderForReview(trackingId),
		["order-review", trackingId],
	);

	const [reviews, setReviews] = useState({});
	const [guestName, setGuestName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isLoading) {
		return (
			<div className="p-10 text-center">
				<SpinLoader />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="p-10 text-center text-gray-500">
				Order not found. Please check the link and try again.
			</div>
		);
	}

	/* -------- GROUP PRODUCTS (one card per unique product) -------- */
	const productMap = {};
	order.order_items.forEach((item) => {
		const productId = item.product_id;
		if (!productMap[productId]) {
			productMap[productId] = {
				product_id: productId,
				order_item_id: item.id,
				title: item.product_title,
				image: item.product?.images?.[0] || item.product?.thumbnail || "",
			};
		}
	});
	const products = Object.values(productMap);

	/* -------- HANDLERS -------- */
	const handleRating = (productId, rating) => {
		setReviews((prev) => ({
			...prev,
			[productId]: { ...prev[productId], rating },
		}));
	};

	const handleComment = (productId, comment) => {
		setReviews((prev) => ({
			...prev,
			[productId]: { ...prev[productId], comment },
		}));
	};

	const handleSubmit = async () => {
		const payload = products
			.map((product) => ({
				product_id: product.product_id,
				order_item_id: product.order_item_id,
				title: product.title,
				rating: reviews[product.product_id]?.rating || 0,
				comment: reviews[product.product_id]?.comment || "",
			}))
			.filter((v) => v.comment?.length > 0 && v.rating > 0);

		if (payload.length === 0) {
			toast.error("Please rate and review at least one product before submitting.");
			return;
		}

		// For guest orders resolve name: prefer DB value, then input field
		const isGuest = !order.app_user_id;
		const resolvedName = order.guest_first_name
			? `${order.guest_first_name} ${order.guest_last_name || ""}`.trim()
			: guestName.trim() || null;

		if (isGuest && !resolvedName) {
			toast.error("Please enter your name before submitting.");
			return;
		}

		setIsSubmitting(true);
		try {
			await ReviewService.addReview({
				reviews: payload,
				name: resolvedName,
			});
			toast.success("Thanks for your review!");
			setTimeout(() => {
				router.push("/");
			}, 500);
		} catch {
			toast.error("Error saving review, please try again later!");
		} finally {
			setIsSubmitting(false);
		}
	};

	const isGuest = !order.app_user_id;
	// Only show name input when guest AND name is not already stored on the order
	const showNameInput = isGuest && !order.guest_first_name;

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			{/* ---------- HEADER ---------- */}
			<div className="flex items-center gap-3">
				<button
					onClick={() => router.push("/")}
					className="flex items-center gap-1 text-gray-600 hover:text-black">
					<ChevronLeft className="w-5 h-5" />
					Back
				</button>
				<h2 className="flex-1 h2 text-secondary text-center font-medium">
					Write a review
				</h2>
			</div>

			<p className="text-center text-gray-500 text-sm">
				Order <span className="font-medium text-gray-700">#{order.tracking_id}</span>
			</p>

			{/* ---------- GUEST NAME INPUT ---------- */}
			{showNameInput && (
				<div className="bg-white border rounded-lg p-5">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Your Name <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						placeholder="Enter your name"
						value={guestName}
						onChange={(e) => setGuestName(e.target.value)}
						className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
					/>
				</div>
			)}

			{/* ---------- PRODUCT CARDS ---------- */}
			{products.map((product) => (
				<div
					key={product.product_id}
					className="bg-white border rounded-lg p-5 space-y-4">
					<div className="flex items-center gap-4">
						<BaseImage
							src={
								product.image
									? ENV_VARIABLES.IMAGE_BASE_URL + product.image
									: null
							}
							alt={product.title}
							width={600}
							height={600}
							className="w-16 h-16 object-cover rounded-lg"
						/>
						<p className="p4 font-medium capitalize">
							{product.title?.toLowerCase()}
						</p>
					</div>

					{/* ---------- STARS ---------- */}
					<div className="flex gap-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<Star
								key={star}
								onClick={() => handleRating(product.product_id, star)}
								className={`w-6 h-6 cursor-pointer ${
									(reviews[product.product_id]?.rating || 0) >= star
										? "fill-yellow-400 text-yellow-400"
										: "text-gray-300"
								}`}
							/>
						))}
					</div>

					{/* ---------- COMMENT ---------- */}
					<textarea
						rows={4}
						placeholder="Share your experience..."
						value={reviews[product.product_id]?.comment || ""}
						onChange={(e) =>
							handleComment(product.product_id, e.target.value)
						}
						className="w-full border rounded-lg p-3 p4 focus:outline-0 focus:ring-2 focus:ring-secondary"
					/>
				</div>
			))}

			{/* ---------- SUBMIT ---------- */}
			<button
				onClick={handleSubmit}
				disabled={isSubmitting}
				className="w-full bg-secondary text-white py-3 rounded-lg font-medium disabled:opacity-60">
				{isSubmitting ? "Submitting..." : "Submit Reviews"}
			</button>
		</div>
	);
};

export default WriteReview;
