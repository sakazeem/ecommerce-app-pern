import BaseImage from "@/app/components/BaseComponents/BaseImage";
import Ratings from "@/app/components/Shared/Ratings";
import SpinLoader from "@/app/components/Shared/SpinLoader";
import { ENV_VARIABLES } from "@/app/constants/env_variables";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import ReviewService from "@/app/services/ReviewService";
import { formatDateTime } from "@/app/utils/commonUtils";

const Reviews = () => {
	/* ---------------- FETCH REVIEWS ---------------- */
	const { data: myReviews, isLoading } = useFetchReactQuery(
		() => ReviewService.myReviews(),
		["myReviews"],
	);

	if (isLoading) {
		return (
			<div className="py-10 text-center">
				<SpinLoader />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{myReviews?.length > 0 ? (
				myReviews.map((review) => {
					return (
						<div className="bg-white rounded-lg p-6 border">
							<div className="flex gap-4 mb-4">
								<div className="w-26 h-26 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
									<BaseImage
										src={
											review.product?.thumbnailImage?.url
												? ENV_VARIABLES.IMAGE_BASE_URL +
													review.product.thumbnailImage.url
												: null
										}
										alt={review.title}
										width={600}
										height={600}
										className="w-full object-contain rounded-md"
									/>
									{/* 📦 */}
								</div>
								<div className="flex-1">
									<div className="font-semibold mb-2 capitalize">
										{review.title?.toLowerCase() || ""}
									</div>
									<div className="flex gap-1 mb-2">
										<Ratings rating={review.rating} />
									</div>
									<p className="text-gray-600 text-sm">{review.comment}</p>
									<div className="text-xs text-gray-400 mt-2">
										Reviewed on {formatDateTime(review.updated_at)}
									</div>
								</div>
							</div>
						</div>
					);
				})
			) : (
				<>
					<div className="text-center pb-12 pt-24 text-gray-500">
						No reviews found
					</div>
				</>
			)}
		</div>
	);
};

export default Reviews;
