const Forbidden = () => {
	return (
		<div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 bg-white my-8 rounded-lg shadow">
			{/* Icon */}
			<div className="relative mb-6">
				<div className="w-24 h-24 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
					<svg
						className="w-10 h-10 text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
						/>
					</svg>
				</div>
				{/* Badge */}
				<span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
					403
				</span>
			</div>

			{/* Text */}
			<h1 className="text-xl font-semibold text-gray-800 mb-1">
				Access Denied
			</h1>
			<p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
				You don't have permission to view this page. Contact your administrator
				if you think this is a mistake.
			</p>

			{/* Divider */}
			<div className="w-px h-6 bg-gray-200 mb-6" />

			{/* Meta info */}
			<div className="flex items-center gap-4 text-xs text-gray-400 mb-8">
				<span className="flex items-center gap-1.5">
					<span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
					Error 403
				</span>
				<span className="text-gray-200">|</span>
				<span>Forbidden Resource</span>
				<span className="text-gray-200">|</span>
				<span>Insufficient Permissions</span>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3">
				{/* <button
					onClick={() => window.history.back()}
					className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm">
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
					Go Back
				</button> */}
				<a
					href="/"
					className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 transition-all duration-150 shadow-sm">
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
						/>
					</svg>
					Dashboard
				</a>
			</div>
		</div>
	);
};

export default Forbidden;
