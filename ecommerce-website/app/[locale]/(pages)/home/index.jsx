import HomepageService from "@/app/services/HomepageServices";
import HomepageContent from "./homeCSR";

export default async function HomePage() {
	const homepageSections = await HomepageService.getHomepageSections();

	return <HomepageContent homepageSections={homepageSections} />;
}
