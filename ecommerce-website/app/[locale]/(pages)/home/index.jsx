import HomepageService from "@/app/services/HomepageServices";
import HomepageContent from "./homeCSR";

export default async function HomePage() {
	const homepageSections = await HomepageService.getHomepageSections();

	return (
		<>
			<link
				rel="preload"
				as="image"
				href={"https://cdn.babiesnbaba.com/web-3-1778582352761.webp"}
				fetchPriority="high"
			/>
			<link
				rel="preload"
				as="image"
				href={"https://cdn.babiesnbaba.com/summer-arrival-1779191900854.webp"}
				fetchPriority="high"
			/>
			<link
				rel="preload"
				as="image"
				href={"https://cdn.babiesnbaba.com/web-1-1778582375270.webp"}
				fetchPriority="high"
			/>
			<HomepageContent homepageSections={homepageSections} />
		</>
	);
}
