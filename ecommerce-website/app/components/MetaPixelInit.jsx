"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

/**
 * Fires fbq('init') again with advanced matching once user data is available.
 * Meta de-duplicates init calls — calling it again with user data enriches
 * future events without resetting the pixel.
 */
export default function MetaPixelInit() {
	const { user } = useAuth();

	useEffect(() => {
		if (typeof window === "undefined" || !window.fbq) return;

		const matchingData = {};
		if (user?.email) matchingData.em = user.email.trim().toLowerCase();
		if (user?.phone) matchingData.ph = user.phone.replace(/\D/g, ""); // digits only

		if (Object.keys(matchingData).length > 0) {
			window.fbq("init", "1371248501158222", matchingData);
		}
	}, [user]);

	return null;
}
