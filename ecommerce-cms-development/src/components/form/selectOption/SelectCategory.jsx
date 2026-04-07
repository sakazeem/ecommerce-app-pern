import { Select } from "@windmill/react-ui";
import React from "react";
import { useTranslation } from "react-i18next";

//internal import

import useAsync from "@/hooks/useAsync";
import CategoryServices from "@/services/CategoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const SelectCategory = ({ setCategory }) => {
	const { t } = useTranslation();
	const { data } = useAsync(CategoryServices.getAllCategoriesForCmsOptions);
	const { showingTranslateValue } = useUtilsFunction();

	return (
		<>
			<Select onChange={(e) => setCategory(e.target.value)}>
				<option value="All" defaultValue hidden>
					{t("Category")}
				</option>
				{data?.map((cat) => (
					<option key={cat.id} value={cat.id}>
						{showingTranslateValue(cat?.name)}
					</option>
				))}
			</Select>
		</>
	);
};

export default SelectCategory;
