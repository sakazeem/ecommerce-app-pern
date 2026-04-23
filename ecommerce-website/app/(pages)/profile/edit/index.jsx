"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const EditProfile = ({ user = {} }) => {
	const router = useRouter();

	const [form, setForm] = useState({
		name: user.name,
		email: user.email,
		phone: user.phone,
	});

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async () => {
		// await UserService.updateProfile(form);
		router.push("/profile");
	};

	return (
		<div className="max-w-xl mx-auto bg-white p-6 rounded-lg">
			<h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

			<div className="space-y-4">
				<input
					name="name"
					value={form.name}
					onChange={handleChange}
					className="w-full border p-3 rounded-lg"
					placeholder="Name"
				/>
				<input
					name="email"
					value={form.email}
					disabled
					className="w-full border p-3 rounded-lg bg-gray-100"
				/>
				<input
					name="phone"
					value={form.phone}
					onChange={handleChange}
					className="w-full border p-3 rounded-lg"
					placeholder="Phone"
				/>
			</div>

			<div className="flex gap-3 mt-6">
				<button
					onClick={() => router.back()}
					className="flex-1 border py-3 rounded-lg">
					Cancel
				</button>
				<button
					onClick={handleSubmit}
					className="flex-1 bg-secondary text-white py-3 rounded-lg">
					Save Changes
				</button>
			</div>
		</div>
	);
};

export default EditProfile;
