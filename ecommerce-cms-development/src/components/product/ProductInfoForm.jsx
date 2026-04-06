import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { useTranslation } from "react-i18next";
import ImageSelectorField from "../form/fields/ImageSelectorField";
import InputAreaField from "../form/fields/InputAreaField";
import InputMultipleSelectField from "../form/fields/InputMultipleSelectField";
import SwitchToggleField from "../form/fields/SwitchToggleField";
import TranslationFields from "../newComponents/TranslationFields";
import TextAreaField from "../form/fields/TextAreaField";
import RichTextField from "../form/fields/RichTextField";
import { useEffect, useState } from "react";
import AttributeServices from "@/services/AttributeServices";
import { generateVariants } from "./ProductVariantForm";
import VariantTable from "./VariantTable";
import InputSelectField from "../form/fields/InputSelectField";
import ProductServices from "@/services/ProductServices";

const ProductInfoForm = ({
	variantFields,
	appendVariant,
	removeVariant,
	errors,
	control,
	register,
	usps,
	categories,
	vendors,
	branches,
	setValue,
	selectedUsps,
	selectedCategories,
	similarProducts,
	selectedVendors,
	selectedThumbnail,
	setSelectedThumbnail,
	selectedThumbnailUrl,
	setSelectedThumbnailUrl,
	isFeatured,
	setIsFeatured,
	status,
	setStatus,
	translationFields,

	hasVariants,
	setHasVariants,
	selectedImages,
	setSelectedImages,
	selectedImagesUrl,
	setSelectedImagesUrl,

	defaultValues,
	setDefaultValues,
	setVariantImagesOptions,
}) => {
	const { t } = useTranslation();
	const { showingTranslateValue, showSelectedLanguageTranslation } =
		useUtilsFunction();

	const { settings } = useGlobalSettings();

	const [selectedAttriutes, setSelectedAttriutes] = useState();
	const [selectedVariants, setSelectedVariants] = useState([]);

	const [generatedVariants, setGeneratedVariants] = useState([]);

	const [attributes, setAttribtes] = useState([]);
	const [productTitles, setProductTitles] = useState([]);

	useEffect(() => {
		ProductServices.getAllProductTitles()
			.then((res) => {
				setProductTitles(res);
			})
			.catch((err) => {
				addMessage("error", `Error fetching products: ${err.message || err}`);
			});
	}, []);

	useEffect(() => {
		AttributeServices.getAllAttributesForOptions().then((v) => setAttribtes(v.records));
	}, []);

	useEffect(() => {
		if (selectedVariants.length > 0) {
			setGeneratedVariants(generateVariants(selectedVariants));
		}
	}, [selectedVariants]);

	useEffect(() => {
		if (!selectedThumbnail && (!selectedImages || selectedImages.length === 0))
			return;

		setVariantImagesOptions((prev) => {
			const newImages = [];

			if (selectedThumbnail) {
				newImages.push(selectedThumbnail);
			}

			if (selectedImages && selectedImages.length > 0) {
				newImages.push(...selectedImages);
			}

			// Merge previous + new
			const merged = [...prev, ...newImages];

			// Remove duplicates
			return [...new Set(merged)];
		});
	}, [selectedThumbnail, selectedImages]);

	return (
		<div className="flex-grow scrollbar-hide flex flex-col gap-8 w-full max-h-full">
			{!settings.isMultiLingual && (
				<section className={`w-full relative p-6 rounded-lg border`}>
					<h3 className="font-semibold text-2xl h3 mb-4">Basic Information</h3>
					<TranslationFields
						control={control}
						register={register}
						translationFields={translationFields}
						errors={errors}
						setValue={setValue}
					/>
				</section>
			)}
			<section className={`w-full relative p-6 rounded-lg border`}>
				<h3 className="font-semibold text-2xl h3 mb-4">Product Settings</h3>
				<div className="grid grid-cols-2 gap-x-16 gap-y-6 items-end">
					<InputAreaField
						label={t("Sku")}
						required={true}
						register={register}
						inputLabel="sku"
						inputName="sku"
						inputType="text"
						inputPlaceholder={t("ProductSkuPlaceholder")}
						errorName={errors.sku}
						isVertical
					/>
					<InputMultipleSelectField
						label={t("SelectCategories")}
						inputName="categories"
						inputPlaceholder={t("SelectCategories")}
						options={categories?.map((pCat) => ({
							id: pCat.id,
							name: showSelectedLanguageTranslation(pCat.translations, "title"),
						}))}
						setValue={setValue}
						errorName={errors.categories}
						defaultSelected={selectedCategories}
						isVertical
					/>
					<InputMultipleSelectField
						label={t("Select Related Products")}
						inputName="similarProducts"
						inputPlaceholder={t("Select Related Products")}
						options={productTitles?.map((pCat) => ({
							id: pCat.product_id,
							name: pCat.title,
						}))}
						setValue={setValue}
						errorName={errors.similarProducts}
						defaultSelected={similarProducts}
						isVertical
					/>
					{/* <InputMultipleSelectField
						label={t("SelectUsp")}
						inputName="usps"
						inputPlaceholder={t("SelectUsp")}
						options={usps?.map((pCat) => ({
							id: pCat.id,
							name: showSelectedLanguageTranslation(
								pCat?.translations,
								"title",
							),
						}))}
						setValue={setValue}
						errorName={errors.usps}
						defaultSelected={selectedUsps}
						isVertical
					/> */}

					<InputSelectField
						label={t("Select Brand")}
						register={register}
						inputLabel={t("Select Brand")}
						required={false}
						inputName="brand_id"
						inputPlaceholder={t("Select Brand")}
						options={vendors?.map((pCat, index) => {
							return (
								<option value={pCat.id} key={index}>
									{showSelectedLanguageTranslation(pCat.translations, "title")}
								</option>
							);
						})}
						errorName={errors.brand_id}
						isVertical
					/>
					{/* <InputSelectField
						label={t("Select Brand")}
						inputName="brand_id"
						inputPlaceholder={t("Select Brand")}
						// options={vendors?.map((pCat) => ({
						// 	id: pCat.id,
						// 	// name: pCat.id,
						// 	name: showingTranslateValue(pCat?.name),
						// }))}
						options={vendors?.map((pCat) => ({
							id: pCat.id,
							name: showSelectedLanguageTranslation(pCat.translations, "title"),
						}))}
						setValue={setValue}
						errorName={errors.vendors}
						// defaultSelected={selectedVendors}
					/> */}
					<div></div>

					<InputAreaField
						label={t("BasePrice")}
						required
						register={register}
						inputLabel="base_price"
						inputName={`base_price`}
						inputType="number"
						inputPlaceholder={t("BasePrice")}
						errorName={errors?.base_price}
						isVertical
					/>
					<InputAreaField
						label={t("BaseDiscountPercentage")}
						register={register}
						inputLabel="base_discount_percentage"
						inputName={`base_discount_percentage`}
						inputType="number"
						inputPlaceholder={t("BaseDiscountPercentage")}
						errorName={errors?.base_discount_percentage}
						isVertical
					/>
					<div>
						{/* <SwitchToggleField
							label={t("HasVariants")}
							handleProcess={setHasVariants}
							processOption={hasVariants}
						/>
						<SwitchToggleField
							label={t("IsFeatured")}
							handleProcess={setIsFeatured}
							processOption={isFeatured}
						/> */}
						<SwitchToggleField
							label={t("Status")}
							handleProcess={setStatus}
							processOption={status}
						/>
					</div>
				</div>
			</section>
			<section className={`w-full relative p-6 rounded-lg border`}>
				<h3 className="font-semibold text-2xl h3 mb-4">Product Media</h3>
				<div className="grid grid-cols-1 gap-x-16 gap-y-6 items-end">
					<ImageSelectorField
						required={false}
						label={t("Thumbnail")}
						selectedImage={selectedThumbnail}
						setSelectedImage={setSelectedThumbnail}
						selectedImageUrl={selectedThumbnailUrl}
						setSelectedImageUrl={setSelectedThumbnailUrl}
						isVertical
					/>
					<ImageSelectorField
						required={false}
						label={t("Images")}
						selectedImage={selectedImages}
						setSelectedImage={setSelectedImages}
						selectedImageUrl={selectedImagesUrl}
						setSelectedImageUrl={setSelectedImagesUrl}
						isVertical
						isMultipleSelect
					/>
				</div>
			</section>
			<section className={`w-full relative p-6 rounded-lg border`}>
				<h3 className="font-semibold text-2xl h3 mb-4">SEO Information</h3>
				<div className="grid grid-cols-1 gap-x-16 gap-y-6 items-end">
					<InputAreaField
						label={t("MetaTitle")}
						required={true}
						register={register}
						inputLabel="meta_title"
						inputName="meta_title"
						inputType="text"
						inputPlaceholder={t("ProductMetaTitlePlaceholder")}
						errorName={errors.meta_title}
						isVertical
					/>
					<TextAreaField
						label={t("MetaDescription")}
						required={true}
						register={register}
						inputLabel="meta_description"
						inputName="meta_description"
						inputType="text"
						inputPlaceholder={t("ProductMetaDescriptionPlaceholder")}
						errorName={errors.meta_description}
						isVertical
					/>
				</div>
			</section>
		</div>
	);
};

export default ProductInfoForm;
