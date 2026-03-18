import { Table, TableCell, TableHeader } from "@windmill/react-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import AppuserTable from "@/components/appuser/AppuserTable";
import SearchAndFilter from "@/components/newComponents/SearchAndFilter";
import TableWrapperWithPagination from "@/components/newComponents/TableWrapperWithPagination";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import AppuserServices from "@/services/AppuserServices";

const Appuser = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 10;

  const query =
    `limit=${limit}&page=${page}` +
    `${filters.search ? `&search=${filters.search}` : ""}` +
    `${filters.startDate ? `&startDate=${filters.startDate}` : ""}` +
    `${filters.endDate ? `&endDate=${filters.endDate}` : ""}`;

  const {
    data: appusersData = { records: [], total: 0 },
    loading,
    error,
  } = useAsync(() => AppuserServices.getAllAppuser(query), [query]);

  const { t } = useTranslation();

  const handleFilter = (values) => {
    setPage(1);
    setFilters(values);
  };

  return (
    <>
      <PageTitle>{t("Customers")}</PageTitle>
      <SearchAndFilter
        inputPlaceholder={t("Search Customer")}
        showAddButtom={false}
        showDateFilter={true}
        onSubmitFilter={handleFilter}
      />
      <div>
        <TableWrapperWithPagination
          loading={loading}
          error={error}
          data={appusersData}
          onPageChange={setPage}
        >
          <Table>
            <TableHeader>
              <tr>
                <TableCell>{t("IdTbl")}</TableCell>
                <TableCell>{t("NameTbl")}</TableCell>
                <TableCell>{t("Email")}</TableCell>
                <TableCell>{t("Phone")}</TableCell>
                <TableCell className="text-center">{t("Created At")}</TableCell>
                <TableCell className="text-center">{t("ActionsTbl")}</TableCell>
              </tr>
            </TableHeader>
            <AppuserTable data={appusersData.records} />
          </Table>
        </TableWrapperWithPagination>
      </div>
    </>
  );
};

export default Appuser;
