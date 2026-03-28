"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import requests from "../services/httpServices";
import { toast } from "react-toastify";
import { useCartStore } from "../store/cartStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = useCallback(async () => {
		try {
			const data = await requests.get("/auth/me");
			setUser(data.user);
			localStorage.setItem("auth_user", JSON.stringify(data.user));
			// Load fresh cart/favs from DB
			const { loadCart, loadFavourites, verifyAndSyncCart } =
				useCartStore.getState();
			await loadCart(true);
			await loadFavourites(true);
			await verifyAndSyncCart(true);
		} catch (error) {
			setUser(null);
			localStorage.removeItem("auth_user");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const storedUser = localStorage?.getItem("auth_user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
			setLoading(false);
			fetchUser();
		} else {
			setLoading(false);
		}
	}, []);

	const updateUser = useCallback(async (data = {}) => {
		return await requests
			.patch("/profile", data)
			.then((res) => {
				setUser(res);
				localStorage.setItem("auth_user", JSON.stringify(res));
				toast.success("Profile updated successfully");
				return res;
			})
			.catch((err) => toast.error(err.message));
	}, []);

	const changePassword = useCallback(async (data = {}) => {
		return await requests
			.patch("/auth/change-password", data)
			.then((res) => {
				setUser(res);
				localStorage.setItem("auth_user", JSON.stringify(res));
				toast.success("Password updated successfully");
				return res;
			})
			.catch((err) => toast.error(err.message || "Error updating password"));
	}, []);

	const login = useCallback(async (email, password) => {
		try {
			const res = await requests.post("/auth/login", { email, password });
			setUser(res.user);
			localStorage.setItem("auth_user", JSON.stringify(res.user));

			const { syncToDb, loadCart, loadFavourites } = useCartStore.getState();
			// Cookie is now set — safe to sync and load
			await syncToDb();
			await loadCart(true);
			await loadFavourites(true);

			return res.user;
		} catch (err) {
			toast.error(err.message);
		}
	}, []);

	const register = useCallback(async (email, password, name, otp) => {
		try {
			const res = await requests.post("/auth/register", {
				email,
				password,
				name,
				otp,
				user_type: "website",
			});
			setUser(res.user);
			localStorage.setItem("auth_user", JSON.stringify(res.user));

			const { syncToDb, loadCart, loadFavourites } = useCartStore.getState();
			await syncToDb();
			await loadCart(true);
			await loadFavourites(true);

			return res.user;
		} catch (err) {
			toast.error(err.message || err);
		}
	}, []);

	const sendOtp = useCallback(async (email, name) => {
		return await requests.post("/auth/send-otp", { email, name });
	}, []);

	const logout = useCallback(async () => {
		try {
			await requests.post("/auth/logout");
			toast.success("User logged out successfully");
		} catch (e) {
			console.error("Logout failed", e);
		} finally {
			setUser(null);
			localStorage.removeItem("auth_user");
			const { clearCart, clearFavourites } = useCartStore.getState();
			clearCart(false);
			clearFavourites();
		}
	}, []);

	const value = {
		user,
		login,
		register,
		logout,
		sendOtp,
		loading,
		isAuthenticated: !!user,
		updateUser,
		changePassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
