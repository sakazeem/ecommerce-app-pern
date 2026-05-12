import React, { useEffect, useState } from "react";
import {
	Table,
	TableHeader,
	TableCell,
	TableBody,
	TableRow,
} from "@windmill/react-ui";
import ImageSelectorField from "../form/fields/ImageSelectorField";

export default function VariantTable({
	defaultValues,
	onDelete,
	onUpdate,
	generatedVariants,
	variantImagesOptions,
}) {
	const [variants, setVariants] = useState([]);

	// Sync with generatedVariants
	useEffect(() => {
		setVariants(
			generatedVariants.map((variant) => ({
				...variant,
				costPrice:
					variant.costPrice !== undefined
						? variant.costPrice
						: defaultValues.costPrice,
				salePrice:
					variant.salePrice !== undefined
						? variant.salePrice
						: defaultValues.salePrice,
				stock:
					variant.stock !== undefined ? variant.stock : defaultValues.stock, // keep it null for now
				lowStock:
					variant.lowStock !== undefined
						? variant.lowStock
						: defaultValues.lowStock, // keep it null for now
				reorderQty:
					variant.reorderQty !== undefined
						? variant.reorderQty
						: defaultValues.reorderQty, // keep it null for now
				discount:
					variant.discount !== undefined
						? variant.discount
						: defaultValues.discount,
				imageId:
					variant.imageId !== undefined
						? variant.imageId
						: defaultValues.imageId, // keep it null for now
				imageUrl:
					variant.imageUrl !== undefined
						? variant.imageUrl
						: defaultValues.imageUrl, // keep it null for now
			})),
		);
	}, [generatedVariants, defaultValues]);

	// Send updates to parent whenever variants change
	useEffect(() => {
		if (onUpdate) {
			onUpdate(variants);
		}
	}, [variants, onUpdate]);

	const handleChange = (idx, field, value) => {
		setVariants((prev) =>
			prev.map((variant, i) =>
				i === idx ? { ...variant, [field]: value } : variant,
			),
		);
	};

	const handleDelete = (idx) => {
		setVariants((prev) => prev.filter((_, i) => i !== idx));
		if (onDelete) onDelete(idx);
	};
	// return null;
	return (
		<Table className="w-full overflow-x-auto">
			<TableHeader>
				<tr>
					<TableCell className="w-12 text-xs px-2">Variant Name</TableCell>
					<TableCell className="w-12 text-xs px-2">SKU</TableCell>
					<TableCell className="w-12 text-xs px-2">Price</TableCell>
					<TableCell className="w-12 text-xs px-2">Remaining Stock</TableCell>
					<TableCell className="w-12 text-xs px-2">Stock Threshold</TableCell>
					{/* <TableCell className="w-12 text-xs px-2">Reorder Qty</TableCell> */}
					<TableCell className="w-12 text-xs px-2">Discount %</TableCell>
					<TableCell className="w-12 text-xs px-2">Image</TableCell>
					<TableCell className="w-12 text-xs px-2">Delete</TableCell>
				</tr>
			</TableHeader>
			<TableBody>
				{variants.map((variant, idx) => (
					<TableRow key={idx} className="text-xs">
						<TableCell>{getDisplayString(variant?.name)}</TableCell>

						<TableCell>
							<input
								type="text"
								value={variant.sku || ""}
								onChange={(e) => handleChange(idx, "sku", e.target.value)}
								className="border p-1 rounded w-24 text-xs"
							/>
						</TableCell>
						{/* <TableCell>
							<input
								type="number"
								value={variant.costPrice || ""}
								onChange={(e) => handleChange(idx, "costPrice", e.target.value)}
								className="border p-1 rounded w-12"
							/>
						</TableCell> */}

						<TableCell>
							<input
								type="number"
								value={variant.salePrice || ""}
								onChange={(e) => handleChange(idx, "salePrice", e.target.value)}
								className="border p-1 rounded w-12"
							/>
						</TableCell>

						<TableCell>
							<input
								type="number"
								value={variant.stock === 0 ? 0 : variant.stock || ""}
								onChange={(e) => handleChange(idx, "stock", e.target.value)}
								className="border p-1 rounded w-12"
							/>
						</TableCell>

						<TableCell>
							<input
								type="number"
								value={variant.lowStock === 0 ? 0 : variant.lowStock || ""}
								onChange={(e) => handleChange(idx, "lowStock", e.target.value)}
								className="border p-1 rounded w-12"
							/>
						</TableCell>

						{/* <TableCell>
							<input
								type="number"
								value={variant.reorderQty || ""}
								onChange={(e) =>
									handleChange(idx, "reorderQty", e.target.value)
								}
								className="border p-1 rounded w-12"
							/>
						</TableCell> */}

						<TableCell>
							<input
								type="number"
								value={variant.discount || ""}
								onChange={(e) => handleChange(idx, "discount", e.target.value)}
								className="border p-1 rounded w-12"
							/>
						</TableCell>

						<TableCell>
							<ImageSelectorField
								label={"image"}
								selectedImage={variant.imageId}
								setSelectedImage={(imageId) => {
									handleChange(idx, "imageId", imageId);
								}}
								selectedImageUrl={variant.imageUrl}
								setSelectedImageUrl={(imageUrl) => {
									handleChange(idx, "imageUrl", imageUrl);
								}}
								isVertical
								// className="col-span-2"
								isSmall
								className="border p-1 w-40 rounded"
								isVariantImage={true}
								variantImages={variantImagesOptions}
							/>
						</TableCell>

						<TableCell>
							<button
								type="button"
								className="text-red-500 w-12"
								onClick={() => handleDelete(idx)}>
								Delete
							</button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
function getDisplayString(str) {
	if (!str) return "";

	if (str.includes("size:")) {
		// extract only size:value
		const sizePart = str
			.split(",")
			.find((part) => part.trim().startsWith("size:"));

		return sizePart ? sizePart.trim() : str;
	}

	// if size not present, return full string
	return str;
}
