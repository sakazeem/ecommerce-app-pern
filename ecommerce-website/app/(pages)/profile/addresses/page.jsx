"use client";

import Layout from "@/app/components/Shared/layout/Layout";
import { useEffect, useState } from "react";

export default function AddressPage() {
	const [addresses, setAddresses] = useState([]);
	const [form, setForm] = useState({
		street: "",
		city: "",
		country: "",
		postal_code: "",
		type: "shipping",
	});

	useEffect(() => {
		fetch("/api/addresses", { credentials: "include" })
			.then((res) => res.json())
			.then((data) => setAddresses(data.addresses || []));
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		await fetch("/api/addresses", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(form),
		});
		location.reload();
	};

	return (
		<Layout>
			<div className="max-w-4xl mx-auto p-6 space-y-8">
				<h1 className="text-xl font-semibold">My Addresses</h1>

				{/* Existing addresses */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{addresses.map((addr) => (
						<div key={addr.id} className="border p-4 rounded-md">
							<p className="font-medium capitalize">{addr.type}</p>
							<p className="text-sm">{addr.street}</p>
							<p className="text-sm">
								{addr.city}, {addr.country}
							</p>
							<p className="text-sm">{addr.postal_code}</p>
						</div>
					))}
				</div>

				{/* Add new address */}
				<form
					onSubmit={handleSubmit}
					className="bg-white shadow p-6 rounded space-y-4">
					<h2 className="font-medium">Add New Address</h2>

					<select
						className="input"
						onChange={(e) => setForm({ ...form, type: e.target.value })}>
						<option value="shipping">Shipping</option>
						<option value="billing">Billing</option>
					</select>

					<input
						className="input"
						placeholder="Street"
						onChange={(e) => setForm({ ...form, street: e.target.value })}
					/>

					<input
						className="input"
						placeholder="City"
						onChange={(e) => setForm({ ...form, city: e.target.value })}
					/>

					<input
						className="input"
						placeholder="Country"
						onChange={(e) => setForm({ ...form, country: e.target.value })}
					/>

					<input
						className="input"
						placeholder="Postal Code"
						onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
					/>

					<button className="btn-primary">Save Address</button>
				</form>
			</div>
		</Layout>
	);
}
