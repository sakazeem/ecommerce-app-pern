"use client";
import { useStore } from "@/app/providers/StoreProvider";
import Footer from "../../Themes/KidsTheme/Footer";
import Navbar from "../../Themes/KidsTheme/Navbar";
import BackToTop from "../BackToTop";
import MobileBottomNav from "../MobileBottomNav";
import WhatsAppButton from "../WhatsAppButton";

const Layout = ({ children, withFooter = true }) => {
	const store = useStore();
	return (
		<>
			<Navbar />
			{children}
			<WhatsAppButton />
			<BackToTop />
			<MobileBottomNav />
			<Footer showOnMobile={withFooter} />
		</>
	);
};

export default Layout;
