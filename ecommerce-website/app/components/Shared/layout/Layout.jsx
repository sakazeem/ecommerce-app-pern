"use client";
import AppProviders from "@/app/providers/AppProviders";
import ReactQueryProvider from "@/app/providers/ReactQueryProvider";
import Footer from "../../Themes/KidsTheme/Footer";
import Navbar from "../../Themes/KidsTheme/Navbar";
import BackToTop from "../BackToTop";
import MobileBottomNav from "../MobileBottomNav";
import WhatsAppButton from "../WhatsAppButton";

const Layout = ({ children, withFooter = true }) => {
	return (
		<>
			<ReactQueryProvider>
				<AppProviders>
					<Navbar />
					{children}
					<WhatsAppButton />
					<BackToTop />
					<MobileBottomNav />
					<Footer showOnMobile={withFooter} />
				</AppProviders>
			</ReactQueryProvider>
		</>
	);
};

export default Layout;
