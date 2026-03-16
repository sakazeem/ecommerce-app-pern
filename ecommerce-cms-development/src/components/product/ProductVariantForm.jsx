import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import AttributeServices from "@/services/AttributeServices";
import { useEffect, useRef, useState } from "react";
import InputMultipleSelectField from "../form/fields/InputMultipleSelectField";
import VariantTable from "./VariantTable";
import ProductServices from "@/services/ProductServices";

const tempShowingTranslateValue = (data) => {
	if (!data) return "";
	return data["en"] ?? "";
	return (data) => {
		if (!data || typeof data !== "object") return ""; // Handle undefined or non-object cases
	};
};

function transformProductForEdit(product = [], settings) {
	if (!product.length) {
		return { variantDetails: [], defaultValues: {}, attributes: [] };
	}

	const attributesMap = new Map();
	let defaultValues = {};

	const variantDetails = product.map((v, index) => {
		const branchData = v.branches?.[0]?.pvb ?? {};

		// Build attributes
		v.attributes?.forEach((attr) => {
			if (!attributesMap.has(attr.id)) {
				attributesMap.set(attr.id, {
					id: attr.id,
					name: tempShowingTranslateValue(attr.name),
					values: [],
				});
			}

			const attrEntry = attributesMap.get(attr.id);
			const valueEn = attr.pva?.value?.en;

			if (valueEn && !attrEntry.values.some((val) => val.en === valueEn)) {
				attrEntry.values.push(attr.pva.value);
			}
		});

		// Set default values once (from first variant)
		if (index === 0) {
			defaultValues = {
				costPrice: branchData.cost_price ?? null,
				salePrice: branchData.sale_price ?? null,
				stock: branchData.stock ?? null,
				lowStock: branchData.low_stock ?? null,
				reorderQty: branchData.reorder_quantity ?? null,
				discount: branchData.discount_percentage ?? null,
				imageId: v.image ?? null,
				imageUrl: v.medium?.url
					? import.meta.env.VITE_APP_CLOUDINARY_URL + v.medium.url
					: null,
			};
		}

		return {
			sku: v.sku,
			imageId: v.image,
			imageUrl: v.medium?.url
				? import.meta.env.VITE_APP_CLOUDINARY_URL + v.medium.url
				: null,
			costPrice: branchData.cost_price ?? null,
			stock: branchData.stock ?? null,
			lowStock: branchData.low_stock ?? null,
			reorderQty: branchData.reorder_quantity ?? null,
			salePrice: branchData.sale_price ?? null,
			discount: branchData.discount_percentage ?? null,
			combo:
				v.attributes?.map((c) => ({
					id: c.id,
					value: c.pva?.value,
				})) ?? [],
			name:
				v.attributes
					?.map((c) => `${c.name?.en}:${c.pva?.value?.en}`)
					.join(", ") ?? "",
		};
	});

	return {
		variantDetails,
		defaultValues,
		attributes: Array.from(attributesMap.values()),
	};
}

const ProductVariantForm = ({
	productVariants,
	setVariantsToSend,
	defaultValues,
	setDefaultValues,
	finalVariants,
	setFinalVariants,
	resetKey,
	sku,
	variantImagesOptions,
}) => {
	const { showingTranslateValue } = useUtilsFunction();
	const { settings } = useGlobalSettings();

	const [attributes, setAttribtes] = useState([]);
	const [selectedVariants, setSelectedVariants] = useState([]);
	const [defaultVariants, setDefaultVariants] = useState([]);
	const [generatedVariants, setGeneratedVariants] = useState([]);
	const isInitialEditLoad = useRef(true);

	console.log(generatedVariants, "chkking generatedVariants");

	useEffect(() => {
		AttributeServices.getActiveAttributes().then((v) =>
			setAttribtes(v.records),
		);
	}, []);

	const handleDeleteVariant = (idx) => {
		setFinalVariants((prev) => prev.filter((_, i) => i !== idx));
	};

	const handleVariantsUpdate = (variants) => {
		setFinalVariants(variants);
	};

	useEffect(() => {
		const tempArr = finalVariants?.map((v) => {
			console.log(v, "chkking vvv");

			return {
				sku: v.sku,
				image: v.imageId,
				branch_data: [
					{
						branch_id: settings.defaultBranchId,
						cost_price: v.costPrice ? parseFloat(v.costPrice) : null,
						stock: v.stock ? parseInt(v.stock) : null,
						low_stock: v.lowStock ? parseInt(v.lowStock) : null,
						reorder_quantity: v.reorderQty ? parseInt(v.reorderQty) : null,
						// stock: v.stock ? parseInt(v.stock) : null,
						// low_stock: v.lowStock ? parseInt(v.lowStock) : null,
						// reorder_quantity: v.reorderQty ? parseInt(v.reorderQty) : null,
						sale_price: v.salePrice ? parseFloat(v.salePrice) : null,
						discount_percentage: v.discount ? parseFloat(v.discount) : null,
					},
				],
				attribute_data: v.combo?.map((c) => {
					return {
						attribute_id: c.id,
						value: c.value,
					};
				}),
			};
		});
		setVariantsToSend(tempArr);
	}, [finalVariants, settings.defaultBranchId]);

	// only for setting defaultValue to attributesInput feild
	const sameCombo = (a, b) => {
		if (!a.combo || !b.combo) return false;

		return a.combo.every((aItem) => {
			const bItem = b.combo.find((x) => x.id === aItem.id);
			if (!bItem) return false;

			return aItem.value.en === bItem.value.en;
		});
	};
	useEffect(() => {
		console.log("chkking prev111 call222");

		const { variantDetails, defaultValues, attributes } =
			transformProductForEdit(productVariants);
		setDefaultVariants(attributes);
		setGeneratedVariants(variantDetails);
		setDefaultValues({
			...defaultValues,
		});
		// ⭐ populate selectedVariants for edit
		const populatedSelectedVariants = attributes.map((attr) => ({
			id: attr.id,
			name: attr.name,
			values: attr.values,
		}));

		setSelectedVariants(populatedSelectedVariants);
		isInitialEditLoad.current = true;
	}, [productVariants]);

	console.log(selectedVariants, "chkking selected variants");

	// useEffect(() => {
	// 	if (selectedVariants.length > 0) {
	// 		setGeneratedVariants(generateVariants(selectedVariants, sku));
	// 	}
	// }, [selectedVariants]);
	useEffect(() => {
		if (selectedVariants.length === 0) return;

		// 🚫 Skip during initial edit load
		if (isInitialEditLoad.current) {
			isInitialEditLoad.current = false;
			return;
		}

		const newGenerated = generateVariants(selectedVariants, sku);
		console.log(selectedVariants, "chkking selected variants");

		setGeneratedVariants((prev) => {
			return newGenerated.map((newVariant) => {
				// const existing = prev.find((v) => v.name === newVariant.name);
				const existing = prev.find((v) => sameCombo(v, newVariant));
				// const existing = prev.find((v) => sameCombo(v, newVariant));
				console.log(
					{ selectedVariants, existing, prev, newVariant },
					"chkking prev111",
				);

				// Preserve existing values
				if (existing) {
					return {
						...existing,
						...newVariant,
					};
				}

				return newVariant;
			});
		});
	}, [selectedVariants]);

	//reset all states after drawer close
	useEffect(() => {
		setSelectedVariants([]);
		setDefaultVariants([]);
		setGeneratedVariants([]);
	}, [resetKey]);

	console.log(
		{ selectedVariants, generatedVariants },
		"chkkin generatedVariants",
	);

	return (
		<section className="flex flex-col gap-8">
			{/* Variants Section */}
			<section className="w-full relative p-6 rounded-lg border">
				<h3 className="font-semibold text-2xl h3 mb-4">Product Attributes</h3>
				<div className="grid grid-cols-1 gap-x-16 gap-y-6 items-end mt-8">
					{attributes?.map((v, i) => {
						const isSizeAttribute = v.name?.en?.toLowerCase() === "size";

						// Find currently selected values for this attribute
						const selectedForThisAttr =
							selectedVariants.find((variant) => variant.id === v.id)?.values ||
							[];

						// remove showingTranslateValue with all v.name later
						return (
							<>
								<InputMultipleSelectField
									key={v.id}
									label={`Select available ${showingTranslateValue(v.name)}:`}
									inputPlaceholder={`Select available ${showingTranslateValue(
										v.name,
									)}`}
									options={v.values?.map((pCat) => ({
										id: pCat,
										name: showingTranslateValue(pCat),
									}))}
									defaultSelected={v.values
										?.map((pCat) => ({
											id: pCat,
											name: showingTranslateValue(pCat),
										}))
										.filter((opt) => {
											return defaultVariants
												.find((dv) => dv.id === v.id)
												?.values?.map((val) => val.en?.toLowerCase())
												.includes(opt.name.toLowerCase());
										})}
									onChange={(selectedList) => {
										setSelectedVariants((prev) => {
											const foundIndex = prev.findIndex(
												(variant) => variant.id === v.id,
											);
											if (foundIndex !== -1) {
												const updated = [...prev];
												updated[foundIndex] = {
													...updated[foundIndex],
													values: selectedList.map((v) => v.id),
												};
												return updated;
											} else {
												return [
													...prev,
													{
														id: v.id,
														name: showingTranslateValue(v.name),
														values: selectedList.map((v) => v.id),
													},
												];
											}
										});
									}}
									isHandleChange={false}
									isVertical
								/>
								{/* SKU inputs if size attribute has more than 1 selected value */}
								{/* {isSizeAttribute && selectedForThisAttr.length > 1 && (
									<div className="mt-2 flex flex-col gap-2">
										<p className="font-semibold">Enter SKUs for each size:</p>
										{selectedForThisAttr.map((sizeValue, idx) => (
											<div
												className="flex items-end gap-2"
												key={sizeValue.en || sizeValue}>
												<label
													htmlFor={`sku-${sizeValue.en || sizeValue}`}
													className="capitalize mb-2">
													{`sku-${sizeValue.en || sizeValue}`}:
												</label>
												<input
													type="text"
													placeholder={`SKU for ${sizeValue.en || sizeValue}`}
													className="border p-2 rounded w-1/2"
													id={`sku-${sizeValue.en || sizeValue}`}
													// value={
													// 	selectedVariants.find((v) => v.id === v.id)
													// 		?.valuesWithSKU?.[sizeValue.en || sizeValue] || ""
													// }
													onChange={(e) => {
														setSelectedVariants((prev) =>
															prev.map((attr) => {
																if (attr.id !== v.id) return attr;
																return {
																	...attr,
																	valuesWithSKU: {
																		...(attr.valuesWithSKU || {}),
																		[sizeValue.en || sizeValue]: e.target.value,
																	},
																};
															}),
														);
													}}
												/>
											</div>
										))}
									</div>
								)} */}
							</>
						);
					})}
				</div>

				{/* Variants Table */}
				{generatedVariants && generatedVariants.length > 0 && (
					<div className="mt-8">
						<VariantTable
							selectedVariants={selectedVariants}
							defaultValues={defaultValues}
							onDelete={handleDeleteVariant}
							onUpdate={handleVariantsUpdate}
							generatedVariants={generatedVariants} // 🔑 so parent always has final values
							variantImagesOptions={variantImagesOptions}
						/>
					</div>
				)}
			</section>
		</section>
	);
};

export default ProductVariantForm;

// Helper to generate variant combos with short meaningful SKUs
export function generateVariants(
	selectedVariants,
	baseSKU = "SKU",
	selectedLanguage = "en",
) {
	if (!selectedVariants || selectedVariants.length === 0) return [];
	selectedVariants = selectedVariants.filter(
		(v) => v.values && v.values.length > 0,
	); // filter out attributes with no selected values

	const attributes = selectedVariants.map((attr) =>
		attr.values.map((v) => ({
			id: attr.id,
			name: attr.name,
			value: v,
			sku: attr.valuesWithSKU?.[v[selectedLanguage]] || null, // user-entered SKU
		})),
	);
	// Cartesian product helper
	const cartesian = (arr) =>
		arr.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);

	return cartesian(attributes).map((combo, idx) => {
		return {
			name: combo
				.map((c) => `${c.name}: ${c.value[selectedLanguage]}`)
				.join(", "),
			combo,
			sku:
				combo.filter((c) => c.sku)[0]?.sku ||
				baseSKU ||
				`${baseSKU || "SKU"}-${idx + 1}`,
			// sku: `${baseSKU}-${idx + 1}222`,
		};
	});
}
