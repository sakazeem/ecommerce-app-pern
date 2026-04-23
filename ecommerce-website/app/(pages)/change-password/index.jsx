"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
	const [form, setForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (form.newPassword !== form.confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/auth/change-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(form),
			});

			if (!res.ok) throw new Error("Failed");
			alert("Password updated successfully");
			setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
		} catch {
			alert("Failed to update password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-xl font-semibold mb-6">Change Password</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="password"
					name="currentPassword"
					placeholder="Current password"
					className="input"
					onChange={handleChange}
					required
				/>

				<input
					type="password"
					name="newPassword"
					placeholder="New password"
					className="input"
					onChange={handleChange}
					required
				/>

				<input
					type="password"
					name="confirmPassword"
					placeholder="Confirm new password"
					className="input"
					onChange={handleChange}
					required
				/>

				<button className="btn-primary w-full" disabled={loading}>
					{loading ? "Updating..." : "Update Password"}
				</button>
			</form>
		</div>
	);
}
