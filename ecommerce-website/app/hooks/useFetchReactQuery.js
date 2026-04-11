import { useQuery } from "@tanstack/react-query";

/**
 * Custom React Query fetch hook
 * @param {Function} fetchDataFunction - The async function that fetches data
 * @param {string|Array} queryKey - Unique query key
 * @param {Object} options - Extra options (enabled, retry, staleTime, etc.)
 */

export const useFetchReactQuery = (
	fetctDataFunction,
	queryKey,
	options = {},
) => {
	return useQuery({
		queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
		queryFn: fetctDataFunction,
		retry: false,

		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
		refetchOnMount: false, // 🔥 key fix
		refetchOnReconnect: false,
		// placeholderData: (prev) => prev,
		keepPreviousData: true,
		...options,
		// enabled: false,
	});
};
