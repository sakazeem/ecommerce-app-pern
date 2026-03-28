import { Button, Table, TableCell, TableHeader } from "@windmill/react-ui";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

//internal import

import MainDrawer from "@/components/drawer/MainDrawer";
import SearchAndFilter from "@/components/newComponents/SearchAndFilter";
import TableWrapperWithPagination from "@/components/newComponents/TableWrapperWithPagination";
import BulkUpload from "@/components/product/BulkUpload";
import ProductDrawer from "@/components/product/ProductDrawer";
import ProductTable from "@/components/product/ProductTable";
import UploadProductsExcel from "@/components/product/UploadProductsExcel";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import ProductServices from "@/services/ProductServices";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import UploadProductsPriceExcel from "@/components/product/UploadProductsPricesExcel";

const Product = () => {
  const { toggleDrawer, lang } = useContext(SidebarContext);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [stockSortOrder, setStockSortOrder] = useState(null);
  const limit = 10;
  const {
    data: productsData,
    loading,
    error,
  } = useAsync(
    () =>
      ProductServices.getAllProducts(
        `limit=${limit}&page=${page}${
          filters.search ? `&search=${filters.search}` : ""
        }${filters.sku ? `&sku=${filters.sku}` : ""}${
          stockSortOrder ? `&sortBy=stock&sortOrder=${stockSortOrder}` : ""
        }`,
      ),
    // ProductServices.getAllProducts(
    // 	`limit=${limit}&page=${page}${filters.search ? `&search=${filters.search}` : ""}`,
    // ),
    [page, filters, stockSortOrder],
  ); // 👈 refetch when page changes
  const history = useHistory();
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

  const downloadProductsExcel = async () => {
    setExportLoading(true);
    try {
      toast.info("Preparing your download, you will notified once it's ready.");
      const response = await ProductServices.exportProducts();
      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Filename
      link.setAttribute("download", "products.xlsx");

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading Excel:", err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilter = (values) => {
    setPage(1);
    setFilters(values);
  };
  const handleStockSort = () => {
    setPage(1);

    if (!stockSortOrder) {
      setStockSortOrder("ASC");
    } else if (stockSortOrder === "ASC") {
      setStockSortOrder("DESC");
    } else {
      setStockSortOrder(null);
    }
  };

  return (
    <>
      <PageTitle>{t("Product")}</PageTitle>
      <SearchAndFilter
        buttonText={t("AddProduct")}
        inputPlaceholder={t("SearchProduct")}
        onClick={toggleDrawer}
        showSkuFilter={true}
        onSubmitFilter={handleFilter}
        // onClick={() => {
        // 	if (serviceId) {
        // 		history.push(`/product/update/${serviceId}`);
        // 	} else {
        // 		history.push("/product/add");
        // 	}
        // }}
      />
      <div className="mb-4 flex flex-col/ gap-4">
        <Button
          layout="outline"
          onClick={downloadProductsExcel}
          disabled={exportLoading}
          className=" flex gap-2 items-center rounded-md h-12 flex-1 hover:brightness-95 "
        >
          <span className="flex gap-2 items-center justify-center text-customBlack">
            <div className="relative">
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </div>
            {exportLoading ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <span>Export Products</span>
            )}
          </span>
        </Button>
        {/* <ExcelProcessor /> */}
        {/* <UploadProductsPriceExcel /> */}
        <UploadProductsExcel />
        <BulkUpload />
      </div>

      {/* <UploadProductsExcel /> */}
      <TableWrapperWithPagination
        loading={loading}
        error={error}
        data={productsData}
        onPageChange={setPage}
      >
        <Table>
          <TableHeader>
            <tr>
              <TableCell>{t("IdTbl")}</TableCell>
              <TableCell>{t("NameTbl")}</TableCell>
              <TableCell>{t("SKUTbl")}</TableCell>
              <TableCell>{t("Brand")}</TableCell>
              <TableCell>{t("Categories")}</TableCell>
              <TableCell>
                {" "}
                <div className="flex items-center gap-2">
                  <span>{t("Remaining Stock")}</span>

                  <button
                    onClick={handleStockSort}
                    className="hover:bg-gray-200 p-1 rounded"
                    title="Sort by stock"
                  >
                    {stockSortOrder === "ASC" ? (
                      <span>▲</span>
                    ) : stockSortOrder === "DESC" ? (
                      <span>▼</span>
                    ) : (
                      <span>⇅</span>
                    )}
                  </button>
                </div>
              </TableCell>
              <TableCell>{t("Stock Threshold")}</TableCell>
              {/* <TableCell>{t("CategoriesTbl")}</TableCell> */}
              <TableCell className="text-center">{t("PublishedTbl")}</TableCell>
              <TableCell className="text-right">{t("ActionsTbl")}</TableCell>
            </tr>
          </TableHeader>
          <ProductTable
            data={productsData.records}
            isCheck={isCheck}
            setIsCheck={setIsCheck}
            toggleDrawerData={toggleDrawerData}
          />
        </Table>
      </TableWrapperWithPagination>

      <MainDrawer>
        <ProductDrawer id={serviceId} data={productsData.records} lang={lang} />
      </MainDrawer>
    </>
  );
};

export default Product;
