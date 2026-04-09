import { useContext, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";

//internal import
import DrawerButton from "@/components/form/button/DrawerButton";
import { SidebarContext } from "@/context/SidebarContext";
import useTranslationValue from "@/hooks/useTranslationValue";
import UserServices from "@/services/UserServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import DrawerHeader from "../newComponents/DrawerHeader";
import InputAreaField from "../form/fields/InputAreaField";
import SwitchToggleField from "../form/fields/SwitchToggleField";
import TranslationFields from "../newComponents/TranslationFields";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import InputSelectField from "../form/fields/InputSelectField";
import RoleServices from "@/services/RoleServices";

const UserDrawer = ({ id, data }) => {
	const { t } = useTranslation();
	const [status, setStatus] = useState(true);
	const [roles, setRoles] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [resData, setResData] = useState({});
	const { closeDrawer, setIsUpdate, isDrawerOpen } = useContext(SidebarContext);
	const { selectedLanguage } = useGlobalSettings();

	useEffect(() => {
		RoleServices.getAllRoles(id).then((data) => {
			setRoles(data?.records);
		});
	}, []);

	const defaultValues = {
		translations: [
			{
				title: null,
				description: null,
				slug: null,
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

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true);

			const userData = {
				...data,
				status,
			};

			if (id) {
				const res = await UserServices.updateUser(id, userData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
			} else {
				const res = await UserServices.addUser(userData);
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

	useEffect(() => {
		if (id && isDrawerOpen) {
			(async () => {
				try {
					const res = await UserServices.getUserById(id);
					if (res) {
						setResData(res);
						setValue("first_name", res.first_name);
						setValue("last_name", res.last_name);
						setValue("email", res.email);
						setValue("role_id", res.role_id);
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
				updateTitle={t("Update User")}
				updateDescription={""}
				addTitle={t("Add User")}
				addDescription={""}
			/>

			<Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-customGray-700 dark:text-customGray-200">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="p-6 flex-grow scrollbar-hide w-full max-h-full pb-40">
						<InputAreaField
							label={t("First Name")}
							required={true}
							register={register}
							inputLabel="first_name"
							inputName="first_name"
							inputType="text"
							inputPlaceholder={t("Enter user first name")}
							errorName={errors.first_name}
						/>
						<InputAreaField
							label={t("Last Name")}
							required={true}
							register={register}
							inputLabel="last_name"
							inputName="last_name"
							inputType="text"
							inputPlaceholder={t("Enter user last name")}
							errorName={errors.last_name}
						/>
						<InputAreaField
							label={t("Email")}
							required={true}
							register={register}
							inputLabel="email"
							inputName="email"
							inputType="email"
							inputPlaceholder={t("Enter user email")}
							errorName={errors.email}
						/>
						<InputAreaField
							label={t("Password")}
							register={register}
							inputLabel="password"
							inputName="password"
							// inputType="password"
							inputPlaceholder={t("Enter user password")}
							errorName={errors.password}
						/>
						<InputSelectField
							label={t("Select Role")}
							register={register}
							inputLabel={t("role")}
							inputName="role_id"
							inputPlaceholder={t("Select role")}
							options={roles?.map((pCat, index) => {
								return (
									<option value={pCat.id} key={index}>
										{pCat.name}
									</option>
								);
							})}
							errorName={errors.role_id}
						/>
					</div>

					<DrawerButton id={id} title="User" isSubmitting={isSubmitting} />
				</form>
			</Scrollbars>
		</>
	);
};

export default UserDrawer;
