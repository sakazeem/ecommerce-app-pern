"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import ProfileServices from "@/app/services/ProfileServices";
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const EMPTY_FORM = {
  id: null,
  title: "",
  address: "",
  apartment: "",
  city: "",
  country: "",
  postal_code: "",
  type: "shipping",
};

export default function Addresses() {
  const { user, fetchUser } = useAuth();
  const addresses = user?.addresses || [];

  // ✅ Detect existing types
  const hasShipping = addresses.some((a) => a.type === "shipping");
  const hasBilling = addresses.some((a) => a.type === "billing");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  // ✅ Add with restriction
  const openAdd = () => {
    if (hasShipping && hasBilling) {
      toast.error("Shipping and Billing addresses already exist");
      return;
    }

    let defaultType = "shipping";
    if (hasShipping) defaultType = "billing";

    setForm({ ...EMPTY_FORM, type: defaultType });
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm({
      id: addr.id,
      title: addr.title || "",
      address: addr.address || "",
      apartment: addr.apartment || "",
      city: addr.city || "",
      country: addr.country || "",
      postal_code: addr.postal_code || "",
      type: addr.type || "shipping",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.address || !form.city || !form.country || !form.postal_code) {
      toast.error("Please fill all required fields");
      return;
    }

    // ✅ Prevent duplicate type
    const isDuplicateType = addresses.some(
      (a) => a.type === form.type && a.id !== form.id,
    );

    if (isDuplicateType) {
      toast.error(`${form.type} address already exists`);
      return;
    }

    setLoading(true);
    try {
      await ProfileServices.addOrUpdateAddress(form);
      toast.success(form.id ? "Address updated" : "Address added");
      setShowForm(false);
      await fetchUser();
    } catch (err) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await ProfileServices.deleteAddress(id);
      toast.success("Address deleted");
      await fetchUser();
    } catch (err) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  const inputClass =
    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">My Addresses</h2>

        {/* ✅ Hide if both exist */}
        {!showForm && !(hasShipping && hasBilling) && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2 rounded-lg text-sm"
          >
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-secondary rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {form.id ? "Edit Address" : "New Address"}
            </h3>
            <button onClick={() => setShowForm(false)}>
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              {/* <div>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Home, Office"
                  className={inputClass}
                />
              </div> */}

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {/* ✅ Disable duplicate types when adding */}
                  <option
                    value="shipping"
                    disabled={hasShipping && form.id === null}
                  >
                    Shipping
                  </option>
                  <option
                    value="billing"
                    disabled={hasBilling && form.id === null}
                  >
                    Billing
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Address *
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Apartment / Unit
              </label>
              <input
                name="apartment"
                value={form.apartment}
                onChange={handleChange}
                placeholder="Apt, suite, unit (optional)"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  City *
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Postal Code *
                </label>
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="Postal code"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Country *
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="bg-secondary text-white px-5 py-2 rounded-lg text-sm disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-5 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm ? (
        <button
          onClick={openAdd}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-400 hover:border-secondary hover:text-secondary transition-colors flex flex-col items-center gap-2"
        >
          <MapPin size={24} />
          <span>No addresses yet. Add one.</span>
        </button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white border rounded-lg p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {addr.title && (
                    <span className="font-semibold text-sm">{addr.title}</span>
                  )}
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full capitalize">
                    {addr.type}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(addr)}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {addr.address}
                {addr.apartment ? `, ${addr.apartment}` : ""}
              </p>

              <p className="text-sm text-gray-600">
                {addr.city}, {addr.postal_code}
              </p>

              <p className="text-sm text-gray-600">{addr.country}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
