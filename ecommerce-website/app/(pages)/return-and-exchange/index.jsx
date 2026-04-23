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
        <h1>Return & Exchange Policy</h1>

<h2>Eligibility</h2>
<ul>
  <li>Items must be unused, unworn, and unwashed</li>
  <li>Fashion items may be tried for fitting only</li>
  <li>Requests must be made within 15 working days of delivery</li>
</ul>

<h2>Non-Eligible Cases</h2>
<ul>
  <li>Used or damaged items</li>
  <li>Baby care, feeding, and liquid products (for hygiene reasons)</li>
</ul>

<h2>Return Process</h2>
<ul>
  <li>Include a copy of the invoice</li>
  <li>Clearly state the reason for return or exchange</li>
  <li>Ship items using a traceable courier method</li>
  <li>Delivery/shipping charges are non-refundable</li>
  <li>Refunds (if applicable) are processed within 10 working days after inspection</li>
  <li>Please label the parcel clearly as “Return Item”</li>
  <li>Unboxing video is mandatory for all claims</li>
</ul>
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
