import { useEffect, useRef, useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import OrderServices from "@/services/OrderServices";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import DrawerHeader from "../newComponents/DrawerHeader";
import CCLDetailsFeilds from "./CCLDetailsFeilds";

const inputCls =
  "border rounded-lg p-2 text-sm w-full dark:bg-customGray-700 dark:border-customGray-500 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
const btnPrimary =
  "px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2";
const btnSecondary =
  "px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-customGray-700 dark:hover:bg-customGray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors";

const Spinner = ({ small }) => (
  <svg
    className={`animate-spin ${small ? "h-3 w-3" : "h-4 w-4"}`}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const SectionCard = ({ children }) => (
  <div className="bg-white dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600 shadow-sm">
    {children}
  </div>
);

const SectionHeader = ({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving,
}) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h3>
    {!isEditing ? (
      <button
        onClick={onEdit}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Edit
      </button>
    ) : (
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving} className={btnPrimary}>
          {saving ? <Spinner /> : <CheckIcon />} Save
        </button>
        <button onClick={onCancel} disabled={saving} className={btnSecondary}>
          Cancel
        </button>
      </div>
    )}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start text-sm">
    <span className="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">
      {label}
    </span>
    <span className="font-medium text-gray-900 dark:text-gray-100">
      {value || "-"}
    </span>
  </div>
);

// ── Product Add Panel ─────────────────────────────────────────────────────────
// Uses /product/only-titles for the searchable dropdown, then fetches full
// product on selection to resolve variants & price (pvb.sale_price).
const ProductAddPanel = ({ onAdd }) => {
  const [allTitles, setAllTitles] = useState([]); // [{ product_id, title }]
  const [loadingTitles, setLoadingTitles] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [selected, setSelected] = useState(null); // full product object
  const [variant, setVariant] = useState(null); // chosen product_variant
  const [qty, setQty] = useState(1);
  const inputRef = useRef(null);

  useEffect(() => {
    ProductServices.getAllProductTitles()
      .then((data) => setAllTitles(Array.isArray(data) ? data : []))
      .catch(() => setAllTitles([]))
      .finally(() => setLoadingTitles(false));
  }, []);

  const filtered = query.trim()
    ? allTitles.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()),
      )
    : allTitles;

  const selectTitle = async (item) => {
    setQuery(item.title);
    setOpen(false);
    setSelected(null);
    setVariant(null);
    setLoadingProduct(true);
    try {
      const full = await ProductServices.getProductById(item.product_id);
      setSelected(full);
      // Default to first variant if any
      const firstVariant = full.product_variants?.[0] ?? null;
      setVariant(firstVariant);
    } catch {
      notifyError("Failed to load product details");
    } finally {
      setLoadingProduct(false);
    }
  };

  // Resolve price from variant → branches[0].pvb.sale_price
  const getVariantPrice = (v) => {
    if (!v) return 0;
    return parseFloat(
      v.branches?.[0]?.pvb?.sale_price ?? v.sale_price ?? v.base_price ?? 0,
    );
  };

  // Label shown in variant dropdown: "Color: Red / Size: M (SKU-001)"
  const variantLabel = (v) => {
    const attrs =
      v.attributes
        ?.map(
          (a) => `${a.name?.en ?? a.name}: ${a.pva?.value?.en ?? a.pva?.value}`,
        )
        .join(" / ") ?? "";
    return attrs ? `${attrs} (${v.sku})` : v.sku;
  };

  const handleAdd = () => {
    if (!selected) return;
    const title = selected.translations?.[0]?.title ?? query;
    const price = getVariantPrice(variant);
    const sku = variant?.sku ?? selected.sku ?? "";
    onAdd({
      product_id: variant ? null : selected.id,
      product_variant_id: variant?.id ?? null,
      sku,
      product_title: title,
      price,
      quantity: qty,
    });
    setSelected(null);
    setVariant(null);
    setQuery("");
    setQty(1);
  };

  const hasVariants = selected?.product_variants?.length > 0;
  const unitPrice = getVariantPrice(variant);

  return (
    <div className="border border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10 mt-3">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3">
        Add Product
      </p>

      {/* ── Searchable dropdown ── */}
      <div className="relative mb-3">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setSelected(null);
            setVariant(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={
            loadingTitles ? "Loading products…" : "Search product name…"
          }
          disabled={loadingTitles}
          className={inputCls + " pr-8"}
        />
        {/* chevron / spinner */}
        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          {loadingTitles ? (
            <Spinner small />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </span>

        {open && !loadingTitles && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-customGray-800 border border-gray-200 dark:border-customGray-600 rounded-lg shadow-xl max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-gray-400">
                No products found
              </p>
            )}
            {filtered.slice(0, 50).map((item) => (
              <button
                key={item.product_id}
                onMouseDown={() => selectTitle(item)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-customGray-700 border-b border-gray-100 dark:border-customGray-600 last:border-0"
              >
                {item.title} ({item?.product?.sku})
              </button>
            ))}
          </div>
        )}
      </div>

      {loadingProduct && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Spinner small /> Loading product…
        </div>
      )}

      {/* ── Variant selector ── */}
      {selected && hasVariants && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Variant
          </label>
          <select
            className={inputCls}
            value={variant?.id ?? ""}
            onChange={(e) => {
              const v = selected.product_variants.find(
                (x) => x.id == e.target.value,
              );
              setVariant(v ?? null);
            }}
          >
            {selected.product_variants.map((v) => (
              <option key={v.id} value={v.id}>
                {variantLabel(v)} — Rs. {getVariantPrice(v).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Qty + price + add ── */}
      {selected && (
        <div className="flex items-end gap-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Qty
            </label>

            <div className="flex items-center border border-gray-300 dark:border-customGray-600 rounded-lg overflow-hidden h-[42px]">
              <button
                type="button"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="w-10 h-full flex items-center justify-center bg-gray-100 dark:bg-customGray-700 hover:bg-gray-200 dark:hover:bg-customGray-600 text-lg font-semibold"
              >
                -
              </button>

              <div className="w-12 text-center text-sm font-medium dark:text-white">
                {qty}
              </div>

              <button
                type="button"
                onClick={() => setQty((prev) => prev + 1)}
                className="w-10 h-full flex items-center justify-center bg-gray-100 dark:bg-customGray-700 hover:bg-gray-200 dark:hover:bg-customGray-600 text-lg font-semibold"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Unit Price
            </label>
            <input
              readOnly
              value={`Rs. ${unitPrice.toFixed(2)}`}
              className={
                inputCls +
                " bg-gray-100 dark:bg-customGray-600 cursor-not-allowed text-gray-500"
              }
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!variant && hasVariants}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded-lg font-medium whitespace-nowrap"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Drawer ───────────────────────────────────────────────────────────────
const OrderDetailsDrawer = ({ id }) => {
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const orderStatuses = ["pending", "in_progress", "cancelled", "delivered"];

  const [shippingCity, setShippingCity] = useState("");
  const [shippingService, setShippingService] = useState("");
  const [shippingWeight, setShippingWeight] = useState("");
  const [courierTrackingId, setCourierTrackingId] = useState();

  const [editCustomer, setEditCustomer] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editItems, setEditItems] = useState(false);
  const [editPayment, setEditPayment] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customerForm, setCustomerForm] = useState({});
  const [addressForm, setAddressForm] = useState({});
  const [itemsForm, setItemsForm] = useState([]);
  const [addQueue, setAddQueue] = useState([]);
  const [shippingFee, setShippingFee] = useState("");

  const initForms = (res) => {
    const userName = res.user?.name || "";
    const spaceIdx = userName.indexOf(" ");
    setCustomerForm({
      guest_first_name:
        res.guest_first_name ||
        (spaceIdx > -1 ? userName.slice(0, spaceIdx) : userName),
      guest_last_name:
        res.guest_last_name ||
        (spaceIdx > -1 ? userName.slice(spaceIdx + 1) : ""),
      guest_email: res.guest_email || res.user?.email || "",
      guest_phone: res.guest_phone || res.user?.phone || "",
    });
    setAddressForm({
      shipping_address: res.shipping_address || "",
      shipping_apartment: res.shipping_apartment || "",
      shipping_city: res.shipping_city || "",
      shipping_country: res.shipping_country || "",
      shipping_postal_code: res.shipping_postal_code || "",
    });
    setItemsForm(
      (res.order_items || []).map((i) => ({ id: i.id, quantity: i.quantity })),
    );
    setAddQueue([]);
    setShippingFee(res.shipping || "");
  };

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await OrderServices.getOrderById(id);
      if (!res) return;
      setOrderDetails(res);
      initForms(res);
      if (res.courier_details) {
        const d = JSON.parse(res.courier_details);
        setShippingCity(d.city);
        setShippingService(d.service);
        setShippingWeight(d.weight);
        setCourierTrackingId(d.trackingId);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const save = async (section, payload) => {
    try {
      setSaving(true);
      await OrderServices.updateOrderDetails(id, payload);
      notifySuccess("Order updated");
      await load();
      if (section === "customer") setEditCustomer(false);
      if (section === "address") setEditAddress(false);
      if (section === "items") {
        setEditItems(false);
        setAddQueue([]);
      }
      if (section === "payment") setEditPayment(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelSection = (section) => {
    initForms(orderDetails);
    if (section === "customer") setEditCustomer(false);
    if (section === "address") setEditAddress(false);
    if (section === "items") {
      setEditItems(false);
      setAddQueue([]);
    }
    if (section === "payment") setEditPayment(false);
  };

  const handleStatusUpdate = async (status) => {
    try {
      setIsUpdatingStatus(true);
      setShowStatusDropdown(false);
      await OrderServices.updateOrderStatus(id, { status });
      setOrderDetails((p) => ({ ...p, status }));
      notifySuccess(`Status updated to ${status}`);
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const submitShippingDetails = async () => {
    if (!shippingCity || !shippingService || !shippingWeight) {
      notifyError("Please fill all shipping details");
      return;
    }
    await OrderServices.updateOrder(id, {
      courier_details: JSON.stringify({
        city: shippingCity,
        service: shippingService,
        weight: shippingWeight,
      }),
    });
    notifySuccess("Shipping details saved");
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  if (loading)
    return (
      <>
        <DrawerHeader id={id} updateTitle="Order Details" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
        </div>
      </>
    );

  const removeIds = itemsForm.filter((f) => f._remove).map((f) => f.id);
  const changedQtys = itemsForm
    .filter((f) => !f._remove)
    .map((f) => ({ id: f.id, quantity: f.quantity }));
  const displayName = orderDetails.guest_first_name
    ? `${orderDetails.guest_first_name} ${orderDetails.guest_last_name || ""}`.trim()
    : orderDetails.user?.name || "-";

  const liveSubtotal = [
    ...(orderDetails.order_items || [])
      .filter((i) => !removeIds.includes(i.id))
      .map((i) => {
        const f = itemsForm.find((x) => x.id === i.id);
        return (parseFloat(i.price) / i.quantity) * (f?.quantity ?? i.quantity);
      }),
    ...addQueue.map((a) => a.price * a.quantity),
  ].reduce((s, v) => s + v, 0);

  return (
    <>
      <DrawerHeader id={id} updateTitle="Order Details" />
      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-customGray-700 dark:text-customGray-200">
        <div className="p-6 space-y-4">
          {/* Order Header */}
          <div className="bg-gray-50 dark:bg-customGray-800 rounded-xl p-5 border border-gray-200 dark:border-customGray-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Order #{orderDetails.tracking_id}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(orderDetails.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={isUpdatingStatus}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border ${statusColors[orderDetails.status] || statusColors.pending}`}
                >
                  {orderDetails.status}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showStatusDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowStatusDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white dark:bg-customGray-800 border border-gray-200 dark:border-customGray-600 z-50">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-100 dark:border-customGray-600">
                        Update Status
                      </div>
                      {orderStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(s)}
                          disabled={s === orderDetails.status}
                          className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between ${s === orderDetails.status ? "bg-gray-50 dark:bg-customGray-700 cursor-default" : "hover:bg-gray-50 dark:hover:bg-customGray-750"}`}
                        >
                          <span className="capitalize font-medium">{s}</span>
                          {s === orderDetails.status && (
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CCL Shipping Details */}
          <CCLDetailsFeilds
            shippingCity={shippingCity}
            shippingService={shippingService}
            shippingWeight={shippingWeight}
            setShippingCity={setShippingCity}
            setShippingService={setShippingService}
            setShippingWeight={setShippingWeight}
            setShowShippingFields={() => {}}
            submitShippingDetails={submitShippingDetails}
            courierTrackingId={courierTrackingId}
          />

          {/* Customer Information */}
          <SectionCard>
            <SectionHeader
              title="Customer Information"
              isEditing={editCustomer}
              onEdit={() => setEditCustomer(true)}
              onSave={() => save("customer", customerForm)}
              onCancel={() => cancelSection("customer")}
              saving={saving}
            />
            {editCustomer ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["First Name", "guest_first_name"],
                  ["Last Name", "guest_last_name"],
                  ["Email", "guest_email"],
                  ["Phone", "guest_phone"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {label}
                    </label>
                    <input
                      className={inputCls}
                      value={customerForm[key]}
                      onChange={(e) =>
                        setCustomerForm((p) => ({
                          ...p,
                          [key]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <InfoRow label="Name" value={displayName} />
                <InfoRow
                  label="Email"
                  value={orderDetails.user?.email || orderDetails.guest_email}
                />
                <InfoRow
                  label="Phone"
                  value={orderDetails.user?.phone || orderDetails.guest_phone}
                />
              </div>
            )}
          </SectionCard>

          {/* Shipping Address */}
          <SectionCard>
            <SectionHeader
              title="Shipping Address"
              isEditing={editAddress}
              onEdit={() => setEditAddress(true)}
              onSave={() => save("address", addressForm)}
              onCancel={() => cancelSection("address")}
              saving={saving}
            />
            {editAddress ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">
                    Address
                  </label>
                  <input
                    className={inputCls}
                    value={addressForm.shipping_address}
                    onChange={(e) =>
                      setAddressForm((p) => ({
                        ...p,
                        shipping_address: e.target.value,
                      }))
                    }
                  />
                </div>
                {[
                  ["Apartment / Unit", "shipping_apartment"],
                  ["City", "shipping_city"],
                  ["Postal Code", "shipping_postal_code"],
                  ["Country", "shipping_country"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {label}
                    </label>
                    <input
                      className={inputCls}
                      value={addressForm[key]}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {orderDetails.shipping_apartment &&
                  `${orderDetails.shipping_apartment}, `}
                {orderDetails.shipping_address}
                <br />
                {orderDetails.shipping_city},{" "}
                {orderDetails.shipping_postal_code}
                <br />
                {orderDetails.shipping_country}
              </p>
            )}
          </SectionCard>

          {/* Order Items */}
          <div className="bg-white dark:bg-customGray-800 rounded-xl border border-gray-200 dark:border-customGray-600 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-customGray-600">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Order Items ({orderDetails.order_items?.length || 0})
              </h3>
              {!editItems ? (
                <button
                  onClick={() => setEditItems(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      save("items", {
                        order_items: changedQtys,
                        remove_item_ids: removeIds,
                        add_items: addQueue,
                      })
                    }
                    disabled={saving}
                    className={btnPrimary}
                  >
                    {saving ? <Spinner /> : <CheckIcon />} Save
                  </button>
                  <button
                    onClick={() => cancelSection("items")}
                    disabled={saving}
                    className={btnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-gray-100 dark:divide-customGray-600">
              {orderDetails.order_items?.map((item) => {
                const f = itemsForm.find((x) => x.id === item.id);
                const isRemoved = f?._remove;
                const qty = f?.quantity ?? item.quantity;
                const unitPrice = parseFloat(item.price) / item.quantity;
                // Variant attribute tags (e.g. Color: Red / Size: M)
                const attrTags =
                  item.product_variant?.attributes?.map(
                    (a) =>
                      `${a.name?.en ?? a.name}: ${a.pva?.value?.en ?? a.pva?.value}`,
                  ) ?? [];

                return (
                  <div
                    key={item.id}
                    className={`p-4 transition-colors ${isRemoved ? "opacity-40 bg-red-50 dark:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-customGray-750"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.product_title}
                          </p>
                          {/* SKU badge */}
                          {item.sku && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-customGray-700 text-gray-500 dark:text-gray-400 font-mono">
                              {item.sku}
                            </span>
                          )}
                        </div>
                        {/* Variant attribute tags */}
                        {attrTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {attrTags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                          {editItems && !isRemoved ? (
                            <div className="flex items-center border border-gray-300 dark:border-customGray-500 rounded overflow-hidden">
                              <button
                                onClick={() =>
                                  setItemsForm((p) =>
                                    p.map((x) =>
                                      x.id === item.id
                                        ? {
                                            ...x,
                                            quantity: Math.max(
                                              1,
                                              x.quantity - 1,
                                            ),
                                          }
                                        : x,
                                    ),
                                  )
                                }
                                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-customGray-600 font-bold text-base leading-none"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={qty}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value);
                                  if (v >= 1)
                                    setItemsForm((p) =>
                                      p.map((x) =>
                                        x.id === item.id
                                          ? { ...x, quantity: v }
                                          : x,
                                      ),
                                    );
                                }}
                                className="w-12 text-center text-sm py-1 bg-white dark:bg-customGray-700 border-x border-gray-300 dark:border-customGray-500 focus:outline-none"
                              />
                              <button
                                onClick={() =>
                                  setItemsForm((p) =>
                                    p.map((x) =>
                                      x.id === item.id
                                        ? { ...x, quantity: x.quantity + 1 }
                                        : x,
                                    ),
                                  )
                                }
                                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-customGray-600 font-bold text-base leading-none"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span>
                              Qty: <strong>{item.quantity}</strong>
                            </span>
                          )}
                          <span className="text-gray-400">
                            Rs. {unitPrice.toFixed(2)} each
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Rs.{" "}
                          {(
                            unitPrice *
                            (editItems && !isRemoved ? qty : item.quantity)
                          ).toFixed(2)}
                        </p>
                        {editItems && (
                          <button
                            onClick={() =>
                              setItemsForm((p) =>
                                p.map((x) =>
                                  x.id === item.id
                                    ? { ...x, _remove: !x._remove }
                                    : x,
                                ),
                              )
                            }
                            title={isRemoved ? "Undo remove" : "Remove item"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isRemoved
                                ? "bg-gray-200 dark:bg-customGray-600 text-gray-500 hover:bg-gray-300"
                                : "bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                            }`}
                          >
                            {isRemoved ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            ) : (
                              <TrashIcon />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Queued new items */}
              {editItems &&
                addQueue.map((a, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="p-4 bg-green-50 dark:bg-green-900/10 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {a.product_title}
                        </p>
                        {a.sku && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-mono">
                            {a.sku}
                          </span>
                        )}
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          new
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {a.quantity} · Rs. {a.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Rs. {(a.price * a.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() =>
                          setAddQueue((p) => p.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Add product panel — only visible while editing */}
            {editItems && (
              <div className="px-4 pb-4">
                <ProductAddPanel
                  onAdd={(item) => setAddQueue((p) => [...p, item])}
                />
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <SectionCard>
            <SectionHeader
              title="Payment Summary"
              isEditing={editPayment}
              onEdit={() => setEditPayment(true)}
              onSave={() =>
                save("payment", { shipping: parseFloat(shippingFee) })
              }
              onCancel={() => cancelSection("payment")}
              saving={saving}
            />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  Rs.{" "}
                  {(editItems
                    ? liveSubtotal
                    : parseFloat(orderDetails.order_amount || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">Shipping Fee</span>
                {editPayment ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      className="w-28 text-sm px-2 py-1 rounded border border-gray-300 dark:border-customGray-500 bg-white dark:bg-customGray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                ) : (
                  <span className="font-medium">
                    Rs. {parseFloat(orderDetails.shipping || 0).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-customGray-600 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  Rs.{" "}
                  {(editPayment
                    ? parseFloat(orderDetails.order_amount || 0) +
                      parseFloat(shippingFee || 0)
                    : parseFloat(orderDetails.total || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-100 dark:border-customGray-600 pt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">Payment Method</span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-customGray-700 text-gray-700 dark:text-gray-300 uppercase">
                  {orderDetails.payment_method === "cod"
                    ? "Cash on Delivery"
                    : orderDetails.payment_method}
                </span>
              </div>
              {orderDetails?.payment_method === "ibft" &&
                orderDetails?.payment_receipt_url && (
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Payment Receipt
                    </p>
                    <a
                      href={
                        import.meta.env.VITE_APP_CLOUDINARY_URL +
                        orderDetails.payment_receipt_url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={
                          import.meta.env.VITE_APP_CLOUDINARY_URL +
                          orderDetails.payment_receipt_url
                        }
                        alt="Receipt"
                        className="max-h-64 rounded border cursor-pointer hover:opacity-80 transition"
                      />
                    </a>
                  </div>
                )}
            </div>
          </SectionCard>
        </div>
      </Scrollbars>
    </>
  );
};

export default OrderDetailsDrawer;
