const AboutUsSection = () => {
	return (
		<div className="bg-[#e9e9e9] section-layout">
			<section className="container-layout grid grid-cols-1 md:grid-cols-2 justify-between gap-23 max-md:gap-8 items-stretch">
				<div className="text-dark flex flex-col gap-6 max-md:gap-4">
					<h2 className="h3 font-medium">Online Baby Store in Pakistan</h2>
					<p className="p3 tracking-wide font-light text-justify">
						<b className="whitespace-nowrap">Babies n Baba</b> is your trusted
						one-stop shop for baby and toddler essentials in Pakistan. We offer
						top-quality brands at great prices with fast, reliable nationwide
						delivery. From fashion clothing, toys, and baby care
						products—everything you need to keep your little one safe,
						comfortable, and happy.
					</p>
				</div>
				<div className="text-dark flex flex-col gap-6 max-md:gap-4">
					<h2 className="h3 font-medium">
						Babies n Baba - Baby Products Online Shopping
					</h2>
					<p className="p3 tracking-wide font-light text-justify">
						Shopping for your little ones is now easy with{" "}
						<b className="whitespace-nowrap">Babies n Baba</b>. Discover trusted
						baby products at affordable prices, with exciting deals and
						discounts. Browse essentials, clothing, toys, and more, with Cash on
						Delivery available. Enjoy hassle-free returns and refunds. Free
						delivery on orders above Rs. 3000; Rs. 200 delivery fee applies
						below.
					</p>
				</div>
			</section>
		</div>
	);
};

export default AboutUsSection;
