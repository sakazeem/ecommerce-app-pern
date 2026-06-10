import React from "react";

const SmallSpinLoader = ({ size = 40 }) => {
	return (
		<div className="flex justify-center items-center py-10">
			<div
				className="relative"
				style={{ width: size, height: size }}
				role="status"
				aria-label="Loading">
				<div className="absolute inset-0 rounded-full border-4 border-neutral-400"></div>
				<div className="absolute inset-0 rounded-full border-4 border-border-color border-t-transparent animate-spin"></div>
			</div>
		</div>
	);
};

export default SmallSpinLoader;
