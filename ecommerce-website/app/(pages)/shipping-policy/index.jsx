"use client";
import React, { useEffect, useState } from "react";
import "@/app/styles/defaultPages.css";

const ShippingPolicyPage = () => {
	const [content, setContent] = useState("");

	// Simulate fetching HTML content from API
	useEffect(() => {
		const fetchContent = async () => {
			// Replace this with your real API call
			const apiResponse = `
       <h1>Shipping Policy</h1>
<p>We are committed to delivering your order accurately, in good condition, and on time. At Babiesnbaba, customer satisfaction and baby-safe handling are our top priorities.</p>
<p>After placing an order, you will receive a confirmation call or email from our representative. Once confirmed, your order will be dispatched promptly.</p>

<h2>Working Hours</h2>
<p>9:00 AM - 9:00 PM</p>

<h2>Shipping Details</h2>
<ul>
  <li>Shipping available all over Pakistan</li>
  <li>Free Standard Shipping on orders above PKR 3,000</li>
  <li>Premium Shipping available for faster delivery (additional charges apply)</li>
</ul>

<h2>Delivery Attempt</h2>
<p>If the customer is unavailable at the time of delivery, our representative will contact the customer and proceed as per instructions.</p>
<p>The parcel may be:</p>
<ul>
  <li>Delivered at another suitable time, or</li>
  <li>Handed over to a neighbor only after customer approval and payment confirmation</li>
</ul>

<h2>Policy Updates</h2>
<p>Babiesnbaba reserves the right to amend or update its shipping and payment policies at any time. Customers are advised to review this page periodically.</p>
 `;
			setContent(apiResponse);
		};

		fetchContent();
	}, []);

	return (
		<main className="container-layout md:!max-w-4xl mx-auto px-4 py-12 static-pages-container section-layout">
			<div
				className="about-container"
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		</main>
	);
};

export default ShippingPolicyPage;
