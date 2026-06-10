// components/Loader.jsx
import React from "react";

export default function Loader({ cols = 4 }) {
	// ensure cols is between 1 and 6
	const columns = Math.max(1, Math.min(cols, 6));
	const productPlaceholders = Array.from({ length: 8 });
	return (
		<div
			role="status"
			aria-live="polite"
			className="min-h-screen w-full bg-gray-50/80 backdrop-blur-sm /dark:bg-gray-900 text-gray-900 /dark:text-gray-100 transition-all">
			{/* Top bar / nav */}
			{/* <header className="w-full border-b border-gray-200 /dark:border-gray-800 bg-white /dark:bg-gray-900 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="h-16 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-32 h-8 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							<div className="hidden sm:flex gap-3 ml-6">
								<div className="w-20 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-20 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-20 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-full bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							<div className="w-8 h-8 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
						</div>
					</div>
				</div>
			</header> */}

			{/* Hero */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
				<div className="rounded-lg overflow-hidden">
					<div
						className="w-full h-[44vh] sm:h-80 md:h-[36vh] lg:h-96 rounded-lg relative overflow-hidden"
						aria-hidden="true">
						{/* shimmer layer for nicer effect */}
						<div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 /dark:from-gray-800 /dark:via-gray-700 /dark:to-gray-800 animate-[pulse_1.5s_infinite]"></div>
					</div>
				</div>

				<div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
					{/* Left: filters (hidden on small screens) */}
					<aside className="w-full lg:w-64 hidden lg:block">
						<div className="space-y-4">
							<div className="w-full h-10 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							<div className="w-full h-8 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							<div className="w-full h-24 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							<div className="w-full h-8 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
						</div>
					</aside>

					{/* Main content */}
					<main className="flex-1">
						{/* heading */}
						<div className="w-48 h-6 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse mb-6" />

						{/* product grid */}
						<div
							className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns} gap-6`}>
							{productPlaceholders.map((_, idx) => (
								<div
									key={idx}
									className="bg-white /dark:bg-gray-800 border border-gray-200 /dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
									<div className="w-full h-56 sm:h-44 md:h-48 lg:h-40 bg-gray-200 /dark:bg-gray-700 animate-pulse" />
									<div className="p-4 space-y-3">
										<div className="w-3/4 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
										<div className="w-1/2 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
										<div className="flex items-center justify-between">
											<div className="w-20 h-6 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
											<div className="w-8 h-8 rounded-full bg-gray-200 /dark:bg-gray-700 animate-pulse" />
										</div>
									</div>
								</div>
							))}
						</div>

						{/* load more / footer area */}
						<div className="mt-8 flex items-center justify-center">
							<div className="w-40 h-10 rounded-md bg-gray-200 /dark:bg-gray-700 animate-pulse" />
						</div>
					</main>
				</div>

				{/* footer */}
				{/* <footer className="mt-12 border-t border-gray-200 /dark:border-gray-800 pt-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						<div>
							<div className="w-32 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse mb-3" />
							<div className="space-y-2">
								<div className="w-40 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-36 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-28 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							</div>
						</div>
						<div>
							<div className="w-28 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse mb-3" />
							<div className="space-y-2">
								<div className="w-44 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-40 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-32 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							</div>
						</div>
						<div>
							<div className="w-16 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse mb-3" />
							<div className="space-y-2">
								<div className="w-28 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-36 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							</div>
						</div>
						<div>
							<div className="w-24 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse mb-3" />
							<div className="space-y-2">
								<div className="w-44 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
								<div className="w-32 h-3 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
							</div>
						</div>
					</div>

					<div className="mt-8 flex items-center justify-between">
						<div className="w-40 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
						<div className="w-24 h-4 rounded bg-gray-200 /dark:bg-gray-700 animate-pulse" />
					</div>
				</footer> */}
			</div>
		</div>
	);
}
