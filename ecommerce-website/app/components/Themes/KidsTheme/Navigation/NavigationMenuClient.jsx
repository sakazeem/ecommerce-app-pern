"use client";

import { useState } from "react";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import { useStore } from "@/app/providers/StoreProvider";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const NavigationMenuClient = ({
	isMenuOpen,
	setIsMenuOpen,
	navCategories = [],
	brands = [],
}) => {
	const store = useStore();

	const [activeMenu, setActiveMenu] = useState(null);
	const [openIndex, setOpenIndex] = useState(null);

	return (
		<nav className="bg-primary text-light shadow-sm overflow-auto/">
			{/* ================= DESKTOP NAV ================= */}
			<ul className="hidden sm:flex flex-wrap items-center justify-between gap-4 pt-6 pb-2 container-layout">
				{/* Home */}
				<li className="relative pb-4 text-sm sm:text-base font-medium after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-2.5 after:h-[2px] after:w-6 after:bg-light after:scale-x-0 after:transition-transform hover:after:scale-x-100">
					<BaseLink
						href="/"
						className="uppercase px-4 py-1 rounded-full transition">
						Home
					</BaseLink>
				</li>

				{/* Categories */}
				{navCategories.map((item, index) => (
					<li
						key={index}
						className={`relative pb-4 text-sm sm:text-base font-medium after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-2.5 after:h-[2px] after:w-6 after:bg-light after:scale-x-0 after:transition-transform hover:after:scale-x-100 ${
							activeMenu === index ? "after:scale-x-100" : ""
						}`}
						onMouseEnter={() => setActiveMenu(index)}
						onMouseLeave={() => setActiveMenu(null)}>
						{/* Tag */}
						{item.tag && (
							<span className="absolute -top-4.5 -right-4 bg-secondary text-light text-sm px-3 py-0.25 rounded-full animate-blink">
								{item.tag}
							</span>
						)}

						<BaseLink
							href={item.to || `/products?category=${item.slug}`}
							className="uppercase px-4 py-1 rounded-full transition">
							{item.title}
						</BaseLink>

						{/* ================= DROPDOWN ================= */}
						{item.children?.length > 0 && (
							<div
								className={`absolute top-12 ${
									index > 3 ? "right-0" : "left-0"
								} min-w-140 text-primary bg-light py-5 px-2 shadow-md transition-all duration-300 overflow-x-auto ${
									activeMenu === index
										? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
										: "opacity-0 translate-y-2 scale-95 pointer-events-none"
								}`}>
								<ul className="flex">
									{/* Nested categories */}
									{item.children?.filter((cat) => cat.children?.length > 0)
										?.length > 0 && (
										<>
											{item.children
												.filter((cat) => cat.children?.length > 0)
												.map((cat, i) => (
													<li key={i} className="px-4 flex-1 min-w-40">
														<h3 className="font-normal h7 uppercase border-b pb-1 mb-4">
															{cat.title}
														</h3>

														<ul className="space-y-1">
															{cat.children?.map((subCat, idx) => (
																<li key={idx}>
																	<BaseLink
																		className="capitalize hover:text-secondary transition-colors"
																		href={`/products?category=${subCat.slug}`}>
																		{subCat.title}
																	</BaseLink>
																</li>
															))}
														</ul>
													</li>
												))}

											{/* Flat categories */}
											{item.children.filter((cat) => !cat.children?.length)
												.length > 0 && (
												<li className="px-4 flex-1 min-w-40">
													<h3 className="font-normal h7 uppercase border-b pb-1 mb-4">
														Shop By Category
													</h3>

													<ul className="space-y-1">
														{item.children
															.filter((cat) => !cat.children?.length)
															.map((subCat, idx) => (
																<li key={idx}>
																	<BaseLink
																		className="capitalize hover:text-secondary transition-colors"
																		href={`/products?category=${subCat.slug}`}>
																		{subCat.title}
																	</BaseLink>
																</li>
															))}
													</ul>
												</li>
											)}
										</>
									)}

									{/* Brands */}
									<li className="px-4 flex-1 min-w-40">
										<h3 className="font-normal h7 uppercase border-b pb-1 mb-4">
											Popular Brands
										</h3>

										<ul className="space-y-1">
											{brands.map((brand, idx) => (
												<li key={idx}>
													<BaseLink
														href={`/products?brand=${brand.slug}`}
														className="hover:text-secondary capitalize transition-colors">
														{brand.title}
													</BaseLink>
												</li>
											))}
										</ul>
									</li>
								</ul>
							</div>
						)}
					</li>
				))}
			</ul>

			{/* ================= MOBILE NAV ================= */}
			<div
				className={`sm:hidden fixed top-0 left-0 w-full bg-primary z-50 transition-transform duration-300 ${
					isMenuOpen ? "translate-y-25" : "-translate-y-full"
				} h-full max-h-[calc(100vh-100px)] overflow-y-auto`}>
				<ul className="space-y-2">
					{navCategories.map((item, index) => (
						<li key={index}>
							{/* Header */}
							<div
								onClick={() => setOpenIndex(openIndex === index ? null : index)}
								className={`flex items-center justify-between py-4 px-4 border-b cursor-pointer ${
									openIndex === index ? "bg-secondary/5" : ""
								}`}>
								<BaseLink
									href={item.to || `/products?category=${item.slug}`}
									onClick={() => setIsMenuOpen(false)}
									className="uppercase text-sm font-semibold">
									{item.title}
								</BaseLink>

								{item.children?.length > 0 && (
									<ChevronDown
										size={18}
										className={`transition-transform ${
											openIndex === index ? "rotate-180" : ""
										}`}
									/>
								)}
							</div>

							{/* Dropdown */}
							{item.children?.length > 0 && (
								<div
									className={`overflow-hidden transition-all duration-300 ${
										openIndex === index ? "max-h-[1200px] mt-2" : "max-h-0"
									}`}>
									<ul className="pl-6 space-y-2">
										{item.children.map((subCat, idx) => (
											<li key={idx}>
												<Link
													href={`/products?category=${subCat.slug}`}
													onClick={() => setIsMenuOpen(false)}
													className="text-sm text-light/80 hover:text-secondary">
													{subCat.title}
												</Link>
											</li>
										))}
									</ul>

									{/* Brands */}
									<div className="mt-4 pl-6">
										<h4 className="text-sm uppercase mb-2">Brands</h4>

										<ul className="space-y-2">
											{brands.map((brand, idx) => (
												<li key={idx}>
													<Link
														href={`/products?brand=${brand.slug}`}
														onClick={() => setIsMenuOpen(false)}
														className="text-sm text-light/70 hover:text-secondary">
														{brand.title}
													</Link>
												</li>
											))}
										</ul>
									</div>
								</div>
							)}
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
};

export default NavigationMenuClient;
