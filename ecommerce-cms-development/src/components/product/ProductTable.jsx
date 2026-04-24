import { Avatar, TableBody, TableCell, TableRow } from "@windmill/react-ui";

//internal import

import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import noImage from "@/assets/img/no-image.png";

const ProductTable = ({
	data,
	toggleDrawerData,
	isCheck,
	setIsCheck,
	useParamId,
}) => {
	const { title, serviceId, handleModalOpen, handleUpdate } = toggleDrawerData;
	const { showingTranslateValue } = useUtilsFunction();

	const handleClick = (e) => {
		const { id, checked } = e.target;
		setIsCheck([...isCheck, parseInt(id)]);
		if (!checked) {
			setIsCheck(isCheck.filter((item) => item !== parseInt(id)));
		}
	};

	return (
		<>
			{isCheck?.length < 1 && (
				<DeleteModal useParamId={useParamId} id={serviceId} title={title} />
				// <DeleteModal useParamId={useParamId} id={serviceId} title={title} />
			)}

			<TableBody>
				{data?.map((product) => (
					<TableRow
						key={product.id}
						className={
							product?.categories?.find((v) => !v.is_leaf) ||
							product?.categories?.find((v) => v.level === 1)
								? "bg-red-200"
								: ""
						}>
						<TableCell className="font-semibold uppercase text-xs">
							{product?.id}
						</TableCell>
						<TableCell className="text-sm flex items-center gap-4 max-w-74 whitespace-break-spaces">
							{product?.thumbnailImage?.url ? (
								<Avatar
									size="large"
									className="hidden md:block bg-customGray-50 p-1 object-contain min-w-16"
									src={
										import.meta.env.VITE_APP_CLOUDINARY_URL +
										product?.thumbnailImage?.url
									}
									alt={product?.product_translations[0]?.title}
								/>
							) : (
								<Avatar
									size="large"
									src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
									alt="product"
									className="hidden p-1 md:block bg-customGray-50 shadow-none object-contain min-w-16"
								/>
							)}
							<p className="flex-[5]">
								{product?.product_translations[0]?.title}
								<br />
								<span className="text-xs italic">
									{product?.product_translations[0]?.slug}
								</span>
							</p>
						</TableCell>
						<TableCell className="text-sm">{product?.sku || "-"}</TableCell>
						<TableCell className="text-sm">
							{product?.brand?.translations
								? product?.brand?.translations[0]?.title
								: "-"}
						</TableCell>
						<TableCell className="text-sm">
							{product?.categories?.length > 0
								? product.categories
										.map((cat) => cat.translations[0]?.title)
										.join(", ")
								: "-"}
						</TableCell>
						<TableCell className="text-sm max-w-32 whitespace-break-spaces">
							{!product?.product_variants ||
							product.product_variants.length === 0
								? "No variant found"
								: product.product_variants.length === 1
									? (() => {
											const stock =
												product.product_variants[0]?.branches?.[0]?.pvb
													?.stock ?? 0;
											const lowStock =
												product.product_variants[0]?.branches?.[0]?.pvb
													?.low_stock ?? 0;
											const isLow = stock < lowStock;

											return (
												<span
													className={isLow ? "text-red-600 font-medium" : ""}>
													{stock}
													{isLow && " (Low)"}
												</span>
											);
										})()
									: product.product_variants
											.map((variant) => {
												const size = variant.attributes?.find(
													(attr) => attr.name?.en === "size",
												)?.pva?.value?.en;

												const stock = variant.branches?.[0]?.pvb?.stock ?? 0;
												const lowStock =
													variant.branches?.[0]?.pvb?.low_stock ?? 0;

												const isLow = stock < lowStock;

												const content = (
													<span
														className={isLow ? "text-red-600 font-medium" : ""}>
														{size && size !== "-" ? `${size}(${stock})` : stock}
														{isLow && " Low"}
													</span>
												);

												return content;
											})
											.reduce((prev, curr, index) => [
												prev,
												<span key={index}>, </span>,
												curr,
											])}
						</TableCell>
						<TableCell className="text-sm max-w-24 whitespace-break-spaces">
							{!product?.product_variants ||
							product.product_variants.length === 0
								? "No variant found"
								: product.product_variants.length === 1
									? (product.product_variants[0]?.branches?.[0]?.pvb
											?.low_stock ?? 0)
									: product.product_variants
											.map((variant) => {
												const size = variant.attributes?.find(
													(attr) => attr.name?.en === "size",
												)?.pva?.value?.en;

												const low_stock =
													variant.branches?.[0]?.pvb?.low_stock ?? 0;

												return size && size !== "-"
													? `${size}(${low_stock})`
													: low_stock;
											})
											.join(", ")}
						</TableCell>
						<TableCell className="text-center">
							<ShowHideButton id={product.id} product status={product.status} />
						</TableCell>
						<TableCell>
							<EditDeleteButton
								id={product?.id}
								parent={product}
								isCheck={isCheck}
								children={product?.children}
								handleUpdate={handleUpdate}
								handleModalOpen={handleModalOpen}
								title={showingTranslateValue(product?.name)}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</>
	);
};

export default ProductTable;
