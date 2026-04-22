import { headers } from "next/headers";
import { storeSettingsKidsTheme } from "../data/storeSettingsKidsTheme";

// return storeSettingsSportsTheme;
export async function getTheme() {
	// await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 sec
	return storeSettingsKidsTheme;
	return;
	const domain = headers().get("host");
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/theme?domain=${domain}`,
		{
			next: { revalidate: 3600 }, //1hr
		},
	);
	return res.json();
}
