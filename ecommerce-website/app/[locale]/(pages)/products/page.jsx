import React from "react";
import ProductsPage from ".";
import Layout from "@/app/components/Shared/layout/Layout";

const Products = () => {
	return (
		<Layout withFooter={false}>
		{/*  <Layout> */}
			<ProductsPage />
		</Layout>
	);
};

export default Products;
