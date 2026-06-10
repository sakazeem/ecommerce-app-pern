export function SectionSkeleton({ height = "h-48" }) {
	return (
		<div
			className={`w-full h-48 bg-gray-100/80 py-4 backdrop-blur-sm animate-pulse rounded-md`}
		/>
	);
}

export function ProductsGridSkeleton({ columns = "grid-cols-5", count = 5 }) {
	return (
		<section
			className={`grid ${columns} gap-6 max-md:gap-3 max-md:grid-cols-2 items-stretch`}>
			{Array.from({ length: count }).map((_, i) => (
				<ProductCardSkeleton key={i} />
			))}
		</section>
	);
}

// ProductCardSkeleton.jsx
export function ProductCardSkeleton() {
	return (
		<div className="relative w-full h-full overflow-hidden rounded-md border border-gray-200 bg-light shadow-sm flex flex-col">
			{/* Image area */}
			<div className="relative w-full aspect-square bg-gray-100 animate-pulse rounded-t-md" />

			{/* Product Info */}
			<div className="flex-1 flex flex-col gap-3 max-md:gap-1 px-4 py-3 border-t border-gray-100 max-md:px-2 max-md:py-2">
				{/* Title */}
				<div className="h-4 w-4/5 rounded bg-gray-100 animate-pulse" />

				{/* Price */}
				<div className="flex gap-2">
					<div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
					<div className="h-4 w-12 rounded bg-gray-100 animate-pulse" />
				</div>

				{/* Ratings */}
				<div className="flex gap-1 items-center">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="w-3.5 h-3.5 rounded-sm bg-gray-100 animate-pulse"
						/>
					))}
				</div>

				{/* Buttons */}
				<div className="flex gap-2 mt-4">
					<div className="flex-1 h-8 rounded-md bg-gray-100 animate-pulse" />
					<div className="flex-1 h-8 rounded-md bg-gray-100 animate-pulse" />
				</div>
			</div>
		</div>
	);
}
