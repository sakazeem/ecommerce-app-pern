"use client";
import { Star } from "lucide-react";
import React from "react";

const Ratings = ({ rating, max = 5 }) => {
	const randomRating = rating;
	// const randomRating = rating || Math.floor(Math.random() * 9 + 2) / 2;
	return (
		<div className="flex text-yellow-500">
			{[...Array(max)].map((_, i) => {
				const starValue = i + 1;
				const fillPercentage = Math.min(Math.max(randomRating - i, 0), 1) * 100;

				return (
					<div key={i} className="relative">
						{/* Empty star */}
						<Star className="size-4 max-md:size-3" />

						{/* Filled star (clipped) */}
						<div
							className="absolute top-0 left-0 overflow-hidden"
							style={{ width: `${fillPercentage}%` }}>
							<Star className="size-4 max-md:size-3" fill="currentColor" />
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Ratings;
