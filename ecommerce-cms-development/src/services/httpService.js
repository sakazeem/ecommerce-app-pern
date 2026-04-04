import axios from "axios";
import Cookies from "js-cookie";

// console.log("base url", import.meta.env.VITE_APP_API_BASE_URL);

export const instance = axios.create({
	baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}`,
	timeout: 50000,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
	// Do something before request is sent
	let adminInfo;
	if (Cookies.get("adminInfo")) {
		adminInfo = JSON.parse(Cookies.get("adminInfo"));
	}
	let tokens;
	if (Cookies.get("tokens")) {
		tokens = JSON.parse(Cookies.get("tokens"));
	}

	let company;

	if (Cookies.get("company")) {
		company = Cookies.get("company");
	}

	// console.log('Admin Http Services Cookie Read : ' + company);
	// let companyName = JSON.stringify(company);

	return {
		...config,
		headers: {
			authorization: tokens ? `Bearer ${tokens?.access?.token}` : null,
			company: company ? company : null,
		},
	};
});

instance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const ignoreUrls = [
			"/auth/refresh",
			"/auth/login",
			"/auth/register",
			"/branch",
			"/language",
		];

		if (ignoreUrls.some((url) => originalRequest.url.includes(url))) {
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const res = await axios.post(
					"/auth/refresh",
					{},
					{ withCredentials: true },
				);

				Cookies.set("tokens", JSON.stringify(res.data), {
					expires: 0.5,
					sameSite: "None",
					secure: true,
				});
				// setAccessToken(res.data.accessToken);

				originalRequest.headers.Authorization = `Bearer ${res.data?.access?.token}`;

				return instance(originalRequest);
			} catch (err) {
				window.location.href = "/login";
			}
		}
		// ✅ HANDLE 403 (NEW)
		if (error.response?.status === 403) {
			// prevent infinite redirect loop
			if (window.location.pathname !== "/forbidden") {
				window.location.href = "/forbidden";
			}
		}

		return Promise.reject(error);
	},
);

const responseBody = (response) => response.data;

const requests = {
	get: (url, body, headers) =>
		instance.get(url, body, headers).then(responseBody),

	post: (url, body, options = {}) =>
		instance.post(url, body, options).then(responseBody),

	put: (url, body, headers) =>
		instance.put(url, body, headers).then(responseBody),

	patch: (url, body) => instance.patch(url, body).then(responseBody),

	delete: (url, body) => instance.delete(url, body).then(responseBody),
};

export default requests;
