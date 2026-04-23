"use client";
import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";

const ContactUsPage = () => {
	return (
		<div className="container-layout md:!max-w-4xl mx-auto section-layout">
			<h1 className="h1 font-medium text-secondary mb-3 text-center">
				Contact Us
			</h1>
			<p className="text-center text-gray-700 mb-12 p4">
				We&apos;d love to hear from you!
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
				{/* Address */}
				<div className="flex items-start gap-4">
					<MapPin className="w-6 h-6 text-secondary mt-1" />
					<div>
						<h2 className="h4 font-semibold text-gray-800 mb-1">Address</h2>
						<p className="text-gray-600 leading-relaxed p4">
							Babiesnbaba Warehouse
							<br />
							Plot No. 21, 1st Floor, Sector 11-G-78,
							<br />
							New Karachi, North Town, Karachi
						</p>
					</div>
				</div>

				{/* Call / WhatsApp */}
				<div className="flex items-start gap-4">
					<Phone className="w-6 h-6 text-secondary mt-1" />
					<div>
						<h2 className="h4 font-semibold text-gray-800 mb-1">
							Call / WhatsApp
						</h2>
						<p className="text-gray-600 p4">
							<Link href="tel:+923340002625" className="hover:underline">
								+92 334 000 2625
							</Link>
						</p>
					</div>
				</div>

				{/* Email */}
				<div className="flex items-start gap-4">
					<Mail className="w-6 h-6 text-secondary mt-1" />
					<div>
						<h2 className="h4 font-semibold text-gray-800 mb-1">Email</h2>
						<p className="text-gray-600 p4">
							<Link
								href="mailto:babiesnbaba@gmail.com"
								className="hover:underline">
								babiesnbaba@gmail.com
							</Link>
						</p>
					</div>
				</div>

				{/* Availability */}
				<div className="flex items-start gap-4">
					<Clock className="w-6 h-6 text-secondary mt-1" />
					<div>
						<h2 className="h4 font-semibold text-gray-800 mb-1">
							Availability
						</h2>
						<p className="text-gray-600 p4">Customer support available 24/7</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactUsPage;
