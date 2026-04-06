import Drawer from "rc-drawer";
import React, { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";

//internal import
import { SidebarContext } from "@/context/SidebarContext";

const MainDrawer = ({ children, product, setIsUpdate = () => {} }) => {
	const { toggleDrawer, isDrawerOpen, closeDrawer, windowDimension } =
		useContext(SidebarContext);
	const [isProduct, setIsProduct] = useState(false);

	const location = useLocation();

	useEffect(() => {
		if (
			location.pathname === "/roles" ||
			location.pathname === "/products" ||
			location.pathname === "/size-chart"
		) {
			setIsProduct(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Drawer
			open={isDrawerOpen}
			onClose={() => {
				closeDrawer();
				setIsUpdate(true);
			}}
			parent={null}
			level={null}
			placement={"right"}
			width={`${
				windowDimension <= 575 ? "100%" : product || isProduct ? "80%" : "50%"
			}`}>
			<button
				onClick={toggleDrawer}
				className="absolute focus:outline-none z-10 text-customRed-500 hover:bg-customRed-100 hover:text-customGray-700 transition-colors duration-150 bg-customWhite shadow-md mr-6 mt-6 right-0 left-auto w-10 h-10 rounded-full block text-center">
				<FiX className="mx-auto" />
			</button>

			<div className="flex flex-col w-full h-full justify-between bg-white">
				{children}
			</div>
		</Drawer>
	);
};

export default React.memo(MainDrawer);
