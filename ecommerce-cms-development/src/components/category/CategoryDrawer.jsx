import { useContext, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";

//internal import
import DrawerButton from "@/components/form/button/DrawerButton";
import { SidebarContext } from "@/context/SidebarContext";
import useTranslationValue from "@/hooks/useTranslationValue";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CategoryServices from "@/services/CategoryServices";
import ParentCategoryServices from "@/services/ParentCategoryServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useFieldArray, useForm } from "react-hook-form";
import ImageSelectorField from "../form/fields/ImageSelectorField";
import InputAreaField from "../form/fields/InputAreaField";
import InputSelectField from "../form/fields/InputSelectField";
import SwitchToggleField from "../form/fields/SwitchToggleField";
import TextAreaField from "../form/fields/TextAreaField";
import DrawerHeader from "../newComponents/DrawerHeader";
import { IfMultilingual } from "../IfMultilingual";
import TranslationFields from "../newComponents/TranslationFields";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { replaceEmptyWithNull } from "@/utils/globals";

const CategoryDrawer = ({ id, data }) => {
	const { t } = useTranslation();
	const [selectedImage, setSelectedImage] = useState(null);
	const [selectedImageUrl, setSelectedImageUrl] = useState(null);
	const [status, setStatus] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [resData, setResData] = useState({});
	const [parentCategories, setParentCategories] = useState([]);
	const { closeDrawer, setIsUpdate, isDrawerOpen } = useContext(SidebarContext);
	const { selectedLanguage } = useGlobalSettings();

	const defaultValues = {
		parentId: null,
		icon: null,
		translations: [
			{
				title: null,
				description: null,
				slug: null,
				// language_id: null,
				language_id: selectedLanguage.id,
			},
		],
	};

	const {
		control,
		register,
		handleSubmit,
		setValue,
		clearErrors,
		reset,
		formState: { errors },
	} = useForm({ defaultValues });

	const { showSelectedLanguageTranslation } = useUtilsFunction();

	useEffect(() => {
		CategoryServices.getAllCategoriesForOptions(id).then((data) => {
			setParentCategories(data);
		});
	}, []);

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true);

			const categoryData = replaceEmptyWithNull({
				...data,
				icon: selectedImage,
				status,
			});

			if (id) {
				const res = await CategoryServices.updateCategory(id, categoryData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
			} else {
				const res = await CategoryServices.addCategory(categoryData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
			}
		} catch (err) {
			setIsSubmitting(false);
			notifyError(err ? err?.response?.data?.message : err?.message);
		}
	};

	const translationFields = [
		{
			name: "title",
			required: true,
			fieldType: "inputArea",
			isVertical: true,
		},
		{
			name: "slug",
			required: true,
			fieldType: "inputArea",
			isVertical: true,
		},
		{
			name: "tag",
			required: false,
			fieldType: "inputArea",
			isVertical: true,
		},
		{
			name: "description",
			fieldType: "textArea",
			isVertical: true,
		},
	];

	useEffect(() => {
		setSelectedImage(null);
		setSelectedImageUrl(null);
		setStatus(true);
		if (id && isDrawerOpen) {
			(async () => {
				try {
					const res = await CategoryServices.getCategoryById(id);
					if (res) {
						setResData(res);
						// setValue("title", res.title["en"]);
						setValue("translations", res.translations);
						setValue("parentId", res.parent_id);
						setValue("slug", res.slug);
						setSelectedImage(res.icon);
						setSelectedImageUrl(
							res.cat_icon.url
								? import.meta.env.VITE_APP_CLOUDINARY_URL + res.cat_icon.url
								: null,
						);
						setStatus(res.status || false);
					}
				} catch (err) {
					notifyError(err ? err.response?.data?.message : err.message);
				}
			})();
		} else {
			reset();
		}
	}, [id, setValue, clearErrors, data]);

	return (
		<>
			<DrawerHeader
				id={id}
				register={register}
				updateTitle={t("UpdateCategory")}
				updateDescription={t("UpdateCategoryDescription")}
				addTitle={t("AddCategoryTitle")}
				addDescription={t("AddCategoryDescription")}
			/>

			<Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-customGray-700 dark:text-customGray-200">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="p-6 flex-grow scrollbar-hide w-full max-h-full pb-40">
						{/* Translations */}
						<TranslationFields
							control={control}
							errors={errors}
							register={register}
							translationFields={translationFields}
						/>
						<InputSelectField
							label={t("SelectParentCategory")}
							register={register}
							inputLabel={t("parentCategory")}
							inputName="parentId"
							inputPlaceholder={t("SelectParentCategory")}
							options={parentCategories?.map((pCat, index) => {
								return (
									<option value={pCat.id} key={index}>
										{showSelectedLanguageTranslation(
											pCat.translations,
											"title",
										)}
									</option>
								);
							})}
							errorName={errors.parentId}
						/>
						<ImageSelectorField
							label={t("CategoryIcon")}
							selectedImage={selectedImage}
							setSelectedImage={setSelectedImage}
							selectedImageUrl={selectedImageUrl}
							setSelectedImageUrl={setSelectedImageUrl}
						/>
						<SwitchToggleField
							label={t("Status")}
							handleProcess={setStatus}
							processOption={status}
						/>
					</div>

					<DrawerButton id={id} title="Category" isSubmitting={isSubmitting} />
				</form>
			</Scrollbars>
		</>
	);
};

export default CategoryDrawer;
