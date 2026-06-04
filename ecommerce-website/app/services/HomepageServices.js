import { serverGet } from "./serverFetch";
const HomepageService = {
	getHomepageSections: async () => {
		try {
			return await serverGet("/homepage-sections", {
				revalidate: 300, // cache for 5 minutes
				tags: ["homepage"],
			});
		} catch (err) {
			console.error("API error:", err);
			return null;
		}
	},
};

export default HomepageService;
