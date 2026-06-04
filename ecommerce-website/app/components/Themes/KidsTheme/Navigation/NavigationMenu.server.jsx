import { getBrands, getNavCategories } from "@/app/metadata.server";
import NavigationMenuClient from "./NavigationMenuClient";

export default async function NavigationMenuServer(props) {
	const [navCategories, brands] = await Promise.all([
		// getNavCategories(),
		// getBrands(),
	]);

	return (
		<NavigationMenuClient
			{...props}
			navCategories={navCategories}
			brands={brands}
		/>
	);
}
