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
       <h1>Payment Methods</h1>

<p>
	To prevent fraudulent activities and ensure a secure shopping experience, we currently offer the following payment options:
</p>

<h2>Cash on Delivery (COD)</h2>
<p>
	Pay cash directly to the courier at the time of delivery.
</p>

<h2>Bank Transfer / IBFT</h2>
<p>
	Transfer the payable amount directly to our bank account using the details below:
</p>

<ul>
	<li>
						<strong>Bank Name:</strong> Meezan Bank
					</li>
					<li>
						<strong>Title of Account:</strong> B.BABIES N BABA
					</li>
					<li>
						<strong>Branch:</strong> Meezan Bank- Godhra Camp Branch
					</li>
					<li>
						<strong>Account Number:</strong> 99990113990738
					</li>
					<li>
						<strong>IBAN:</strong> PK70MEZN0099990113990738
					</li>
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
