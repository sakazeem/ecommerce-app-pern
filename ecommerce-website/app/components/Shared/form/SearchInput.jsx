"use client";

import { ENV_VARIABLES } from "@/app/constants/env_variables";
import ProductServices from "@/app/services/ProductServices";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BaseImage from "../../BaseComponents/BaseImage";
import BasePrice from "../../BaseComponents/BasePrice";
import { MoveRight } from "lucide-react";
import { trackEvent } from "@/app/utils/trackEvent";
import { useAuthUIStore } from "@/app/store/useAuthUIStore";

const SearchInput = ({
  name = "search",
  placeholder = "Search for products",
  defaultValue,
  readOnly = false,
  className = "",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { closeSearch } = useAuthUIStore();

  const initialValue = defaultValue || searchParams.get("search") || "";

  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputActive, setInputActive] = useState(false);

  const debounceRef = useRef(null);

  // 🔹 Fetch suggestions (debounced)
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await ProductServices.getProductSuggestions({
          search: query,
        });
        setSuggestions(res?.records || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Suggestion error", err?.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // 🔹 Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query) return;

    if (pathname !== "/products") {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", query);
      router.replace(`${pathname}?${params.toString()}`);
    }
    trackEvent("Search", {
      search_string: query.trim(),
    });

    setShowDropdown(false);
    closeSearch();
  };

  // 🔹 Click suggestion
  const handleSelect = (value) => {
    setQuery(value);
    router.push(`/products?search=${encodeURIComponent(value)}`);
    setShowDropdown(false);
    closeSearch();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <button
        type="submit"
        className="absolute z-10 inset-y-0 right-0 px-4 flex items-center bg-primary text-light rounded-r-full"
      >
        <MagnifyingGlassIcon className="h-5 w-auto" />
      </button>

      {/* Input */}
      <input
        type="text"
        value={query}
        readOnly={readOnly}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          query && setShowDropdown(true);
          if (!inputActive) {
            setInputActive(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder}
        className={`py-2 pl-3 pr-10 w-full border p4 rounded-full min-h-12
					focus:outline-none focus:border-primary
					${readOnly ? "bg-gray-100" : "bg-white border-gray-200"}
				`}
      />

      {/* Suggestions */}
      {inputActive && showDropdown && (
        <div className="absolute top-full mt-2 pt-2 w-full bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
          {/* Suggestions */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 p4 text-gray-500">Searching...</div>
            )}

            {!loading &&
              suggestions.map((item) => {
                const discountedPrice = (
                  (item.base_price || item.price) *
                  (1 - (item.base_discount_percentage || 0) / 100)
                ).toFixed(2);
                return (
                  <div
                    key={item.id}
                    onMouseDown={() => {
                      closeSearch();
                      router.push(`/product/${item.slug}`);
                    }}
                    className="flex gap-4 px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition"
                  >
                    {/* Image */}
                    <BaseImage
                      src={
                        item.thumbnail
                          ? ENV_VARIABLES.IMAGE_BASE_URL + item.thumbnail
                          : null
                      }
                      alt={item.title}
                      width={200}
                      height={200}
                      className="w-14 h-14 rounded-md object-cover border"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <p className="p5 text-gray-700 leading-snug line-clamp-1 capitalize">
                        {item.title?.toLowerCase()}
                      </p>

                      <div className="flex items-center gap-2 mt-1 p5">
                        {item.base_discount_percentage > 0 && (
                          <BasePrice
                            className="text-muted line-through"
                            price={item.base_price}
                          />
                        )}
                        <BasePrice
                          className="text-secondary"
                          price={discountedPrice}
                        />
                        {/* {item.old_price && (
												<span className="text-xs text-gray-400 line-through">
													Rs.{item.old_price}
												</span>
											)}
											<span className="p4 font-semibold text-primary">
												Rs.{item.price}
											</span> */}
                      </div>
                    </div>
                  </div>
                );
              })}

            {!loading && suggestions.length === 0 && (
              <div className="p-4 p4 text-gray-500">No products found</div>
            )}
          </div>

          {/* Footer CTA */}
          <div
            onMouseDown={() => {
              closeSearch();
              router.push(`/products?search=${encodeURIComponent(query)}`);
            }}
            className="px-4 py-3 border-t p4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
          >
            <span>
              Search for <strong>“{query}”</strong>
            </span>
            <span>
              <MoveRight />
            </span>
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchInput;
