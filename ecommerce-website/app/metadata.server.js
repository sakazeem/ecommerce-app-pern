const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getNavCategories() {
	const res = await fetch(`${API}/metadata/navCategories`, {
		next: { revalidate: 3600 },
	});
	return res.json();
}

export async function getBrands() {
	const res = await fetch(`${API}/metadata/brands`, {
		next: { revalidate: 3600 },
	});
	return res.json();
}
