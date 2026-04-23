"use client";
import AppProviders from "@/app/providers/AppProviders";
import ReactQueryProvider from "@/app/providers/ReactQueryProvider";
import { NextIntlClientProvider } from "next-intl";
import Footer from "../../Themes/KidsTheme/Footer";
import Navbar from "../../Themes/KidsTheme/Navbar";
import BackToTop from "../BackToTop";
import MobileBottomNav from "../MobileBottomNav";
import WhatsAppButton from "../WhatsAppButton";
import { AuthProvider } from "@/app/providers/AuthProvider";

const Layout = ({ children, withFooter = true }) => {
	return (
		<>
			<ReactQueryProvider>
					<AppProviders>
						<AuthProvider>
							<Navbar />
							{children}
							<WhatsAppButton />
							<BackToTop />
							<MobileBottomNav />
							<Footer showOnMobile={withFooter} />
						</AuthProvider>
					</AppProviders>
			</ReactQueryProvider>
		</>
	);
};

export default Layout;
