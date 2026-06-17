// app/services/serverFetch.js
const BASE_URL = "http://72.61.149.213:4000/v1/website";
// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function serverGet(url, options = {}) {
	const res = await fetch(`${BASE_URL}${url}`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		// ✅ Next.js cache — this is the key
		next: {
			revalidate: options.revalidate ?? 1200, // 20 min default
			tags: options.tags, // for on-demand revalidation
		},
		...options,
	});

	if (!res.ok) {
		console.error(
			`Fetch failed: ${BASE_URL}${url}, Status: ${res.status}, StatusText: ${res.statusText}`,
		);

		throw new Error(`Fetch failed: ${BASE_URL}${url}, Status: ${res.status}`);
	}
	return res.json();
}
