import { TableBody, TableCell, TableRow } from "@windmill/react-ui";

//internal import

import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { formatDate } from "@/utils/globals";
import { Eye } from "lucide-react";

const OrderTable = ({
  data,
  toggleDrawerData,
  isCheck,
  setIsCheck,
  useParamId,
}) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = toggleDrawerData;
  const { showSelectedLanguageTranslation } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, parseInt(id)]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== parseInt(id)));
    }
  };
  return (
    <>
      {isCheck?.length < 1 && (
        <DeleteModal useParamId={useParamId} id={serviceId} title={title} />
      )}

      <TableBody>
        {data?.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-semibold uppercase text-xs">
              {order?.id}
            </TableCell>
            <TableCell className="text-sm">
              {formatDate(order.created_at)}
            </TableCell>
            <TableCell className="text-sm">{order.tracking_id}</TableCell>
            <TableCell className="text-sm">
              {order.guest_first_name
                ? order.guest_first_name + " " + (order.guest_last_name || "")
                : order.app_user_id
                  ? order.user?.name
                  : "-"}
            </TableCell>
            <TableCell className="text-sm text-center uppercase">
              {order.payment_method}
            </TableCell>
            <TableCell className="text-sm">Rs. {order.order_amount}</TableCell>
            <TableCell className="text-sm">Rs. {order.shipping}</TableCell>
            <TableCell className="text-sm">Rs. {order.total}</TableCell>
            <TableCell className={`text-sm`}>
              <span
                className={`px-4 py-1 rounded-full text-xs font-bold uppercase p4 tracking-wide shadow-sm ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300"
                    : order.status === "in_progress"
                      ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800 ring-1 ring-red-300"
                        : order.status === "delivered"
                          ? "bg-green-100 text-green-800 ring-1 ring-green-300"
                          : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </TableCell>
            <TableCell className="text-sm">
              {formatDate(order.updated_at)}
            </TableCell>
            <TableCell>
              <button
                onClick={() => {
                  handleUpdate(order.id);
                }}
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View</span>
              </button>
              {/* <EditDeleteButton
								id={order?.id}
								parent={order}
								isCheck={isCheck}
								children={order?.children}
								handleUpdate={handleUpdate}
								handleModalOpen={handleModalOpen}
								title={showSelectedLanguageTranslation(
									order?.translations,
									"title",
								)}
							/> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default OrderTable;
