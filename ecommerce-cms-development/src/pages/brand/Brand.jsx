import { Table, TableCell, TableHeader } from "@windmill/react-ui";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

//internal import

import CheckBox from "@/components/form/others/CheckBox";
import SearchAndFilter from "@/components/newComponents/SearchAndFilter";
import TableWrapperWithPagination from "@/components/newComponents/TableWrapperWithPagination";
import PageTitle from "@/components/Typography/PageTitle";
import BrandTable from "@/components/brand/BrandTable";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import BrandServices from "@/services/BrandServices";
import MainDrawer from "@/components/drawer/MainDrawer";
import BrandDrawer from "@/components/brand/BrandDrawer";

const Brand = () => {
	const { toggleDrawer, lang } = useContext(SidebarContext);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({});
	const [limit, setLimit] = useState(10);
	const {
		data: brandsData,
		loading,
		error,
	} = useAsync(
		() =>
			BrandServices.getAllBrands(
				`limit=${limit}&page=${page}${filters.search ? `&search=${filters.search}` : ""}`,
			),
		[page, filters, limit],
	);
	const toggleDrawerData = useToggleDrawer();
	const { serviceId } = toggleDrawerData;

	const { t } = useTranslation();

	// react hooks
	const [isCheckAll, setIsCheckAll] = useState(false);
	const [isCheck, setIsCheck] = useState([]);

	const handleSelectAll = () => {
		setIsCheckAll(!isCheckAll);
		setIsCheck(data[0]?.children.map((li) => li.id));
		if (isCheckAll) {
			setIsCheck([]);
		}
	};

	const handleFilter = (values) => {
		setPage(1);
		setFilters(values);
	};

	return (
		<>
			<PageTitle>{t("Brand")}</PageTitle>
			<SearchAndFilter
				buttonText={t("Add Brand")}
				inputPlaceholder={t("Search Brand")}
				onClick={toggleDrawer}
				onSubmitFilter={handleFilter}
			/>
			<TableWrapperWithPagination
				loading={loading}
				error={error}
				data={brandsData}
				onPageChange={setPage}
				onLimitChange={setLimit}>
				<Table>
					<TableHeader>
						<tr>
							{/* <TableCell>
								<CheckBox
									type="checkbox"
									name="selectAll"
									id="selectAll"
									handleClick={handleSelectAll}
									isChecked={isCheckAll}
								/>
							</TableCell> */}
							<TableCell>{t("IdTbl")}</TableCell>
							<TableCell>{t("Logo")}</TableCell>
							<TableCell>{t("NameTbl")}</TableCell>
							{/* <TableCell>{t("Description")}</TableCell> */}
							<TableCell className="text-center">
								{t("Show On Homepage")}
							</TableCell>
							<TableCell className="text-center">{t("PublishedTbl")}</TableCell>
							<TableCell className="text-right">{t("ActionsTbl")}</TableCell>
						</tr>
					</TableHeader>
					<BrandTable
						data={brandsData.records}
						isCheck={isCheck}
						setIsCheck={setIsCheck}
						toggleDrawerData={toggleDrawerData}
					/>
				</Table>
			</TableWrapperWithPagination>

			<MainDrawer>
				<BrandDrawer id={serviceId} data={brandsData.records} lang={lang} />
			</MainDrawer>
		</>
	);
};

export default Brand;
