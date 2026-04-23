"use client";
import React, { useEffect, useState } from "react";
import "@/app/styles/defaultPages.css";

const AboutUsPage = () => {
	const [content, setContent] = useState("");

	// Simulate fetching HTML content from API
	useEffect(() => {
		const fetchContent = async () => {
			// Replace this with your real API call
			const apiResponse = `
       <h1>Terms & Conditions</h1>

<h2>1. Order Placement</h2>
<p>Orders can be placed by completing the order summary page on our website and clicking Place Order. Orders may also be placed via phone call or WhatsApp.</p>

<h2>2. Product Display Disclaimer</h2>
<p>The display of products on our website does not constitute an offer to sell. Your order submission represents an offer to purchase. Babiesnbaba reserves the right to decline orders placed at incorrect or unintended prices.</p>

<h2>3. Order Acceptance</h2>
<p>We will notify you of order acceptance via email or phone call. Upon acceptance, a binding agreement is formed.</p>
<p>If your order cannot be accepted or prices/delivery charges change, you will be informed promptly.</p>

<h2>4. Delivery Timeline</h2>
<ul>
  <li>Estimated delivery: 4–7 working days (daytime delivery)</li>
  <li>Delivery times may vary due to unforeseen circumstances</li>
  <li>Customers will be informed of any delays</li>
</ul>

<h2>5. Payments</h2>
<ul>
  <li>Cash on Delivery</li>
  <li>Bank Transfer (IBFT)</li>
  <li>Meezan Bank Payment Gateway (Debit / Credit / Wallet / Bank Account)</li>
  <li>No hidden charges apply</li>
</ul>

<h2>6. Warranty & Claims</h2>
<p>All products are covered under our warranty policy.</p>
<p>If a product is defective or unsatisfactory, Babiesnbaba will offer:</p>
<ul>
  <li>Replacement</li>
  <li>Exchange</li>
</ul>
<p><strong>Important:</strong> Customers must record an unboxing video at the time of delivery. This video is mandatory for any refund, replacement, or damage claim.</p>
<p>Shipping costs for returns are borne by the customer.</p>

 `;
			setContent(apiResponse);
		};

		fetchContent();
	}, []);

	return (
		<main className="container-layout md:!max-w-4xl max-w-4xl mx-auto px-4 py-12 static-pages-container section-layout">
			<div
				className="about-container"
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		</main>
	);
};

export default AboutUsPage;
