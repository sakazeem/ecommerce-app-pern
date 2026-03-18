import { Button, Table, TableCell, TableHeader } from "@windmill/react-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

import SearchAndFilter from "@/components/newComponents/SearchAndFilter";
import TableWrapperWithPagination from "@/components/newComponents/TableWrapperWithPagination";
import SubscriberTable from "@/components/subscriber/SubscriberTable";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import SubscriberServices from "@/services/SubscriberServices";

const Subscriber = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const limit = 10;

  const query =
    `limit=${limit}&page=${page}` +
    `${filters.startDate ? `&startDate=${filters.startDate}` : ""}` +
    `${filters.endDate ? `&endDate=${filters.endDate}` : ""}`;

  const exportQuery = query
    .replace(`limit=${limit}&page=${page}&`, "")
    .replace(`limit=${limit}&page=${page}`, "");

  const {
    data: subscribersData = { records: [], total: 0 },
    loading,
    error,
  } = useAsync(() => SubscriberServices.getAllSubscribers(query), [query]);

  const { t } = useTranslation();

  const handleFilter = (values) => {
    setPage(1);
    setFilters(values);
  };

  const downloadExcel = async () => {
    setExportLoading(true);
    try {
      toast.info("Preparing your download...");
      const response = await SubscriberServices.exportSubscribers(exportQuery);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `subscribers_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to export subscribers");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <PageTitle>{t("Website subscribers List")}</PageTitle>
      <SearchAndFilter
        inputPlaceholder={t("Search Subscriber")}
        showAddButtom={false}
        showDateFilter={true}
        onSubmitFilter={handleFilter}
      />
      <div className="mb-4">
        <Button
          layout="outline"
          onClick={downloadExcel}
          disabled={exportLoading}
          className="flex gap-2 items-center rounded-md h-12 hover:brightness-95"
        >
          <span className="flex gap-2 items-center text-customBlack">
            <Download className="w-5 h-5" />
            {exportLoading ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <span>Export Subscribers</span>
            )}
          </span>
        </Button>
      </div>
      <TableWrapperWithPagination
        loading={loading}
        error={error}
        data={subscribersData}
        onPageChange={setPage}
      >
        <Table>
          <TableHeader>
            <tr>
              <TableCell>{t("IdTbl")}</TableCell>
              <TableCell>{t("Email")}</TableCell>
              <TableCell>{t("Date")}</TableCell>
            </tr>
          </TableHeader>
          <SubscriberTable data={subscribersData.records} />
        </Table>
      </TableWrapperWithPagination>
    </>
  );
};

export default Subscriber;
