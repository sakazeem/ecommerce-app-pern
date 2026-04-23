"use client";
import React from "react";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import Logo from "@/app/components/Shared/Logo";
import { FiFacebook, FiInstagram, FiYoutube, FiGlobe } from "react-icons/fi";

import { FaTiktok, FaPinterestP, FaWhatsapp, FaLink } from "react-icons/fa";
import { useStore } from "@/app/providers/StoreProvider";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import OverlayContainer from "../../Shared/OverlayContainer";

const currentYear = new Date().getFullYear();

export const SOCIAL_CONFIG = [
	{
		key: "facebook",
		icon: FiFacebook,
		label: "Facebook",
	},
	{
		key: "instagram",
		icon: FiInstagram,
		label: "Instagram",
	},
	{
		key: "tiktok",
		icon: FaTiktok,
		label: "TikTok",
	},
	{
		key: "pinterest",
		icon: FaPinterestP,
		label: "Pinterest",
	},
	{
		key: "youtube",
		icon: FiYoutube,
		label: "YouTube",
	},
	{
		key: "linktree",
		icon: FaLink,
		label: "Linktree",
	},
	{
		key: "website",
		icon: FiGlobe,
		label: "Website",
	},
	{
		key: "whatsapp",
		icon: FaWhatsapp,
		label: "WhatsApp",
	},
];

const Footer = ({ showOnMobile = true }) => {
	const store = useStore();
	const footerContent = store.content.footer;

	return (
		<footer
			className={`bg-footer text-light bg-no-repeat bg-cover bg-center relative ${showOnMobile ? "" : "max-md:hidden"}`}
			style={{
				backgroundImage: footerContent.background
					? `url('${footerContent.background.src}')`
					: "none",
			}}>
			<OverlayContainer opacity={0.15} />
			<div className="container-layout relative">
				{/* Top Section */}
				<section className="section-layout-top flex flex-wrap justify-between gap-10 md:gap-16 lg:flex-nowrap">
					<div className="grid grid-cols-4 max-md:grid-cols-2 justify-between gap-10 max-md:gap-x-6 max-md:gap-y-8 w-full">
						<div className=" min-w-[150px]/ flex-1 col-span-2 max-md:col-span-2 md:pr-20">
							<Logo
								src={footerContent.logo}
								className="w-32 max-md:w-28 h-auto object-contain"
							/>
							<p className="p4 mt-4">
								Babiesnbaba is your one-stop shop for premium baby products in
								Pakistan. We offer trusted baby brands at competitive prices
								with fast home delivery nationwide.
							</p>

							<ul className="flex flex-col gap-1 md:gap-2 mt-3">
								{[
									{
										icon: MapPin,
										// className: "w-6 h-6",
										label: "Address",
										value: "Karachi, Pakistan",
										// value:
										// 	"Babiesnbaba Warehouse, Plot No. 21, 1st Floor, Sector 11-G-78, New Karachi, North Town, Karachi",
									},
									{
										icon: Phone,
										label: "Call / WhatsApp",
										value: "+92 334 000 2625",
										link: "tel:+923340002625",
									},
									{
										icon: Mail,
										label: "Email",
										value: "babiesnbaba@gmail.com",
										link: "mailto:babiesnbaba@gmail.com",
									},
									{
										icon: Clock,
										label: "Availability",
										value: "10:00 - 20:00",
									},
								]?.map((item, index) => {
									const Icon = item.icon;

									return (
										<div key={index} className="flex items-start gap-2 p5">
											<Icon
												className={`${item.className || "w-4 h-4 mt-0.5"}`}
											/>

											<div className={`${item.className ? "" : "flex"} gap-1`}>
												<h4 className="font-noraml p5">{item.label}:</h4>{" "}
												{item.link ? (
													<a href={item.link} className="hover:underline">
														{item.value}
													</a>
												) : (
													item.value
												)}
											</div>
										</div>
									);
								})}
							</ul>
						</div>
						{/* Dynamic Sections */}
						{footerContent.sections?.map((sect, i) => (
							<section
								key={i}
								className="min-w-[150px]/ flex-1 md:flex-none lg:flex-1">
								<h5 className="h5 mb-4 md:mb-8 uppercase font-semibold text-sm md:text-base">
									{sect.title}
								</h5>
								<ul className="flex flex-col gap-2 md:gap-3">
									{sect.links?.map((link, index) => (
										<li
											key={index}
											className={`p4 text-sm md:text-base hover:underline ${
												link.text.includes("@") ? "lowercase" : "capitalize"
											}`}>
											{link.link ? (
												<BaseLink
													href={link.link}
													target={link.target || "_self"}>
													{link.text}
												</BaseLink>
											) : (
												link.text
											)}
										</li>
									))}
								</ul>
							</section>
						))}

						{/* Social Section */}
					</div>
				</section>

				<div className="pb-10 pt-12 max-md:pb-6 max-md:pt-8 p5 text-sm md:text-base flex justify-center items-center">
					{/* <section className="min-w-[150px] flex-1 md:flex-none lg:flex-1"> */}
					<ul className="flex flex-col/ gap-3 max-md:gap-2 text-2xl max-md:text-lg flex-wrap justify-center items-center text-primary">
						{SOCIAL_CONFIG.map(({ key, icon: Icon, label }) => {
							const href = store.socialLinks?.[key];
							if (!href) return null;

							return (
								<li key={key}>
									<BaseLink
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={label}
										className="
										flex items-center justify-center
										bg-light p-2.5 max-md:p-1.5 rounded-full
										transition-all duration-300
										hover:-translate-y-1
										hover:bg-secondary
										hover:text-light
									">
										<Icon />
									</BaseLink>
								</li>
							);
						})}
					</ul>
					{/* </section> */}
				</div>

				{/* Divider */}
				<div className="w-full h-[1px] rounded-full bg-light opacity-30 max-md:mt-0" />

				{/* Bottom Section */}
				<section className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left pt-4 pb-4 max-md:pb-20">
					<p className="p4 text-sm md:text-base">
						Copyright &copy; {currentYear} {store.companyName || store.name}.
						All rights reserved All rights reserved
					</p>
					<p className="p4 text-sm md:text-base text-light/80">
						Powered by:{" "}
						<Link
							href={"https://bananastudios.digital"}
							target="_blank"
							className=" text-light hover:border-b ">
							Banana Studios Digital
						</Link>
					</p>
				</section>
			</div>
		</footer>
	);
};

export default Footer;
