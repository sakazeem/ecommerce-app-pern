"use client";
import { COLORMAP } from "@/app/data/colors";
import { useFetchReactQuery } from "@/app/hooks/useFetchReactQuery";
import MetadataService from "@/app/services/MetadataService";
import { Check, CheckIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// --- Filter Configuration ---

// --- Collapsible Section Component ---
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b py-4 p4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h3 className="font-semibold">{title}</h3>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {open && (
        <div className="mt-3 max-md:mt-1.5 space-y-0 max-h-[240px] max-md:max-h-[180px] overflow-y-auto thin-scrollbar">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export default function FilterSidebar({
  selectedFilters,
  setSelectedFilters,
  paramsCategory,
  paramsBrand,
  defaultFilters = {},
  setDefaultFilters = () => {},
  onCategoryResolved = () => {},
}) {
  const { data, isLoading } = useFetchReactQuery(
    () =>
      MetadataService.getFiltersData({
        category: paramsCategory,
        brand: paramsBrand,
      }),
    ["filtersData", paramsCategory, paramsBrand],
    { enabled: true },
  );

  const filterData = useMemo(() => {
    if (!data) {
      return {
        categories: [],
        brands: [],
        sizes: [],
        colors: [],
        price: { range: { min: 0, max: 0 }, options: [] },
      };
    }

    const colorAttr =
      data.attributes.find((a) => a.name === "color")?.values ?? [];
    const sizeAttr =
      data.attributes.find((a) => a.name === "size")?.values ?? [];

    // Map colors to tailwind classes (you can extend more colors if needed)

    const colors = colorAttr.map((name) => ({
      name,
      color: COLORMAP[name.toLowerCase()] || "bg-gray-300",
    }));

    return {
      categories: data.categories ?? [],
      brands: data.brands ?? [],
      sizes: sizeAttr ?? [],
      colors,
      range: { min: 36, max: 173 }, // still hardcoded
      price: {
        options: [
          { label: "Rs.100 - Rs.200", min: 100, max: 200 },
          { label: "Rs.200 - Rs.400", min: 200, max: 400 },
          { label: "Rs.400 - Rs.600", min: 400, max: 600 },
          { label: "Rs.600 - Rs.800", min: 600, max: 800 },
          { label: "Over Rs.1000", min: 1000, max: null },
        ],
        // options: [
        // 	{ label: "Rs.100 - Rs.200", count: 12 },
        // 	{ label: "Rs.200 - Rs.400", count: 24 },
        // 	{ label: "Rs.400 - Rs.600", count: 54 },
        // 	{ label: "Rs.600 - Rs.800", count: 78 },
        // 	{ label: "Over Rs.1000", count: 125 },
        // ],
      },
    };
  }, [data]);

  useEffect(() => {
    if (!data) return;

    const newDefaults = {
      _timestamp: Date.now(),
    };

    if (data?.selectedCategory?.id)
      newDefaults.categories = data.selectedCategory.id;
    if (data?.selectedBrand?.id) newDefaults.brands = data.selectedBrand.id;

    if (data?.selectedCategory) onCategoryResolved(data.selectedCategory);
    setDefaultFilters(newDefaults); // could be {} if nothing is selected
  }, [data, setDefaultFilters]);

  const toggleArrayFilter = (key, value) => {
    setSelectedFilters((prev) => {
      const exists = prev[key]?.includes(value);

      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...(prev[key] || []), value],
      };
    });
  };

  const setSingleFilter = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  return (
    // <aside className="overflow-y-scroll md:max-h-[150vh] hide-scrollbar/ max-md:hidden">
    <aside className="max-md:hidden/">
      <h4 className="h4 font-bold border-b pb-1 max-md:hidden">Filters</h4>
      {isLoading ? (
        <p className="py-4 p4">Loading filters...</p>
      ) : (
        <>
          {/* Categories */}
          <Section title="Categories">
            {filterData.categories?.map(({ id, title, count }, idx) => (
              <label
                key={`category-${id}-${idx}`}
                className="group flex items-center justify-between px-0 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Custom Checkbox */}
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedFilters.categories?.includes(id)}
                      onChange={() => toggleArrayFilter("categories", id)}
                      id={`category-${id}-${idx}`}
                    />
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-[2px] transition-all duration-200 peer-checked:border-secondary peer-checked:bg-secondary  flex items-center justify-center group-hover:border-secondary/60">
                      {/* Checkmark Icon - Only shows when checked */}
                      {selectedFilters.categories?.includes(id) && (
                        <CheckIcon
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>

                  {/* Label Text */}
                  <span className="p4 font-medium text-muted capitalize transition-colors group-hover:text-gray-900  select-none">
                    {title}
                  </span>
                </div>

                {/* Optional Count Badge */}
                {/* <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-colors group-hover:bg-secondary/10 group-hover:text-secondary">
		{count}
	</span> */}
              </label>
            ))}
          </Section>

          {/* Brands */}
          {filterData.brands && filterData.brands.length > 0 && (
            <Section title="Brands">
              {filterData.brands.map(({ id, title, count }, idx) => (
                <label
                  key={`brand-${id}-${idx}`}
                  className="group flex items-center justify-between px-0 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Custom Checkbox */}
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={selectedFilters.brands?.includes(id)}
                        onChange={() => toggleArrayFilter("brands", id)}
                        key={`brand-${id}-${idx}`}
                      />
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-[2px] transition-all duration-200 peer-checked:border-secondary peer-checked:bg-secondary  flex items-center justify-center group-hover:border-secondary/60">
                        {/* Checkmark Icon - Only shows when checked */}
                        {selectedFilters.brands?.includes(id) && (
                          <CheckIcon
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>

                    {/* Label Text */}
                    <span className="p4 font-medium text-muted capitalize transition-colors group-hover:text-gray-900  select-none">
                      {title}
                    </span>
                  </div>
                </label>
              ))}
            </Section>
          )}

          <Section title="Price">
            {filterData.price.options.map(({ label, min, max }, idx) => (
              <label
                key={`price-${idx}`}
                className="group flex items-center justify-between px-0 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Custom Radio Button */}
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name="price"
                      className="peer sr-only"
                      checked={
                        selectedFilters?.price?.min === min &&
                        selectedFilters?.price?.max === max
                      }
                      onChange={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          price: { min, max },
                        }))
                      }
                      id={`price-${idx}`}
                    />
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full transition-all duration-200 peer-checked:border-secondary flex items-center justify-center group-hover:border-secondary/60">
                      {/* Inner Circle - Only shows when checked */}
                      {selectedFilters?.price?.min === min &&
                        selectedFilters?.price?.max === max && (
                          <div className="w-2.5 h-2.5 bg-secondary rounded-full transition-transform duration-200 scale-100"></div>
                        )}
                    </div>
                  </div>

                  {/* Label Text */}
                  <span className="p4 font-medium text-muted  transition-colors group-hover:text-gray-900  select-none">
                    {label}
                  </span>
                </div>
              </label>
            ))}
          </Section>

          {/* Size */}
          <Section title="Size">
            <div className="flex gap-2 flex-wrap py-1">
              {filterData.sizes?.map((size, idx) => (
                <button
                  key={`size-${size}-${idx}`}
                  className={`
				relative px-4 py-2 max-md:px-2.5 max-md:py-1.5 rounded-lg max-md:rounded-sm font-medium p5 max-md:!text-sm uppercase
				transition-all duration-200 
				border-2 
				${
          selectedFilters.size === size
            ? "border-secondary bg-secondary text-white shadow-lg shadow-secondary/30 scale-105"
            : "border-gray-200 bg-white text-gray-700 hover:border-secondary/60 hover:bg-secondary/5 hover:scale-105 hover:shadow-md"
        }
				active:scale-95
				focus:outline-none
			`}
                  onClick={() => setSingleFilter("size", size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>

          {/* Color */}
          <Section title="Color">
            <div className="flex/ flex-wrap/ grid grid-cols-6 gap-1.5 max-md:gap-y-2 mt-1">
              {filterData.colors?.map(({ name, color }, idx) => (
                <div
                  key={`color-${name}-${idx}`}
                  onClick={() => setSingleFilter("color", name)}
                  className="group flex flex-col items-center gap-2 max-md:gap-1 cursor-pointer"
                >
                  {/* Color Circle */}
                  <div
                    className={`
										relative w-6.5 h-6.5 rounded-full 
										transition-all duration-200
										border-2 
										${
                      selectedFilters.color === name
                        ? "border-secondary  scale-110"
                        : "border-gray-300 dark:border-gray-600 group-hover:border-secondary/60 group-hover:scale-110 "
                    }
										${color}
									`}
                  >
                    {/* Checkmark Icon */}
                    {selectedFilters.color === name && (
                      <Check
                        className="absolute inset-0 m-auto text-white drop-shadow-md"
                        size={14}
                        strokeWidth={3}
                      />
                    )}
                  </div>

                  {/* Color Name Label */}
                  <span
                    className={`
			text-xs max-md:text-[10px] text-center font-medium capitalize transition-colors duration-200
			${
        selectedFilters.color === name
          ? "text-secondary"
          : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
      }
		`}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </aside>
  );
}
