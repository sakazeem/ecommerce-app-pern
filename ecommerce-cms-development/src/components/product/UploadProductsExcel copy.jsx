import AttributeServices from "@/services/AttributeServices";
import ProductServices from "@/services/ProductServices";
import { Button } from "@windmill/react-ui";
import { Upload, FileSpreadsheet, Package } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { excelFeilds } from "./excelFields";
import { Es } from "react-flags-select";

const UploadProductsExcel = () => {
	const safeStr = (val) =>
		val !== undefined && val !== null ? String(val).trim() : "";

	const toNumber = (val, def = null) =>
		val !== undefined && val !== null && val !== "" && !isNaN(Number(val))
			? Number(val)
			: def;

	// ---------- VALIDATION HELPERS ----------
	const isEmpty = (val) =>
		val === undefined || val === null || String(val).trim() === "";

	const isValidFloat = (val) =>
		val !== undefined && val !== null && val !== "" && !isNaN(Number(val));

	const isValidFloatOrNull = (val) =>
		val === undefined || val === null || val === "" || !isNaN(Number(val));
	const parseSizesWithSku = (value) => {
		if (!value) return [];

		return value
			.split(",")
			.map((item) => {
				const trimmed = item.trim();
				const match = trimmed.match(/^([^(]+)(?:\(([^)]+)\))?$/);

				if (!match) return null;

				return {
					size: match[1].trim(),
					sku: match[2] ? match[2].trim() : null,
				};
			})
			.filter(Boolean);
	};

	const parsePrice = (val) => {
		const priceWithSku = parseSizesWithSku(safeStr(val));
		const price = priceWithSku[0]?.sku;

		return {
			price,
			priceWithSku: priceWithSku,
		};
	};

	// ---------- ROW VALIDATOR ----------
	const validateRow = (row, excelRowNumber) => {
		const errors = [];

		// Required string fields
		const requiredFields = [
			{ key: excelFeilds.sku, name: "sku" },
			{ key: excelFeilds.meta_title, name: "meta_title" },
			{ key: excelFeilds.meta_description, name: "meta_description" },
			{ key: excelFeilds.title, name: "title" },
			{ key: excelFeilds.excerpt, name: "excerpt" },
			{ key: excelFeilds.slug, name: "slug" },
		];

		requiredFields.forEach((field) => {
			if (isEmpty(row[field.key])) {
				errors.push(
					`Row ${excelRowNumber}: Required field '${field.name}' is missing`,
				);
			}
		});

		// Required FLOAT fields
		if (!isValidFloat(parsePrice(row[excelFeilds.price]).price)) {
			errors.push(`Row ${excelRowNumber}: price must be a valid number`);
		}
		const parsedDiscount = parsePercentToNumber(
			safeStr(row[excelFeilds.discount]),
		);
		if (safeStr(row[excelFeilds.discount]) && parsedDiscount === null) {
			errors.push(
				`Row ${excelRowNumber}: discount must be a number or percentage (e.g. 20 or 20%)`,
			);
		}

		if (
			parsedDiscount !== null &&
			(parsedDiscount < 0 || parsedDiscount > 100)
		) {
			errors.push(`Row ${excelRowNumber}: discount must be between 0 and 100`);
		}

		return errors;
	};

	const buildHtmlDescription = (description, additionalInfo) => {
		let html = "";

		// Main description paragraph
		if (description && description.trim()) {
			html += `<p>${description.trim()}</p>\n`;
		}

		// Bullet points from "Additional info"
		if (additionalInfo && additionalInfo.trim()) {
			const lines = additionalInfo
				.split("\n")
				.map((line) => line.replace("•", "").trim())
				.filter(Boolean);

			if (lines.length) {
				html += "<p><strong>Key Features</strong></p>\n";
				html += "<ul>\n";
				lines.forEach((line) => {
					html += `  <li>${line}</li>\n`;
				});
				html += "</ul>";
			}
		}

		return html.trim();
	};

	// const parsePercentToNumber = (val) => {
	// 	if (val === undefined || val === null || val === "") return null;

	// 	// If already a number (Excel sometimes does this)
	// 	if (typeof val === "number") return val;

	// 	const cleaned = String(val).replace("%", "").trim();

	// 	const num = Number(cleaned);

	// 	return isNaN(num) ? null : num * 100;
	// };

	const parsePercentToNumber = (val) => {
		if (val === undefined || val === null || val === "") return null;

		// If Excel formatted percentage (0.1 meaning 10%)
		if (typeof val === "number") {
			// If value is between 0 and 1 → treat as percentage
			if (val > 0 && val < 1) {
				return val * 100;
			}
			return val; // already normal number like 10
		}

		const cleaned = String(val).replace("%", "").trim();
		const num = Number(cleaned);

		return isNaN(num) ? null : num;
	};

	const [loading, setLoading] = useState(false);
	const [filterAttributes, setFilterAttributes] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [messages, setMessages] = useState([]);
	const [uploadStats, setUploadStats] = useState(null);

	useEffect(() => {
		AttributeServices.getFilterAttributes()
			.then((res) => {
				setFilterAttributes(res);
			})
			.catch((err) => {
				addMessage("error", `Error fetching attributes: ${err.message || err}`);
			});
	}, []);

	const addMessage = (type, text) => {
		setMessages((prev) => [...prev, { type, text, id: Date.now() }]);
	};

	const resetModal = () => {
		setMessages([]);
		setUploadStats(null);
		setLoading(false);
	};

	const parseMultiValues = (value) => {
		if (!value) return [];
		return value
			.split(",")
			.map((v) => v.trim())
			.filter(Boolean);
	};

	// const parseStockWithSku = (value) => {
	// 	if (!value) return [];

	// 	return value
	// 		.split(",")
	// 		.map((item) => {
	// 			const trimmed = item.trim();
	// 			const match = trimmed.match(/^([^(]+)(?:\(([^)]+)\))?$/);

	// 			if (!match) return null;

	// 			return {
	// 				size: match[1].trim(),
	// 				sku: match[2] ? match[2].trim() : null,
	// 			};
	// 		})
	// 		.filter(Boolean);
	// };

	const parseExcelAndUpload = async (file) => {
		if (!file) return;

		setShowModal(true);
		resetModal();
		setLoading(true);

		const reader = new FileReader();

		reader.onload = async (e) => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });
				const sheet = workbook.Sheets[workbook.SheetNames[0]];
				const rows = XLSX.utils.sheet_to_json(sheet);

				addMessage("info", `Processing ${rows.length} rows from Excel file...`);

				const products = [];
				const allErrors = [];

				// To track duplicates within Excel
				const seenSKUs = new Map();
				const seenSlugs = new Map();
				const seenTitles = new Map();

				rows.forEach((row, index) => {
					const excelRowNumber = index + 2; // header = row 1

					// 🔴 VALIDATE ROW
					const rowErrors = validateRow(row, excelRowNumber);
					if (rowErrors.length) {
						allErrors.push(...rowErrors);
						return;
					}

					// 🟢 DUPLICATE CHECK WITHIN EXCEL
					const sku = safeStr(row[excelFeilds.sku]);
					const slug = safeStr(row[excelFeilds.slug]);
					const title = safeStr(row[excelFeilds.title]);

					if (seenSKUs.has(sku)) {
						allErrors.push(
							`Row ${excelRowNumber}: Duplicate SKU '${sku}' found (also in row ${seenSKUs.get(
								sku,
							)})`,
						);
					} else if (sku) seenSKUs.set(sku, excelRowNumber);

					if (seenSlugs.has(slug)) {
						allErrors.push(
							`Row ${excelRowNumber}: Duplicate Slug '${slug}' found (also in row ${seenSlugs.get(
								slug,
							)})`,
						);
					} else if (slug) seenSlugs.set(slug, excelRowNumber);

					if (seenTitles.has(title)) {
						allErrors.push(
							`Row ${excelRowNumber}: Duplicate Title '${title}' found (also in row ${seenTitles.get(
								title,
							)})`,
						);
					} else if (title) seenTitles.set(title, excelRowNumber);

					// 🟢 FORMAT VALID ROW
					// const color = safeStr(row[excelFeilds.color])?.toLowerCase();
					// const gender = safeStr(row[excelFeilds.gender])?.toLowerCase();
					// const size = safeStr(row[excelFeilds.size])?.toLowerCase();
					const productSku = safeStr(row[excelFeilds.sku]);

					const parsedDiscount = parsePercentToNumber(
						safeStr(row[excelFeilds.discount]),
					);

					const gender = safeStr(row[excelFeilds.gender])?.toLowerCase();
					const colors = parseMultiValues(
						safeStr(row[excelFeilds.color])?.toLowerCase(),
					);
					const sizes = parseSizesWithSku(safeStr(row[excelFeilds.size]));
					const stock = parseSizesWithSku(
						safeStr(row[excelFeilds.remaining_stock]),
					);
					const stockThreshold = parseSizesWithSku(
						safeStr(row[excelFeilds.stock_threshold]),
					);
					const price = parsePrice(row[excelFeilds.price])?.priceWithSku;

					// If missing, fallback
					if (!colors.length) colors.push(null);
					if (!sizes.length) sizes.push({ size: null, sku: null });

					const sizeAttrId =
						filterAttributes.find((v) => v.name?.en === "size")?.id || 8;
					const genderAttrId =
						filterAttributes.find((v) => v.name?.en === "gender")?.id || 9;
					const colorAttrId =
						filterAttributes.find((v) => v.name?.en === "color")?.id || 7;

					const variants = [];

					sizes.forEach((sizeObj) => {
						colors.forEach((color) => {
							const attributeData = [];

							// ✅ SIZE FIRST
							if (sizeObj?.size) {
								attributeData.push({
									attribute_id: sizeAttrId,
									value: {
										en: sizeObj.size,
										type: "baby", // as required
									},
								});
							}

							// ✅ GENDER SECOND
							if (gender) {
								attributeData.push({
									attribute_id: genderAttrId,
									value: {
										en: gender,
									},
								});
							}

							// ✅ COLOR THIRD
							if (color) {
								attributeData.push({
									attribute_id: colorAttrId,
									value: {
										en: color,
									},
								});
							}

							console.log(
								price,
								price.find((v) => v.size == productSku)?.sku,
								price.find((v) => v.size === productSku)?.sku,
								productSku,
								"chkking price skuss",
							);
							if (sizeObj?.sku) {
								variants.push({
									sku: sizeObj?.sku || productSku,
									branch_data: [
										{
											branch_id: 1,
											cost_price: price.find((v) => v.size === sizeObj?.sku)
												?.sku,
											stock:
												stock.find((v) => v.size === sizeObj?.sku)?.sku || 100,
											low_stock:
												stockThreshold.find((v) => v.size === sizeObj?.sku)
													?.sku || 100,
											reorder_quantity: 100,
											sale_price: price.find((v) => v.size === sizeObj?.sku)
												?.sku,
											discount_percentage: parsedDiscount,
										},
									],
									attribute_data: attributeData,
								});
							} else {
								variants.push({
									sku: sizeObj?.sku || productSku,
									branch_data: [
										{
											branch_id: 1,
											cost_price: price.find((v) => v.size === productSku)?.sku,
											stock:
												stock.find((v) => v.size === productSku)?.sku || 100,
											low_stock:
												stockThreshold.find((v) => v.size === productSku)
													?.sku || 100,
											reorder_quantity: 100,
											sale_price: price.find((v) => v.size === productSku)?.sku,
											discount_percentage: parsedDiscount,
										},
									],
									attribute_data: attributeData,
								});
							}
						});
					});

					// const attributeData = [];

					// if (color && !color.includes("default") && !color.includes("multi")) {
					// 	attributeData.push({
					// 		attribute_id:
					// 			filterAttributes.find((v) => v.name?.en === "color")?.id || 7,
					// 		value: { en: color },
					// 	});
					// }

					// if (
					// 	gender &&
					// 	!gender.includes("default") &&
					// 	!gender.includes("multi")
					// ) {
					// 	attributeData.push({
					// 		attribute_id:
					// 			filterAttributes.find((v) => v.name?.en === "gender")?.id || 5,
					// 		value: { en: gender },
					// 	});
					// }

					// if (size && !size.includes("default") && !size.includes("multi")) {
					// 	attributeData.push({
					// 		attribute_id:
					// 			filterAttributes.find((v) => v.name?.en === "size")?.id || 4,
					// 		value: { en: size },
					// 	});
					// }

					products.push({
						sku: safeStr(row[excelFeilds.sku]),
						meta_title: safeStr(row[excelFeilds.meta_title]),
						meta_description: safeStr(row[excelFeilds.meta_description]),
						base_price: toNumber(parsePrice(row[excelFeilds.price]).price),
						base_discount_percentage: parsedDiscount,
						images: [],
						translations: [
							{
								title: safeStr(row[excelFeilds.title]),
								slug: safeStr(row[excelFeilds.slug]),
								excerpt: safeStr(row[excelFeilds.excerpt]),
								description: buildHtmlDescription(
									safeStr(row[excelFeilds.description]),
									safeStr(row[excelFeilds.additionalInfo]),
								),
								language_id: 1,
							},
						],
						variants,
						// variants: [
						// 	{
						// 		sku: "SKU-1",
						// 		branch_data: [
						// 			{
						// 				branch_id: 1,
						// 				cost_price: toNumber(safeStr(row[excelFeilds.price])),
						// 				stock: 100,
						// 				low_stock: 100,
						// 				reorder_quantity: 100,
						// 				sale_price: toNumber(safeStr(row[excelFeilds.price])),
						// 				discount_percentage: parsedDiscount,
						// 			},
						// 		],
						// 		attribute_data: attributeData,
						// 	},
						// ],
						categories: row[excelFeilds.categories]
							? row[excelFeilds.categories]
									.split(",")
									.map((c) => c.trim())
									.filter(Boolean)
							: [],
						brand_id: safeStr(row[excelFeilds.brand]) || null,
						similarProductsSku: row[excelFeilds.similar_products]
							? `${row[excelFeilds.similar_products]}`
									.split(",")
									.map((sku) => sku.trim())
									.filter(Boolean)
							: [],
						is_featured: false,
						status: true,
						// thumbnail: null,
					});
				});

				// ❌ STOP IF ANY ERRORS
				if (allErrors.length) {
					console.error("IMPORT ERRORS:", allErrors);
					allErrors.slice(0, 15).forEach((error) => {
						addMessage("error", error);
					});
					if (allErrors.length > 15) {
						addMessage("error", `... and ${allErrors.length - 15} more errors`);
					}
					setLoading(false);
					return;
				}

				if (!products.length) {
					addMessage("error", "No valid rows found in Excel file.");
					setLoading(false);
					return;
				}

				addMessage(
					"success",
					`${products.length} products validated successfully.`,
				);
				console.log("FINAL PAYLOAD", products);

				let totalUpdatedProducts = 0;
				let totalCreatedProducts = 0;
				let totalCreatedCategories = 0;
				let totalCreatedBrands = 0;
				// return;
				// ------------------ BATCH UPLOAD ------------------
				const batchSize = 200;
				for (let i = 0; i < products.length; i += batchSize) {
					const batch = products.slice(i, i + batchSize);
					const start = i + 1;
					const end = Math.min(i + batchSize, products.length);
					try {
						addMessage("info", `Uploading products ${start} - ${end}...`);
						const res = await ProductServices.importProducts({
							products: batch,
						});
						totalUpdatedProducts += res.updatedProducts?.length || 0;
						totalCreatedProducts += res.createdProducts?.length || 0;
						totalCreatedCategories += res.createdCategories?.length || 0;
						totalCreatedBrands += res.createdBrands?.length || 0;
						addMessage(
							"success",
							`Products ${start} - ${end} uploaded successfully`,
						);
					} catch (err) {
						console.error(
							`Error in importing Products ${start} - ${end}:`,
							err.message || err,
						);
						addMessage(
							"error",
							`Error importing Products ${start} - ${end}: ${err.message || err}`,
						);
						break;
					}
				}

				setUploadStats({
					updatedProducts: totalUpdatedProducts,
					createdProducts: totalCreatedProducts,
					createdCategories: totalCreatedCategories,
					createdBrands: totalCreatedBrands,
				});

				addMessage("success", "Import completed!");
			} catch (error) {
				addMessage("error", `Failed to process file: ${error.message}`);
			} finally {
				setLoading(false);
			}
		};

		reader.readAsArrayBuffer(file);
	};

	return (
		<div className="flex-1">
			{/* Beautiful Upload Button */}
			<div className="w-full inline-block relative">
				<Button
					onClick={() => document.getElementById("file-input").click()}
					// className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3">
					className="group flex gap-2 items-center rounded-md h-12 w-full">
					{" "}
					{/* Icon Container */}
					<div className="relative">
						<FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
					</div>
					{/* Text */}
					<div className="flex flex-col items-start">
						<span className="font-semibold text-base">
							Import Products{" "}
							<span className="text-gray-100 text-sm italic font-normal">
								(supports .xlsx and .xls formats)
							</span>{" "}
						</span>
						{/* <span className="text-xs text-blue-100">Upload Excel File</span> */}
					</div>
					{/* Package Icon */}
					{/* <Package className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" /> */}
					{/* Shine Effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shine rounded-lg"></div>
				</Button>

				{/* Helper Text */}
			</div>

			<input
				id="file-input"
				type="file"
				accept=".xlsx,.xls"
				style={{ display: "none" }}
				onChange={(e) => parseExcelAndUpload(e.target.files[0])}
			/>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
						{/* Header */}
						<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
							<h2 className="text-xl font-semibold text-gray-800">
								Product Import Progress
							</h2>
							{!loading && (
								<button
									onClick={() => setShowModal(false)}
									className="text-gray-400 hover:text-gray-600 text-2xl">
									×
								</button>
							)}
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={`p-3 rounded-md ${
										msg.type === "success"
											? "bg-green-50 text-green-800 border border-green-200"
											: msg.type === "error"
												? "bg-red-50 text-red-800 border border-red-200"
												: "bg-blue-50 text-blue-800 border border-blue-200"
									}`}>
									<span className="font-medium">
										{msg.type === "success"
											? "✓ "
											: msg.type === "error"
												? "✗ "
												: "ℹ "}
									</span>
									{msg.text}
								</div>
							))}

							{loading && (
								<div className="flex items-center justify-center py-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
									<span className="ml-3 text-gray-600">Processing...</span>
								</div>
							)}
						</div>

						{/* Stats Summary */}
						{uploadStats && (
							<div className="pl-6 pr-10 rounded-md py-4">
								<div className="px-6 py-4 bg-gray-50 border rounded-md border-gray-200">
									<h3 className="font-semibold text-gray-800 mb-2">
										Import Summary:
									</h3>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>
											<span className="text-gray-600">Updated Products:</span>
											<span className="ml-2 font-semibold">
												{uploadStats.updatedProducts}
											</span>
										</div>
										<div>
											<span className="text-gray-600">Created Products:</span>
											<span className="ml-2 font-semibold">
												{uploadStats.createdProducts}
											</span>
										</div>
										<div>
											<span className="text-gray-600">Created Categories:</span>
											<span className="ml-2 font-semibold">
												{uploadStats.createdCategories}
											</span>
										</div>
										<div>
											<span className="text-gray-600">Created Brands:</span>
											<span className="ml-2 font-semibold">
												{uploadStats.createdBrands}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Footer */}
						{!loading && (
							<div className="px-6 py-4 border-t border-gray-200 flex justify-end">
								<button
									onClick={() => setShowModal(false)}
									className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
									Close
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default UploadProductsExcel;
