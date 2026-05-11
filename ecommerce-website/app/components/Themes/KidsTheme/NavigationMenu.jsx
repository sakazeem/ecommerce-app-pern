import BaseLink from "@/app/components/BaseComponents/BaseLink";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import { useStore } from "@/app/providers/StoreProvider";
import MetadataService from "@/app/services/MetadataService";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NavigationMenu = ({ isMenuOpen, setIsMenuOpen }) => {
	const store = useStore();
	const [activeMenu, setActiveMenu] = useState(null);
	const [openIndex, setOpenIndex] = useState(null);
	const { data: navCategories, isLoading } = useFetchReactQuery(
		() => MetadataService.getNavCategories(),
		["navCategories"],
		{ enabled: true },
	);
	const { data: brands, isLoading: isBrandsLoading } = useFetchReactQuery(
		() => MetadataService.getBrands(),
		["brands"],
		{ enabled: true },
	);

	if (isLoading || isBrandsLoading) return null;

	return (
		<nav className="bg-primary text-light shadow-sm overflow-auto/">
			{/* Desktop Nav */}
			<ul className="hidden sm:flex flex-wrap items-center justify-between gap-4 pt-6 pb-2 container-layout">
				<li
					className={`
						relative pb-4
						text-sm sm:text-base font-medium
						after:content-['']
						after:absolute after:left-1/2 after:-translate-x-1/2
						after:bottom-2.5
						after:h-[2px] after:w-6 rounded-full
						after:bg-light
						after:scale-x-0
						after:origin-center
						after:transition-transform after:duration-300
						hover:after:scale-x-100
						hover:after:scale-x-100/
					`}>
					<BaseLink
						href={`/`}
						className="uppercase px-4 py-1 rounded-full transition">
						Home
					</BaseLink>
				</li>
				{(navCategories || []).map((item, index) => (
					<li
						key={index}
						// className="text-sm sm:text-base font-medium relative pb-4"
						className={`
						relative pb-4
						text-sm sm:text-base font-medium
						after:content-['']
						after:absolute after:left-1/2 after:-translate-x-1/2
						after:bottom-2.5
						after:h-[2px] after:w-6 rounded-full
						after:bg-light
						after:scale-x-0
						after:origin-center
						after:transition-transform after:duration-300
						hover:after:scale-x-100
						hover:after:scale-x-100/
						${activeMenu === index ? "after:scale-x-100" : ""}
						relative
					`}
						onMouseEnter={() => setActiveMenu(index)}
						onMouseLeave={() => setActiveMenu(null)}>
						{item.tag ? (
							<span className="absolute -top-4.5 -right-4 bg-secondary text-light text-sm px-3 py-0.25 rounded-full">
								{item.tag}
							</span>
						) : null}
						<BaseLink
							href={`${item.to || `/products?category=${item.slug}`}`}
							className="uppercase px-4 py-1 rounded-full transition">
							{item.title}
						</BaseLink>

						{item.children?.length > 0 && (
							<div
								className={`
								absolute
								top-12
								${index > 3 ? "right-0" : "left-0"}
								min-w-140
								text-primary
								bg-light
								py-5
								px-2
								transition-all
								duration-300
								ease-out
								transform
								shadow-md
								max-w-screen-lg
								overflow-x-auto
								${
									activeMenu === index
										? "opacity-100 translate-y-0/ translate-y-0 scale-100 pointer-events-auto"
										: "opacity-0 translate-y-4/ translate-y-2 scale-95 pointer-events-none"
								}
							`}>
								{item.children?.length > 0 && (
									<ul className="flex">
										{item.children.filter((cat) => cat.children?.length > 0)
											?.length > 0 ? (
											<>
												{item.children
													.filter((cat) => cat.children?.length > 0)
													.map((cat, i) => (
														<li key={i} className="px-4 flex-1 min-w-40 w-full">
															<h3 className="font-normal h7 uppercase text-primary border-b border-border-color whitespace-nowrap pb-1 mb-4">
																{cat.title}
															</h3>

															<ul className="space-y-1">
																{cat.children?.map((subCat, idx) => (
																	<li key={idx}>
																		<BaseLink
																			className="capitalize transition-colors text-primary hover:text-secondary"
																			href={`/products?category=${subCat.slug}`}>
																			{subCat.title}
																		</BaseLink>
																	</li>
																))}
															</ul>
														</li>
													))}
												{item.children.filter(
													(cat) => cat.children?.length === 0,
												).length > 0 && (
													<li className="px-4 flex-1 min-w-40">
														<h3 className="font-normal h7 uppercase text-primary border-b border-border-color whitespace-nowrap pb-1 mb-4">
															Shop By Category
														</h3>

														<ul className="space-y-1">
															{item.children
																.filter((cat) => cat.children?.length === 0)
																?.map((subCat, idx) => (
																	<li key={idx}>
																		<BaseLink
																			className="text-primary hover:text-secondary cursor-pointer capitalize transition-colors"
																			href={`/products?category=${subCat.slug}`}>
																			{subCat.title}
																		</BaseLink>
																	</li>
																))}
														</ul>
													</li>
												)}
											</>
										) : (
											<li className="px-4 flex-1 min-w-40">
												<h3 className="font-normal h7 uppercase text-primary border-b border-border-color whitespace-nowrap pb-1 mb-4">
													Shop By Category
												</h3>

												<ul className="space-y-1">
													{item.children?.map((subCat, idx) => (
														<li key={idx}>
															<BaseLink
																className="text-primary hover:text-secondary cursor-pointer capitalize transition-colors"
																href={`/products?category=${subCat.slug}`}>
																{subCat.title}
															</BaseLink>
														</li>
													))}
												</ul>
											</li>
										)}
										<li className="px-4 flex-1 min-w-40">
											<h3 className="font-normal h7 uppercase text-primary border-b border-border-color whitespace-nowrap pb-1 mb-4">
												Popular Brands
											</h3>

											<ul className="space-y-1">
												{brands?.map((brand, idx) => (
													<li key={idx}>
														<BaseLink
															href={`/products?brand=${brand.slug}`}
															className="text-primary hover:text-secondary
															cursor-pointer capitalize transition-colors">
															{brand.title}
														</BaseLink>
													</li>
												))}
											</ul>
										</li>
									</ul>
								)}
							</div>
						)}
					</li>
				))}
			</ul>

			{/* dark overlay */}
			{/* {isMenuOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-40 sm:hidden"
					onClick={() => setIsMenuOpen(false)}
				/>
			)} */}

			{/* Mobile Nav */}
			<div
				className={`sm:hidden fixed top-0 left-0 w-full bg-primary z-50
				transition-transform duration-300
				${isMenuOpen ? "translate-y-25" : "-translate-y-full"}
				h-full max-h-[calc(100vh-100px)] overflow-y-auto`}>
				<ul className="p-4/ space-y-2/">
					{(navCategories || []).map((item, index) => (
						<li key={index}>
							<div
								onClick={() => setOpenIndex(openIndex === index ? null : index)}
								className={`flex items-center justify-between py-4 px-4
								transition-colors cursor-pointer
								${openIndex === index ? "bg-secondary/5" : "bg-transparent"}
								border-b border-border-color/70`}>
								<BaseLink
									href={item.to || `/products?category=${item.slug}`}
									onClick={() => setIsMenuOpen(false)}
									className="uppercase text-sm font-semibold tracking-wide">
									{item.title}
								</BaseLink>

								{item.children?.length > 0 && (
									<ChevronDown
										size={18}
										className={`transition-transform duration-300
										${openIndex === index ? "rotate-180 text-secondary" : "text-light/70"}`}
									/>
								)}
							</div>

							{item.children?.length > 0 && (
								<div
									className={`overflow-hidden transition-all duration-300
									${openIndex === index ? "max-h-[1200px] mt-2" : "max-h-0"}`}>
									{item.children.filter((cat) => cat.children?.length > 0)
										.length > 0 ? (
										item.children.map((cat, i) => (
											<div
												key={i}
												className="ml-3/ pl-3/ py-3 border-b border-border-color/25">
												<h4 className="text-sm font-medium uppercase mb-3 tracking-wider border-b border-border-color/25 pl-6 pb-2 text-light/80">
													{cat.title}
												</h4>

												<ul className="space-y-2 pl-8">
													{cat.children?.map((subCat, idx) => (
														<li key={idx}>
															<Link
																href={`/products?category=${subCat.slug}`}
																onClick={() => setIsMenuOpen(false)}>
																{subCat.title}
															</Link>
														</li>
													))}
												</ul>
											</div>
										))
									) : (
										<div className="ml-3/ pl-3/ py-3 border-b border-border-color/25">
											<h4 className="text-sm font-medium uppercase mb-3 tracking-wider border-b border-border-color/25 pl-6 pb-2 text-light/80">
												Shop By Category
											</h4>

											<ul className="space-y-2 pl-8">
												{item.children?.map((subCat, idx) => (
													<li key={idx}>
														<Link
															href={`/products?category=${subCat.slug}`}
															className="text-sm text-light/70 hover:text-secondary transition-colors cursor-pointer"
															onClick={() => setIsMenuOpen(false)}>
															{subCat.title}
														</Link>
													</li>
												))}
											</ul>
										</div>
									)}
									<div className="ml-3/ pl-3/ py-3 border-b border-border-color/25">
										<h4 className="text-sm font-medium uppercase mb-3 tracking-wider border-b border-border-color/25 pl-6 pb-2 text-light/80">
											Popular Brands
										</h4>

										<ul className="space-y-2 pl-8">
											{brands?.map((brand, idx) => (
												<li key={idx}>
													<Link
														href={`/products?brand=${brand.slug}`}
														onClick={() => setIsMenuOpen(false)}
														className="text-sm text-light/70 hover:text-secondary transition-colors cursor-pointer">
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

export default NavigationMenu;
