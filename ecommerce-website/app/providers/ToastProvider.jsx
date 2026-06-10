// app/components/Shared/ToastProvider.jsx
"use client";

import { useEffect } from "react";

export default function ToastProvider() {
	useEffect(() => {
		// Load toastify CSS only after page is interactive
		import("react-toastify/dist/ReactToastify.css");
	}, []);

	return null;
}
