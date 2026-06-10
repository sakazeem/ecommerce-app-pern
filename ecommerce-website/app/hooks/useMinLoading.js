"use client";

import { useEffect, useState } from "react";

export function useMinLoading(loading, minTime = 500) {
	const [showLoading, setShowLoading] = useState(loading);

	useEffect(() => {
		let timer;

		if (loading) {
			setShowLoading(true);
		} else {
			timer = setTimeout(() => {
				setShowLoading(false);
			}, minTime);
		}

		return () => clearTimeout(timer);
	}, [loading, minTime]);

	return showLoading;
}
