"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import OrderService from "@/app/services/OrderService";
import SpinLoader from "@/app/components/Shared/SpinLoader";

export default function ProfilePage() {
	// const [user, setUser] = useState(null);
	const { user, logout } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const ordersData = await OrderService.myOrders();
				setOrders(ordersData.order || []);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (loading) {
		return <SpinLoader />;
	}

	if (!user) {
		return <div className="p-6">Please login to view your profile.</div>;
	}

	return (
		<div className="container-layout md:!max-w-5xl p4 mx-auto section-layout space-y-8">
			<h1 className="h1 text-center text-secondary font-semibold">
				My Account
			</h1>

			{/* Personal Info */}
			<section className="bg-white rounded-lg shadow p-6">
				<h2 className="h4 font-medium mb-4 text-secondary">
					Personal Information
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p className=" text-gray-500">First Name</p>
						<p className="font-medium">{user.name}</p>
					</div>

					<div>
						<p className=" text-gray-500">Email</p>
						<p className="font-medium flex items-center gap-2">{user.email}</p>
					</div>

					<div>
						<p className=" text-gray-500">Phone</p>
						<p className="font-medium">{user.phone || "-"}</p>
					</div>
				</div>

				<div className="mt-4">
					<Link href="/profile/edit" className=" text-blue-600 hover:underline">
						Edit Profile
					</Link>
				</div>
			</section>

			{/* Address Section */}
			{/* <section className="bg-white rounded-lg shadow p-6">
				<h2 className="h4 font-medium mb-4 text-secondary">Addresses</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<p className=" text-gray-500 mb-1">
							Default Shipping Address
						</p>
						<p className="">
							{user.shipping_address || "No address added"}
						</p>
					</div>

					<div>
						<p className=" text-gray-500 mb-1">
							Default Billing Address
						</p>
						<p className="">
							{user.billing_address || "No address added"}
						</p>
					</div>
				</div>

				<div className="mt-4">
					<Link
						href="/profile/addresses"
						className=" text-blue-600 hover:underline">
						Manage Addresses
					</Link>
				</div>
			</section> */}

			{/* Orders Section */}
			<section className="bg-white rounded-lg shadow p-6">
				<h2 className="h4 font-medium mb-4 text-secondary">My Orders</h2>

				{orders.length === 0 ? (
					<p className=" text-gray-500">
						You haven&apos;t placed any orders yet.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full ">
							<thead className="border-b">
								<tr>
									<th className="text-left py-2">Tracking ID</th>
									<th className="text-left py-2">Date</th>
									<th className="text-left py-2">Total</th>
									<th className="text-left py-2">Status</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => (
									<tr key={order.id} className="border-b">
										<td className="py-2">{order.tracking_id}</td>
										<td className="py-2">
											{new Date(order.created_at).toLocaleDateString()}
										</td>
										<td className="py-2">Rs. {order.total}</td>
										<td className="py-2">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													order.status === "delivered"
														? "bg-green-100 text-green-700"
														: order.status === "pending"
															? "bg-yellow-100 text-yellow-700"
															: "bg-gray-100 text-gray-700"
												}`}>
												{order.status}
											</span>
										</td>
										<td className="py-2 text-right">
											<Link
												href={`/track-order?trackingId=${order.tracking_id}`}
												className="text-blue-600 hover:underline">
												View
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* Account Actions */}
			<section className="bg-white rounded-lg shadow p-6">
				<h2 className="h4 font-medium mb-4 text-secondary">Account</h2>

				<div className="flex gap-4">
					{/* <Link
						href="/profile/change-password"
						className=" text-blue-600 hover:underline">
						Change Password
					</Link> */}

					<button
						onClick={async () => {
							await logout();
							window.location.href = "/";
						}}
						className=" text-red-600 hover:underline">
						Logout
					</button>
				</div>
			</section>
		</div>
	);
}
