// "use client";
import dynamic from "next/dynamic";
import HomepageSection from "@/app/components/home/HomepageSection";

const FeaturesSection = dynamic(
	() => import("@/app/components/Themes/KidsTheme/FeaturesSection"),
);
const AboutUsSection = dynamic(
	() => import("@/app/components/Themes/KidsTheme/AboutUsSection"),
);
const Newsletter = dynamic(
	() => import("@/app/components/Themes/KidsTheme/Newsletter"),
);
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
