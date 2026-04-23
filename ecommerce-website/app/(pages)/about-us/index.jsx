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
        <h1>About Us</h1>
        <p>Nothing beats the joy of seeing your child comfortable, happy, and stylish. At Babiesnbaba, we bring that joy straight to your doorstep.</p>
        <p>We manufacture our own high-quality baby suits and carefully curate newborn essentials to ensure comfort, safety, and style for your little ones.</p>
        <p>Our goal is to build long-term trust with parents across Pakistan by offering premium quality, reliable service, and convenience.</p>

        <h2>Our Mission</h2>
        <p>To provide the best baby clothing and products at competitive prices with fast and reliable delivery across Pakistan.</p>

        <h2>Why Choose Babiesnbaba?</h2>
        <ul>
          <li>In-house Manufacturing: Handcrafted baby suits with care and precision</li>
          <li>Fast Home Delivery: Free shipping above PKR 3,000</li>
          <li>Customer Support: Available 9:00 AM - 9:00 PM</li>
          <li>Wide Product Range: Clothing, accessories, and newborn essentials</li>
        </ul>

        <h2>Our Promise</h2>
        <p>A simple, hassle-free online shopping experience that saves parents time and ensures comfort, safety, and happiness for their babies.</p>
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
