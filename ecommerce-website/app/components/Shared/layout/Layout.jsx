"use client";
import { useStore } from "@/app/providers/StoreProvider";
import Footer from "../../Themes/KidsTheme/Footer";
import Navbar from "../../Themes/KidsTheme/Navbar";
import BackToTop from "../BackToTop";
import MobileBottomNav from "../MobileBottomNav";
import WhatsAppButton from "../WhatsAppButton";
import ReactQueryProvider from "@/app/providers/ReactQueryProvider";
import { NextIntlClientProvider } from "next-intl";
import AppProviders from "@/app/providers/AppProviders";
import { AuthProvider } from "@/app/providers/AuthProvider";

const Layout = ({ children, withFooter = true }) => {
	return (
		<>
			<ReactQueryProvider>
				<NextIntlClientProvider>
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
				</NextIntlClientProvider>
			</ReactQueryProvider>
		</>
	);
};

export default Layout;
