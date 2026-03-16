import { Button, Table, TableCell, TableHeader } from "@windmill/react-ui";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

//internal import

import MainDrawer from "@/components/drawer/MainDrawer";
import SearchAndFilter from "@/components/newComponents/SearchAndFilter";
import TableWrapperWithPagination from "@/components/newComponents/TableWrapperWithPagination";
import OrderDetailsDrawer from "@/components/order/OrderDetailsDrawer";
import OrderTable from "@/components/order/OrderTable";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import OrderServices from "@/services/OrderServices";
import { Download } from "lucide-react";
import { toast } from "react-toastify";

const Order = () => {
  const { toggleDrawer, lang, setIsUpdate, isDrawerOpen } =
    useContext(SidebarContext);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const limit = 10;
  const query =
    `limit=${limit}&page=${page}` +
    `${filters.search ? `&search=${filters.search}` : ""}` +
    `${filters.startDate ? `&startDate=${filters.startDate}` : ""}` +
    `${filters.endDate ? `&endDate=${filters.endDate}` : ""}`;

  const {
    data: ordersData = { records: [], total: 0 },
    loading,
    error,
  } = useAsync(() => OrderServices.getAllOrders(query), [query]);

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

  const exportQuery = query
    .replace(`limit=${limit}&page=${page}&`, "")
    .replace(`limit=${limit}&page=${page}`, "");

  const downloadOrdersExcel = async () => {
    setExportLoading(true);
    try {
      toast.info("Preparing your download...");
      const response = await OrderServices.exportOrders(exportQuery);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to export orders");
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <PageTitle>{t("Order")}</PageTitle>
      <SearchAndFilter
        buttonText={t("Add Order")}
        inputPlaceholder={t("Search Order")}
        onClick={toggleDrawer}
        showAddButtom={false}
        showDateFilter={true}
        onSubmitFilter={handleFilter}
      />

      <div className="mb-4">
        <Button
          layout="outline"
          onClick={downloadOrdersExcel}
          disabled={exportLoading}
          className="flex gap-2 items-center rounded-md h-12 hover:brightness-95"
        >
          <span className="flex gap-2 items-center text-customBlack">
            <Download className="w-5 h-5" />
            {exportLoading ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <span>Export Orders</span>
            )}
          </span>
        </Button>
      </div>

      <TableWrapperWithPagination
        loading={loading}
        error={error}
        data={ordersData}
        onPageChange={setPage}
      >
        <Table>
          <TableHeader>
            <tr>
              <TableCell>{t("IdTbl")}</TableCell>
              <TableCell>{t("Date")}</TableCell>
              <TableCell>{t("Tracking Id")}</TableCell>
              <TableCell>{t("Name")}</TableCell>
              <TableCell className="text-center">
                {t("Payment Method")}
              </TableCell>
              <TableCell>{t("Order Amount")}</TableCell>
              <TableCell>{t("Shipping")}</TableCell>
              <TableCell>{t("Total")}</TableCell>
              <TableCell>{t("Status")}</TableCell>
              <TableCell>{t("Updated Date")}</TableCell>
              <TableCell>{t("Action")}</TableCell>
            </tr>
          </TableHeader>
          <OrderTable
            data={ordersData.records}
            isCheck={isCheck}
            setIsCheck={setIsCheck}
            toggleDrawerData={toggleDrawerData}
          />
        </Table>
      </TableWrapperWithPagination>
      <MainDrawer setIsUpdate={setIsUpdate}>
        <OrderDetailsDrawer
          id={serviceId}
          data={ordersData.records}
          lang={lang}
        />
      </MainDrawer>
    </>
  );
};

export default Order;
