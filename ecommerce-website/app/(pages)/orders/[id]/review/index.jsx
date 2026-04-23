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
	const { id } = useParams();
	const router = useRouter();

	const { data: order, isLoading } = useFetchReactQuery(
		() => OrderService.getOrderByTrackingId(id),
		["order-review", id],
	);

	const [reviews, setReviews] = useState({});

	if (isLoading) {
		return (
			<div className="p-10 text-center">
				<SpinLoader />
			</div>
		);
	}

	/* -------- GROUP PRODUCTS -------- */
	const productMap = {};

	order.order_items.forEach((item) => {
		const productId = item.product_id;

		if (!productMap[productId]) {
			productMap[productId] = {
				product_id: productId,
				title: item.product_title,
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
			[productId]: {
				...prev[productId],
				rating,
			},
		}));
	};

	const handleComment = (productId, comment) => {
		setReviews((prev) => ({
			...prev,
			[productId]: {
				...prev[productId],
				comment,
			},
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
				// order_id: order.id,
			}))
			?.filter((v) => v.comment?.length > 0 && v.rating > 0);

		await ReviewService.addReview({
			reviews: payload,
			name: order?.guest_first_name || null,
		})
			.then(() => {
				toast.success("Thanks for your review");
				setTimeout(() => {
					if (window?.history?.length > 1) {
						router.back();
					} else {
						router.push("/");
					}
				}, 500);
			})
			.catch((err) => {
				toast.error("Error saving review, please try again later!");
			});
		// router.push("/orders");
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			{/* ---------- HEADER ---------- */}
			<div className="flex items-center gap-3">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-1 text-gray-600 hover:text-black">
					<ChevronLeft className="w-5 h-5" />
					Back
				</button>
				<h2 className=" flex-1 h2 text-secondary text-center font-medium">
					Write a review
				</h2>
			</div>

			{/* ---------- PRODUCTS ---------- */}
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
						onChange={(e) => handleComment(product.product_id, e.target.value)}
						className="w-full border rounded-lg p-3 p4 focus:outline-0 focus:ring-2 focus:ring-secondary"
					/>
				</div>
			))}

			{/* ---------- SUBMIT ---------- */}
			<button
				onClick={handleSubmit}
				className="w-full bg-secondary text-white py-3 rounded-lg font-medium">
				Submit Reviews
			</button>
		</div>
	);
};

export default WriteReview;
