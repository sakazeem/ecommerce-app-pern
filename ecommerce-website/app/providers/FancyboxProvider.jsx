// app/components/Shared/FancyboxProvider.jsx
"use client";

import { useEffect } from "react";

export default function FancyboxProvider() {
	useEffect(() => {
		import("@fancyapps/ui/dist/fancybox/fancybox.css");
	}, []);

	return null;
}
