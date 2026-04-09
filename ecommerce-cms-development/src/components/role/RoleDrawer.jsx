import { useContext, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useTranslation } from "react-i18next";

//internal import
import DrawerButton from "@/components/form/button/DrawerButton";
import { SidebarContext } from "@/context/SidebarContext";
import RoleServices from "@/services/RoleServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useForm } from "react-hook-form";
import InputAreaField from "../form/fields/InputAreaField";
import DrawerHeader from "../newComponents/DrawerHeader";

const RoleDrawer = ({ id, data }) => {
	const { t } = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [permissions, setPermissions] = useState([]);
	const [groupedPermissions, setGroupedPermissions] = useState({});
	const [selectedPermissions, setSelectedPermissions] = useState([]);
	const [resData, setResData] = useState({});
	const { closeDrawer, setIsUpdate, isDrawerOpen } = useContext(SidebarContext);

	// useEffect(() => {
	// 	CategoryServices.getAllCategoriesForOptions(id).then((data) => {
	// 		setParentCategories(data);
	// 	});
	// }, []);

	useEffect(() => {
		const fetchPermissions = async () => {
			try {
				const res = await RoleServices.getAllPermissions(); // create this API
				const visiblePermissions = res.records.filter((p) => p);
				// const visiblePermissions = res.records.filter((p) => p.show);
				setPermissions(visiblePermissions);

				const grouped = visiblePermissions.reduce((acc, perm) => {
					if (!acc[perm.parent]) acc[perm.parent] = [];
					acc[perm.parent].push(perm);
					return acc;
				}, {});

				setGroupedPermissions(grouped);
			} catch (err) {
				notifyError(err?.message);
			}
		};

		fetchPermissions();
	}, []);

	const defaultValues = {
		name: null,
		description: null,
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

			const roleData = {
				...data,
				permissions: selectedPermissions,
			};

			if (id) {
				const res = await RoleServices.updateRole(id, roleData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
				setSelectedPermissions([]);
			} else {
				const res = await RoleServices.addRole(roleData);
				setIsUpdate(true);
				setIsSubmitting(false);
				notifySuccess(res.message);
				closeDrawer();
				reset();
				setSelectedPermissions([]);
			}
		} catch (err) {
			setIsSubmitting(false);
			notifyError(err ? err?.response?.data?.message : err?.message);
		}
	};

	const handlePermissionChange = (id) => {
		setSelectedPermissions((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);
	};

	const handleSelectAll = (parent, perms) => {
		const ids = perms.map((p) => p.id);

		const allSelected = ids.every((id) => selectedPermissions.includes(id));

		if (allSelected) {
			setSelectedPermissions((prev) => prev.filter((id) => !ids.includes(id)));
		} else {
			setSelectedPermissions((prev) => [...new Set([...prev, ...ids])]);
		}
	};

	useEffect(() => {
		if (id && isDrawerOpen) {
			(async () => {
				try {
					const res = await RoleServices.getRoleById(id);
					if (res) {
						setResData(res);
						setValue("name", res.name);
						setValue("description", res.description);
						setSelectedPermissions(res.permissions?.map((p) => p.id) || []);
					}
				} catch (err) {
					notifyError(err ? err.response?.data?.message : err.message);
				}
			})();
		} else {
			reset();
			setSelectedPermissions([]);
		}
	}, [id, isDrawerOpen, setValue, clearErrors, data]);

	return (
		<>
			<DrawerHeader
				id={id}
				register={register}
				updateTitle={t("Update Role")}
				updateDescription={""}
				addTitle={t("Add Role")}
				addDescription={""}
			/>

			<Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-customGray-700 dark:text-customGray-200">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="p-6 flex-grow scrollbar-hide w-full max-h-full pb-40">
						<InputAreaField
							label={t("Name")}
							required={true}
							register={register}
							inputLabel="name"
							inputName="name"
							inputType="text"
							inputPlaceholder={t("Enter role name")}
							errorName={errors.name}
						/>
						<InputAreaField
							label={t("Description")}
							required={false}
							register={register}
							inputLabel="description"
							inputName="description"
							inputType="text"
							inputPlaceholder={t("Enter role description")}
							errorName={errors.description}
						/>

						<div className="mt-1">
							<h3 className="text-lg font-semibold mb-3">Permissions</h3>

							{Object.keys(groupedPermissions)
								.sort()
								.map((parent) => (
									<div key={parent} className="mb-4 border p-3 rounded-lg">
										<div className="flex justify-between items-center mb-2">
											<h4 className="font-medium capitalize">{parent}</h4>

											<button
												type="button"
												onClick={() =>
													handleSelectAll(parent, groupedPermissions[parent])
												}
												className="text-sm text-blue-500 hover:underline">
												Select All
											</button>
										</div>

										<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
											{groupedPermissions[parent].map((perm) => (
												<label
													key={perm.id}
													className="flex items-center gap-2 cursor-pointer text-gray-700 pt-1">
													<input
														type="checkbox"
														checked={selectedPermissions.includes(perm.id)}
														onChange={() => handlePermissionChange(perm.id)}
													/>
													<span>{perm.description}</span>
												</label>
											))}
										</div>
									</div>
								))}
						</div>
					</div>

					<DrawerButton id={id} title="Role" isSubmitting={isSubmitting} />
				</form>
			</Scrollbars>
		</>
	);
};

export default RoleDrawer;
