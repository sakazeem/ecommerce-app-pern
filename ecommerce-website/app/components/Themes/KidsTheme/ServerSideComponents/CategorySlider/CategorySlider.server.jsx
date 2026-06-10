import CategoryService from "@/app/services/CategoryService";
import CategorySliderClient from "./CategorySliderClient";

export default async function CategorySliderServer(props) {
	let categories = [];

	// If data passed from parent, use it
	if (props.data?.length) {
		categories = props.data;
	}

	// otherwise fetch on server
	else {
		const res = await CategoryService.getCategories();
		categories = res?.data || [];
	}

	return <CategorySliderClient categories={categories} {...props} />;
}
