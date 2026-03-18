import { Table, TableCell, TableHeader } from "@windmill/react-ui";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

//internal import

import MainDrawer from "@/components/drawer/MainDrawer";
import SearchAndFilter from "@/components/newComponents/SearchAndFilter";
import TableWrapperWithPagination from "@/components/newComponents/TableWrapperWithPagination";
import ReturnedDetailsDrawer from "@/components/returned/ReturnedDetailsDrawer";
import ReturnedTable from "@/components/returned/ReturnedTable";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import ReturnedServices from "@/services/ReturnedServices";

const Returned = () => {
  const { toggleDrawer, lang, setIsUpdate, isDrawerOpen } =
    useContext(SidebarContext);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 10;

  const query =
    `limit=${limit}&page=${page}` +
    `${filters.startDate ? `&startDate=${filters.startDate}` : ""}` +
    `${filters.endDate ? `&endDate=${filters.endDate}` : ""}`;
  const {
    data: returnedsData = { records: [], total: 0 },
    loading,
    error,
  } = useAsync(() => ReturnedServices.getAllReturneds(query), [query]);
  const toggleDrawerData = useToggleDrawer();
  const { serviceId } = toggleDrawerData;

  // 🔥 REFRESH ORDERS WHEN DRAWER CLOSES
  useEffect(() => {
    if (!isDrawerOpen) {
      setIsUpdate(true);
    }
  }, [isDrawerOpen, setIsUpdate]);

  const { t } = useTranslation();

  // react hooks
  const [isCheck, setIsCheck] = useState([]);

  const handleFilter = (values) => {
    setPage(1);
    setFilters(values);
  };

  return (
    <>
      <PageTitle>{t("Returned")}</PageTitle>
      <SearchAndFilter
        buttonText={t("Add Returned")}
        inputPlaceholder={t("Search Returned")}
        onClick={toggleDrawer}
        showAddButtom={false}
        showDateFilter={true}
        onSubmitFilter={handleFilter}
      />

      <TableWrapperWithPagination
        loading={loading}
        error={error}
        data={returnedsData}
        onPageChange={setPage}
      >
        <Table>
          <TableHeader>
            <tr>
              <TableCell>{t("IdTbl")}</TableCell>
              <TableCell>{t("Date")}</TableCell>
              <TableCell>{t("Name")}</TableCell>
              <TableCell>{t("Product")}</TableCell>
              {/* <TableCell className="text-center">
								{t("Payment Method")}
							</TableCell> */}
              <TableCell>{t("Amount")}</TableCell>
              <TableCell>{t("Status")}</TableCell>
              <TableCell>{t("Action")}</TableCell>
            </tr>
          </TableHeader>
          <ReturnedTable
            data={returnedsData.records}
            isCheck={isCheck}
            setIsCheck={setIsCheck}
            toggleDrawerData={toggleDrawerData}
          />
        </Table>
      </TableWrapperWithPagination>
      <MainDrawer setIsUpdate={setIsUpdate}>
        <ReturnedDetailsDrawer
          id={serviceId}
          data={returnedsData.records}
          lang={lang}
        />
      </MainDrawer>
    </>
  );
};

export default Returned;
