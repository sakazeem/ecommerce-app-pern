// "use client";
import HomepageSection from "@/app/components/home/HomepageSection";
import AboutUsSection from "@/app/components/Themes/KidsTheme/AboutUsSection";
import FeaturesSection from "@/app/components/Themes/KidsTheme/FeaturesSection";
import Newsletter from "@/app/components/Themes/KidsTheme/Newsletter";
// import { useEffect } from "react";

const HomePage = ({ homepageSections }) => {
	// useEffect(() => {
	// 	if (homepageSections) {
	// 		window.scrollTo({ top: 0, behavior: "smooth" });
	// 	}
	// }, [homepageSections]);

	return (
		<main>
			<section className="flex flex-col gap-18 section-layout-top/ max-md:gap-10">
				{homepageSections?.map((section, idx) => {
					return <HomepageSection section={section} key={idx} />;
				})}
				<FeaturesSection />
				<AboutUsSection />
			</section>
			<Newsletter />
		</main>
	);
};

export default HomePage;
