import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

//internal import
import DrawerButton from "@/components/form/button/DrawerButton";
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import DrawerHeader from "../newComponents/DrawerHeader";

import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import BranchServices from "@/services/BranchServices";
import CategoryServices from "@/services/CategoryServices";
import LanguageServices from "@/services/LanguageServices";
import UspServices from "@/services/UspServices";
import VendorServices from "@/services/VendorServices";
import ProductInfoForm from "./ProductInfoForm";
import ProductStepper from "./ProductStepper";
import ProductTranslationForm from "./ProductTranslationForm";
import ProductVariantForm from "./ProductVariantForm";
import { toast } from "react-toastify";
import { Button } from "@windmill/react-ui";

const transformFromApi = (variants, settings) => {
	return variants.map((v) => {
		// Extract branch data (assuming one branch for now)
		const branch = v.branches?.[0]?.pvb || {};

		return {
			id: v.id,
			sku: v.sku,
			imageId: v.image || null,
			imageUrl: v.medium?.url || null, // useful for preview
			costPrice: branch.cost_price ?? "",
			stock: branch.stock ?? "",
			lowStock: branch.low_stock ?? "",
			reorderQty: branch.reorder_quantity ?? "",
			salePrice: branch.sale_price ?? "",
			discount: branch.discount_percentage ?? "",
			combo: v.attributes?.map((attr) => ({
				id: attr.id,
				name: attr.name.en,
				value: attr.pva?.value?.en || "",
			})),
		};
	});
};

const translationFieldsArr = [
	{
		name: "title",
		required: true,
		fieldType: "inputArea",
		params: { isVertical: true },
	},
	{
		name: "slug",
		required: true,
		fieldType: "inputArea",
		params: { isVertical: true },
	},
	{
		name: "excerpt",
		fieldType: "inputArea",
		params: { className: "col-span-2", isVertical: true },
	},
	{
		name: "description",
		fieldType: "richText",
		params: { className: "col-span-2", isVertical: true },
	},
];

const ProductDrawer = ({ id, data }) => {
	const { t } = useTranslation();
	const { settings, selectedLanguage, isMultiLingual } = useGlobalSettings();
	const [resetKey, setResetKey] = useState(0); // state to reset all the states after submit or onClose
	const [usps, setUsps] = useState([]);
	const [categories, setCategories] = useState([]);
	const [vendors, setVendors] = useState([]);
	const [selectedUsps, setSelectedUsps] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [similarProducts, setSimilarProducts] = useState([]);
	const [selectedVendors, setSelectedVendors] = useState([]);
	const [branches, setBranches] = useState([]);
	const [languages, setLanguages] = useState([]);
	const [status, setStatus] = useState(true);
	const [isFeatured, setIsFeatured] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [resData, setResData] = useState({});
	const { toggleDrawer, isDrawerOpen, closeDrawer, setIsUpdate } =
		useContext(SidebarContext);
	const [selectedThumbnail, setSelectedThumbnail] = useState(null);
	const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState(null);
	const [selectedImages, setSelectedImages] = useState([]);
	const [selectedImagesUrl, setSelectedImagesUrl] = useState([]);
	const [variantImages, setVariantImages] = useState({});
	const [variantImageUrls, setVariantImageUrls] = useState({});
	const [productVariants, setProductVariants] = useState([]);
	const [hasVariants, setHasVariants] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [defaultValues, setDefaultValues] = useState({
		costPrice: null,
		salePrice: null,
		stock: 100, //setting these default values for now
		lowStock: 100, //setting these default values for now
		reorderQty: 100, //setting these default values for now
		// stock: null,
		// lowStock: null,
		// reorderQty: null,
		discount: null,
		imageId: null,
		imageUrl: null,
	});
	const [finalVariants, setFinalVariants] = useState([]);
	const { showingTranslateValue, showSelectedLanguageTranslation } =
		useUtilsFunction();

	const [variantsToSend, setVariantsToSend] = useState([]);
	const [variantImagesOptions, setVariantImagesOptions] = useState([]);

	const steps = [
		{ id: 1, title: "Product Information", show: true },
		{ id: 2, title: "Translations", show: settings.isMultiLingual },
		{
			id: 3,
			title: hasVariants ? "Variants & Inventory" : "Product Inventory",
			show: false, //change this to true later, for actual variants
		},
	].filter((step) => step.show);

	const formDefaultValues = {
		sku: null,
		brand_id: null,
		meta_title: null,
		meta_description: null,
		base_price: null,
		base_discount_percentage: null,
		images: [],
		translations: [
			{
				title: null,
				slug: null,
				excerpt: null,
				description: null,
				language_id: selectedLanguage?.id,
			},
		],
		variants: [
			{
				sku: null,
				attributes: {},
				image: null,
				branch_data: [
					{
						branch_id: null,
						cost_price: null,
						stock: null,
						low_stock: null,
						reorder_quantity: null,
						sale_price: null,
						discount_percentage: null,
					},
				],
			},
		],
	};

	const methods = useForm({
		formDefaultValues,
	});

	const {
		control,
		register,
		handleSubmit,
		setValue,
		clearErrors,
		reset,
		trigger, // 🔥 Added for step validation
		watch,
		formState: { errors },
	} = methods;

	const basePrice = watch("base_price");
	const baseDiscount = watch("base_discount_percentage");
	const sku = watch("sku");

	useEffect(() => {
		setDefaultValues((prev) => ({
			...prev,
			costPrice: basePrice ?? null,
			salePrice: basePrice ?? null,
			discount: baseDiscount ?? null,
		}));
	}, [basePrice, baseDiscount]);

	const {
		fields: variantFields,
		append: appendVariant,
		remove: removeVariant,
	} = useFieldArray({
		control,
		name: "variants",
	});

	const resetStates = () => {
		setSelectedCategories([]);
		setSimilarProducts([]);
		setSelectedUsps([]);
		setSelectedVendors([]);
		setSelectedThumbnail(null);
		setSelectedThumbnailUrl(null);
		setSelectedImages([]);
		setSelectedImagesUrl([]);
		setVariantImages(null);
		setVariantImageUrls(null);

		// 🔥 trigger child reset
		setResetKey((prev) => prev + 1);
	};

	const onSubmit = async (data) => {
		try {
			if (data?.translations[0]?.slug) {
				data.translations[0].slug = data.translations[0].slug.trim();
			}

			setIsSubmitting(true);
			const cleanedData = Object.fromEntries(
				Object.entries(data).filter(([_, value]) => value !== ""),
			);

			const productData = {
				...cleanedData,
				variants: variantsToSend,
				is_featured: isFeatured,
				status,
				thumbnail: selectedThumbnail,
				images: selectedImages,
			};

			// setIsSubmitting(false);
			// return;

			if (id) {
				const res = await ProductServices.updateProduct(id, productData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
			} else {
				const res = await ProductServices.addProduct(productData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
			}
			resetStates();
		} catch (err) {
			setIsSubmitting(false);
			notifyError(err ? err?.response?.data?.message : err?.message);
		}
	};

	// 🔥 CHANGE: Step validation logic
	const handleNext = async () => {
		let isStepValid = false;

		if (currentStep === 1) {
			const reactHookFormValid = await trigger([
				"sku",
				"categories",
				"usps",
				"vendors",
				"base_price",
				"base_discount_percentage",
				"meta_title",
				"meta_description",
				...(isMultiLingual ? ["translations"] : []),
			]); // validate product info fields
			if (!reactHookFormValid) {
				toast.error("Required feilds missing");
			}
			//  else if (!selectedThumbnail) {
			// 	toast.error("Thumnail is required");
			// }
			isStepValid = reactHookFormValid && selectedThumbnail;
		} else if (currentStep === 2) {
			isStepValid = await trigger(["translations"]);
		} else if (currentStep === 3) {
			isStepValid = await trigger(["base", "variants"]);
		}

		if (isStepValid) {
			const currentIndex = steps.findIndex((step) => step.id === currentStep);
			if (currentIndex < steps.length - 1) {
				setCurrentStep(steps[currentIndex + 1].id); // 👈 move to next step’s id
			}
		}
	};

	const handleBack = () => {
		const currentIndex = steps.findIndex((step) => step.id === currentStep);
		if (currentIndex > 0) {
			setCurrentStep(steps[currentIndex - 1].id); // 👈 move to previous step’s id
		}
	};

	useEffect(() => {
		if (id && isDrawerOpen) {
			(async () => {
				try {
					const res = await ProductServices.getProductById(id);
					if (res) {
						setResData(res);
						// ✅ Thumbnail
						setSelectedThumbnail(res.thumbnail || null);
						// If API returns thumbnail via medium, adjust accordingly
						setSelectedThumbnailUrl(
							res.thumbnailImage?.url
								? import.meta.env.VITE_APP_CLOUDINARY_URL +
										res.thumbnailImage.url
								: null,
						);
						setSelectedImages(res.images?.map((v) => v.id)); // update this with image
						// If API returns thumbnail via medium, adjust accordingly
						setSelectedImagesUrl(
							res.images.length > 0
								? res.images?.map(
										(v) => import.meta.env.VITE_APP_CLOUDINARY_URL + v.url,
									)
								: [],
						);
						setStatus(res.status ?? false);
						setIsFeatured(res.is_featured ?? false);

						// name: showSelectedLanguageTranslation(
						// pCat?.translations,
						// "title",
						// ),
						// setSelectedCategories(res.categories?.map((cat) => cat.id));
						setSelectedCategories(
							res.categories?.map((cat) => ({
								id: cat.id,
								name: showSelectedLanguageTranslation(
									cat.translations,
									"title",
								),
							})),
						);
						setSimilarProducts(
							res.similar_products?.map((cat) => ({
								id: cat.id,
								name: cat.product_translations[0]?.title,
							})),
						);
						setSelectedUsps(
							res.usps?.map((cat) => ({
								id: cat.id,
								name: showSelectedLanguageTranslation(
									cat.translations,
									"title",
								),
							})),
						);
						setSelectedVendors(
							res.vendors?.map((cat) => ({
								id: cat.id,
								name: showingTranslateValue(cat.name),
							})),
						);
						// setVariantsToSend(res.product_variants);

						// ✅ Variant images (for ImageSelectorField)
						if (res.product_variants?.length) {
							setProductVariants(res.product_variants);
							// const imgObj = {};
							// const imgUrlObj = {};
							// res.product_variants.forEach((variant, idx) => {
							// 	imgObj[idx] = variant.image || null;
							// 	imgUrlObj[idx] =
							// 		import.meta.env.VITE_APP_CLOUDINARY_URL +
							// 			variant.medium?.url || null;
							// });
							// setVariantImages(imgObj);
							// setVariantImageUrls(imgUrlObj);
						}

						// ✅ Reset form values
						reset({
							sku: res.sku || null,
							brand_id: res.brand_id || null,
							base_price: res.base_price || null,
							base_discount_percentage: res.base_discount_percentage || null,
							meta_title: res.meta_title || null,
							meta_description: res.meta_description || null,
							// Translations
							translations:
								res.product_translations?.map((t) => ({
									title: t.title || null,
									slug: t.slug || null,
									excerpt: t.excerpt || null,
									description: t.description || null,
									language_id: t.language_id || null,
								})) || [],

							// // Variants
							// variants:
							// 	res.product_variants?.map((v) => ({
							// 		sku: v.sku || null,
							// 		attributes: {
							// 			size: v.attributes?.size || null,
							// 			color: v.attributes?.color || null,
							// 		},
							// 		image: v.image || null, // actual image ID
							// 		branch_data:
							// 			v.branches?.map((b) => ({
							// 				branch_id: b.id || null,
							// 				cost_price: b.pvb?.cost_price || null,
							// 				sale_price: b.pvb?.sale_price || null,
							// 				stock: b.pvb?.stock || null,
							// 				low_stock: b.pvb?.low_stock || null,
							// 				reorder_quantity: b.pvb?.reorder_quantity || null,
							// 				discount_percentage: b.pvb?.discount_percentage || null,
							// 			})) || [],
							// 	})) || [],
						});
					}
				} catch (err) {
					notifyError(err?.response?.data?.message || err.message);
				}
			})();
		} else {
			reset({ ...formDefaultValues }); // New product mode
			resetStates();
		}
	}, [id, setValue, clearErrors, data]);

	useEffect(() => {
		UspServices.getAllUspsForOptions().then((data) => {
			setUsps(data?.records);
		});
		CategoryServices.getAllCategoriesForOptions().then((data) => {
			setCategories(data?.records);
		});
		VendorServices.getAllVendorsForOptions().then((data) => {
			setVendors(data?.records);
		});
		BranchServices.getAllBranches().then((data) => {
			setBranches(data?.records);
		});
		LanguageServices.getAllLanguages().then((data) => {
			setLanguages(data);
		});
	}, []);

	console.log(branches, "chkking branches in drawer");

	return (
		<>
			<DrawerHeader
				id={id}
				register={register}
				updateTitle={t("UpdateProduct")}
				updateDescription={t("UpdateProductDescription")}
				addTitle={t("AddProductTitle")}
				addDescription={t("AddProductDescription")}
			/>

			<main className="w-full p-6  space-y-6 relative bg-customWhite dark:bg-customGray-800 rounded-t-lg rounded-0 mb-4">
				<ProductStepper
					hasVariants={hasVariants}
					currentStep={currentStep}
					steps={steps}
					setCurrentStep={setCurrentStep}
				/>
				<FormProvider {...methods}>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="w-full space-y-6 relative">
						{currentStep === 3 ? (
							<ProductVariantForm
								variantFields={variantFields}
								appendVariant={appendVariant}
								removeVariant={removeVariant}
								errors={errors}
								control={control}
								register={register}
								usps={usps}
								categories={categories}
								vendors={vendors}
								branches={branches}
								setValue={setValue}
								variantImages={variantImages}
								variantImageUrls={variantImageUrls}
								hasVariants={hasVariants}
								productVariants={productVariants}
								setProductVariants={setProductVariants}
								setVariantsToSend={setVariantsToSend}
								defaultValues={defaultValues}
								setDefaultValues={setDefaultValues}
								finalVariants={finalVariants}
								setFinalVariants={setFinalVariants}
							/>
						) : currentStep === 2 ? (
							<ProductTranslationForm
								control={control}
								register={register}
								translationFields={translationFieldsArr}
								errors={errors}
							/>
						) : currentStep === 1 ? (
							<>
								<ProductInfoForm
									control={control}
									variantFields={variantFields}
									appendVariant={appendVariant}
									removeVariant={removeVariant}
									errors={errors}
									register={register}
									usps={usps}
									categories={categories}
									vendors={vendors}
									branches={branches}
									setValue={setValue}
									selectedUsps={selectedUsps}
									selectedCategories={selectedCategories}
									similarProducts={similarProducts}
									selectedVendors={selectedVendors}
									selectedThumbnail={selectedThumbnail}
									setSelectedThumbnail={setSelectedThumbnail}
									selectedThumbnailUrl={selectedThumbnailUrl}
									setSelectedThumbnailUrl={setSelectedThumbnailUrl}
									selectedImages={selectedImages}
									setSelectedImages={setSelectedImages}
									selectedImagesUrl={selectedImagesUrl}
									setSelectedImagesUrl={setSelectedImagesUrl}
									isFeatured={isFeatured}
									setIsFeatured={setIsFeatured}
									status={status}
									setStatus={setStatus}
									translationFields={translationFieldsArr}
									variantImages={variantImages}
									variantImageUrls={variantImageUrls}
									hasVariants={hasVariants}
									setHasVariants={setHasVariants}
									defaultValues={defaultValues}
									setDefaultValues={setDefaultValues}
									setVariantImagesOptions={setVariantImagesOptions}
								/>
								<ProductVariantForm
									productVariants={productVariants}
									setVariantsToSend={setVariantsToSend}
									defaultValues={defaultValues}
									setDefaultValues={setDefaultValues}
									finalVariants={finalVariants}
									setFinalVariants={setFinalVariants}
									resetKey={resetKey}
									sku={sku}
									variantImagesOptions={variantImagesOptions}
								/>
							</>
						) : null}

						<div className="flex justify-end pt-4 ">
							{currentStep > 1 && (
								<Button
									type="button"
									layout="outline"
									className="max-w-fit"
									// className="px-4 py-2 bg-gray-200 rounded"
									onClick={handleBack}>
									Back
								</Button>
							)}
							{currentStep < steps.length ? (
								<Button
									type="button"
									// className="ml-auto px-4 py-2 bg-blue-500 text-white rounded"
									onClick={handleNext}>
									Next
								</Button>
							) : null}
						</div>
						{(currentStep >= steps.length || id) && (
							<div>
								<DrawerButton
									id={id}
									title="Product"
									isSubmitting={isSubmitting}
								/>
							</div>
						)}
						{/* <DrawerButton id={id} title="Product" isSubmitting={isSubmitting} /> */}
					</form>
				</FormProvider>
			</main>
		</>
	);
};

export default ProductDrawer;
