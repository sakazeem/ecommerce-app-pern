import ImageSelectorField from "@/components/form/fields/ImageSelectorField";
import InputAreaField from "@/components/form/fields/InputAreaField";
import InputMultipleSelectField from "@/components/form/fields/InputMultipleSelectField";
import VideoSelector from "@/components/image-uploader/VideoSelector";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CategoryServices from "@/services/CategoryServices";
import ProductServices from "@/services/ProductServices";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Trash2,
  Image,
  LayoutGrid,
  Boxes,
  Sliders,
  Tag,
  Link,
  Play,
  Grid3x3,
  Hash,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  X,
  Package,
} from "lucide-react";

const SectionForm = ({
  section,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
}) => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useForm();
  const [categories, setCategories] = useState([]);
  const [videoError, setVideoError] = useState("");
  const { showingTranslateValue, showSelectedLanguageTranslation } =
    useUtilsFunction();

  // ✅ Product search state for "Selected Products" field (mixed sections)
  const [productSearch, setProductSearch] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(
    section.config?.selected_product_ids
      ? section.config.selected_product_ids.map((id) => {
          // Try to use pre-resolved product data from CMS section config
          const resolved = section.config?.selected_products?.find?.((p) => p.id === id);
          return resolved
            ? { id: resolved.id, name: resolved.product_translations?.[0]?.title || resolved.title || `Product #${resolved.id}` }
            : { id, name: `Product #${id}` };
        })
      : []
  );
  const productSearchTimeout = useRef(null);

  const extractImageId = (img) =>
    typeof img === "object" && img !== null ? img.imageId : img;

  const [selectedImage, setSelectedImage] = useState(
    section.type === "banner"
      ? section.config?.image || null
      : section.type === "slider"
        ? (section.config?.images || []).map(extractImageId)
        : null,
  );

  const [selectedImageUrl, setSelectedImageUrl] = useState(
    section.type === "slider"
      ? section.config?.imagesUrl?.map((v) =>
          v.url ? import.meta.env.VITE_APP_CLOUDINARY_URL + v.url : null,
        ) || []
      : section.type === "banner"
        ? section.config?.imageUrl?.url
          ? import.meta.env.VITE_APP_CLOUDINARY_URL +
            section.config?.imageUrl?.url
          : null
        : null,
  );

  const [slideCategories, setSlideCategories] = useState(() => {
    if (section.type !== "slider") return {};
    const map = {};
    (section.config?.images || []).forEach((img) => {
      if (typeof img === "object" && img !== null && img.imageId)
        map[img.imageId] = img.categoryId || "";
    });
    return map;
  });

  const [selectedVideo, setSelectedVideo] = useState(
    section.type === "video_slider"
      ? (section.config?.slides || []).map((s) => s.videoId).filter(Boolean)
      : [],
  );

  const [selectedVideoUrl, setSelectedVideoUrl] = useState(
    section.type === "video_slider"
      ? (section.config?.slidesResolved || [])
          .map((s) =>
            s.videoUrl
              ? import.meta.env.VITE_APP_CLOUDINARY_URL + s.videoUrl
              : null,
          )
          .filter(Boolean)
      : [],
  );

  useEffect(() => {
    CategoryServices.getAllCategoriesForCmsOptions().then((data) =>
      setCategories(data?.records || []),
    );
  }, []);

  // ✅ Debounced product search — fires on every keystroke with 350ms delay
  const handleProductSearchChange = (e) => {
    const value = e.target.value;
    setProductSearch(value);
    clearTimeout(productSearchTimeout.current);
    if (!value.trim()) {
      setProductSearchResults([]);
      return;
    }
    setProductSearchLoading(true);
    productSearchTimeout.current = setTimeout(async () => {
      try {
        const data = await ProductServices.getProductSuggestions({ search: value.trim(), limit: 10 });
        setProductSearchResults(data?.records || []);
      } catch {
        setProductSearchResults([]);
      } finally {
        setProductSearchLoading(false);
      }
    }, 350);
  };

  // ✅ Add a product to the selected list (deduplicated)
  const handleAddProduct = (product) => {
    const title =
      product.product_translations?.[0]?.title ||
      product.translations?.[0]?.title ||
      product.title ||
      `Product #${product.id}`;
    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      const next = [...prev, { id: product.id, name: title }];
      onUpdate({
        ...section,
        config: {
          ...section.config,
          selected_product_ids: next.map((p) => p.id),
        },
      });
      return next;
    });
    setProductSearch("");
    setProductSearchResults([]);
  };

  // ✅ Remove a product from the selected list
  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      onUpdate({
        ...section,
        config: {
          ...section.config,
          selected_product_ids: next.map((p) => p.id),
        },
      });
      return next;
    });
  };

  useEffect(() => {
    if (section.type === "slider") {
      const images = (selectedImage || []).map((imgId) => ({
        imageId: imgId,
        categoryId: slideCategories[imgId] || "",
      }));
      onUpdate({ ...section, config: { ...section.config, images } });
    }
    if (section.type === "banner") {
      onUpdate({
        ...section,
        config: { ...section.config, image: selectedImage || null },
      });
    }
  }, [selectedImage, slideCategories]);

  useEffect(() => {
    if (section.type === "video_slider") {
      setVideoError(
        (selectedVideo || []).length < 3 ? "Minimum 3 videos are required" : "",
      );
      onUpdate({
        ...section,
        config: {
          ...section.config,
          slides: (selectedVideo || []).map((vidId) => ({ videoId: vidId })),
        },
      });
    }
  }, [selectedVideo]);

  const categoriesOptions = useMemo(() => {
    return categories?.map((cat) => ({
      id: cat.id,
      name: showSelectedLanguageTranslation(cat?.translations, "title"),
    }));
  }, [categories]);

  const sectionConfig = {
    slider: {
      icon: <Sliders size={18} />,
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      focusColor: "focus:border-purple-500",
    },
    video_slider: {
      icon: <Play size={18} />,
      gradient: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      borderColor: "border-violet-200",
      textColor: "text-violet-700",
      focusColor: "focus:border-violet-500",
    },
    banner: {
      icon: <Image size={18} />,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      focusColor: "focus:border-blue-500",
    },
    categories: {
      icon: <LayoutGrid size={18} />,
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      focusColor: "focus:border-green-500",
    },
    products: {
      icon: <Boxes size={18} />,
      gradient: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      focusColor: "focus:border-orange-500",
    },
    tab: {
      icon: <Tag size={18} />,
      gradient: "from-pink-500 to-pink-600",
      bgLight: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      focusColor: "focus:border-pink-500",
    },
  }[section.type];

  const isHidden = section.status === false;

  return (
    <div className="space-y-6">
      {/* ── Action bar: order controls + visibility + delete ── */}
      <div className="flex items-center justify-end gap-2">
        {/* Move up */}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          title="Move up"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp size={16} />
        </button>

        {/* Move down */}
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Move down"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Hide / Show */}
        <button
          type="button"
          onClick={onToggleVisibility}
          title={isHidden ? "Show section" : "Hide section"}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            isHidden
              ? "text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
              : "text-gray-500 bg-white border-gray-200 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200"
          }`}
        >
          {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
          {/* {isHidden ? "Show" : "Hide"} */}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(section.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
        >
          <Trash2 size={15} />
          {/* Delete */}
        </button>
      </div>

      {/* Section title */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-6 space-y-5">
          <InputAreaField
            label={"Section Title"}
            register={register}
            inputLabel={`section_title_${section.id}`}
            inputName={`section_title_${section.id}`}
            inputType="text"
            inputPlaceholder="e.g., Featured Products, Best Sellers..."
            errorName={errors[`section_title_${section.id}`]}
            defaultValue={showingTranslateValue(section?.title) || ""}
            isVertical
            onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          />
        </div>
      </div>

      {/* Configuration Section */}
      <div
        className={`${sectionConfig.bgLight} border-2 ${sectionConfig.borderColor} rounded-xl p-6 space-y-5`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`p-2 bg-gradient-to-br ${sectionConfig.gradient} text-white rounded-lg`}
          >
            {sectionConfig.icon}
          </div>
          <div>
            <h3
              className={`text-sm font-bold ${sectionConfig.textColor} uppercase tracking-wide`}
            >
              {section.type?.replace("_", " ")} Configuration
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure your {section.type?.replace("_", " ")} section settings
            </p>
          </div>
        </div>

        {/* Image Slider */}
        {section.type === "slider" && (
          <div className="space-y-5">
            <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors group">
              <input
                type="checkbox"
                checked={section.config?.autoplay || false}
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: { ...section.config, autoplay: e.target.checked },
                  })
                }
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2 flex-1">
                <Play size={18} className="text-purple-600" />
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">
                    Enable Autoplay
                  </span>
                  <span className="text-xs text-gray-500">
                    Automatically transition between slides
                  </span>
                </div>
              </div>
            </label>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <ImageSelectorField
                label="Slider Images"
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                selectedImageUrl={selectedImageUrl}
                setSelectedImageUrl={setSelectedImageUrl}
                isMultipleSelect
                isVertical
                imageDimensions={`w-96`}
              />
              {videoError && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  {videoError}
                </p>
              )}
              {(selectedImage || []).length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Link each slide to a category
                  </p>
                  {(selectedImage || []).map((imgId, idx) => (
                    <div
                      key={imgId}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-xs text-gray-500 font-medium min-w-[60px]">
                        Slide {idx + 1}
                      </span>
                      <select
                        value={slideCategories[imgId] || ""}
                        onChange={(e) =>
                          setSlideCategories((prev) => ({
                            ...prev,
                            [imgId]: e.target.value,
                          }))
                        }
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="">No category (no redirect)</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {showSelectedLanguageTranslation(
                              cat?.translations,
                              "title",
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Slider */}
        {section.type === "video_slider" && (
          <div className="space-y-5">
            <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-violet-300 transition-colors group">
              <input
                type="checkbox"
                checked={section.config?.autoplay || false}
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: { ...section.config, autoplay: e.target.checked },
                  })
                }
                className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex items-center gap-2 flex-1">
                <Play size={18} className="text-violet-600" />
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">
                    Enable Autoplay
                  </span>
                  <span className="text-xs text-gray-500">
                    Automatically transition between slides
                  </span>
                </div>
              </div>
            </label>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <VideoSelector
                selectedVideo={selectedVideo}
                setSelectedVideo={setSelectedVideo}
                selectedVideoUrl={selectedVideoUrl}
                setSelectedVideoUrl={setSelectedVideoUrl}
                isMultipleSelect
                imageDimensions="w-48 h-28"
              />
            </div>
          </div>
        )}

        {/* Banner */}
        {section.type === "banner" && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <ImageSelectorField
                label="Banner Image"
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                selectedImageUrl={selectedImageUrl}
                setSelectedImageUrl={setSelectedImageUrl}
                isVertical
                imageDimensions={`w-full`}
              />
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Link size={16} className="text-blue-600" /> Banner Link URL
              </label>
              <InputAreaField
                register={register}
                inputLabel={`banner_link_${section.id}`}
                inputName={`banner_link_${section.id}`}
                inputType="text"
                inputPlaceholder="https://example.com/promotions"
                errorName={errors[`banner_link_${section.id}`]}
                isVertical
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: { ...section.config, link: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Categories */}
        {section.type === "categories" && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <InputMultipleSelectField
                label="Select Categories"
                inputName={`categories_${section.id}`}
                options={categoriesOptions}
                setValue={setValue}
                defaultSelected={
                  categoriesOptions.filter((cat) =>
                    section.config?.category_ids?.includes(cat.id),
                  ) || []
                }
                isVertical
                isHandleChange={false}
                onChange={(selected) =>
                  onUpdate({
                    ...section,
                    config: {
                      ...section.config,
                      category_ids: selected.map((i) => i.id),
                    },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <LayoutGrid size={16} className="text-green-600" /> Layout
                  Style
                </label>
                <Controller
                  name={`categories_layout_${section.id}`}
                  control={control}
                  defaultValue={section.config?.layout || "grid"}
                  render={() => (
                    <select
                      className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white ${sectionConfig.focusColor} focus:outline-none transition-colors`}
                      onChange={(e) =>
                        onUpdate({
                          ...section,
                          config: { ...section.config, layout: e.target.value },
                        })
                      }
                    >
                      <option value="grid">📱 Grid Layout</option>
                      <option value="slider">🎠 Slider Layout</option>
                    </select>
                  )}
                />
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Image size={16} className="text-green-600" /> Design Style
                </label>
                <Controller
                  name={`categories_design_${section.id}`}
                  control={control}
                  defaultValue={section.config?.design || "circle"}
                  render={() => (
                    <select
                      className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white ${sectionConfig.focusColor} focus:outline-none transition-colors`}
                      onChange={(e) =>
                        onUpdate({
                          ...section,
                          config: { ...section.config, design: e.target.value },
                        })
                      }
                    >
                      <option value="circle">⭕ Circle</option>
                      <option value="square">⬜ Square</option>
                      <option value="fullImage">🖼️ Full Image</option>
                    </select>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-orange-600"></div>
                  Background Color{" "}
                  {!section.config?.color && (
                    <span className="text-xs text-gray-400">
                      (None selected)
                    </span>
                  )}
                </label>
                <div className="flex gap-2 mb-3">
                  {["#5DABEA", "#E95CA7", "#EDA62A"].map((color, i) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        onUpdate({
                          ...section,
                          config: { ...section.config, color },
                        })
                      }
                      className="group relative flex-1 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all overflow-hidden"
                      style={{ backgroundColor: color }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                        {["Primary", "Secondary", "Tertiary"][i]}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <input
                      type="color"
                      value={section.config?.color || "#000000"}
                      onChange={(e) =>
                        onUpdate({
                          ...section,
                          config: { ...section.config, color: e.target.value },
                        })
                      }
                      className="h-10 w-20 rounded-lg border-2 border-gray-200 cursor-pointer"
                    />
                    {!section.config?.color && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white bg-opacity-80 rounded-lg">
                        <span className="text-[10px] text-gray-400 font-medium">
                          No Color
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={section.config?.color || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...section,
                        config: { ...section.config, color: e.target.value },
                      })
                    }
                    placeholder="No color selected"
                    className={`flex-1 border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white ${sectionConfig.focusColor} focus:outline-none transition-colors font-mono text-sm`}
                  />
                  {section.config?.color && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate({
                          ...section,
                          config: { ...section.config, color: null },
                        })
                      }
                      className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Grid3x3 size={16} className="text-green-600" /> Categories
                  per Row
                </label>
                <InputAreaField
                  register={register}
                  inputLabel={`categories_per_row_${section.id}`}
                  inputName={`categories_per_row_${section.id}`}
                  inputType="number"
                  defaultValue={section.config?.categories_per_row}
                  inputPlaceholder="e.g., 4"
                  isVertical
                  onChange={(e) =>
                    onUpdate({
                      ...section,
                      config: {
                        ...section.config,
                        categories_per_row: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {section.type === "products" && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Boxes size={16} className="text-orange-600" /> Product Category
              </label>
              <select
                className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white ${sectionConfig.focusColor} focus:outline-none transition-colors`}
                value={section.config?.category_id || ""}
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: { ...section.config, category_id: e.target.value },
                  })
                }
              >
                <option value="">📂 Select Category</option>
                <option value="best-selling">🏆 Best Selling</option>
                <option value="mixed">🔀 Mixed Products</option>
                <option value="sale">💰 Sale</option>
                <option value="trending">🔥 Trending</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {showSelectedLanguageTranslation(
                      cat?.translations,
                      "title",
                    )}
                  </option>
                ))}
               </select>
             </div>

             {section.config?.category_id === "mixed" && (
               <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                   <Boxes size={16} className="text-orange-600" /> Product Pool
                   Categories
                 </label>
                 <p className="text-xs text-gray-500 mb-3">
                   Optional: Select specific categories to pool products from. Leave empty to use all categories.
                 </p>
                 <InputMultipleSelectField
                   label=""
                   inputName={`pool_categories_${section.id}`}
                   options={categoriesOptions}
                   setValue={setValue}
                   defaultSelected={
                     categoriesOptions.filter((cat) =>
                       section.config?.pool_category_ids?.includes(cat.id),
                     ) || []
                   }
                   isVertical
                   isHandleChange={false}
                   onChange={(selected) =>
                     onUpdate({
                       ...section,
                       config: {
                         ...section.config,
                         pool_category_ids: selected.map((i) => i.id),
                       },
                     })
                   }
                 />
               </div>
             )}

             {/* ✅ Selected Products — overrides category pool when present */}
             {section.config?.category_id === "mixed" && (
               <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                   <Package size={16} className="text-orange-600" /> Selected Products
                   <span className="ml-1 text-xs font-normal text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                     Overrides categories
                   </span>
                 </label>
                 <p className="text-xs text-gray-500 mb-3">
                   Optional: Manually pin specific products. When set, category pool is ignored. Search by product name or ID.
                 </p>

                 {/* Search input */}
                 <div className="relative mb-3">
                   <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus-within:border-orange-400 transition-colors">
                     <Search size={15} className="text-gray-400 shrink-0" />
                     <input
                       type="text"
                       value={productSearch}
                       onChange={handleProductSearchChange}
                       placeholder="Search by product name or ID…"
                       className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                     />
                     {productSearch && (
                       <button
                         type="button"
                         onClick={() => { setProductSearch(""); setProductSearchResults([]); }}
                         className="shrink-0 text-gray-400 hover:text-gray-600"
                       >
                         <X size={14} />
                       </button>
                     )}
                   </div>

                   {/* Search results dropdown */}
                   {(productSearchResults.length > 0 || productSearchLoading) && (
                     <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                       {productSearchLoading && (
                         <div className="px-4 py-3 text-xs text-gray-500">Searching…</div>
                       )}
                       {productSearchResults.map((product) => {
                         const title =
                           product.product_translations?.[0]?.title ||
                           product.translations?.[0]?.title ||
                           product.title ||
                           `Product #${product.id}`;
                         const alreadyAdded = selectedProducts.find((p) => p.id === product.id);
                         return (
                           <button
                             key={product.id}
                             type="button"
                             onClick={() => !alreadyAdded && handleAddProduct(product)}
                             className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0 ${alreadyAdded ? "opacity-40 cursor-default" : "cursor-pointer"}`}
                           >
                             {product.thumbnailImage?.url && (
                               <img
                                 src={`${import.meta.env.VITE_APP_CLOUDINARY_URL}${product.thumbnailImage.url}`}
                                 alt={title}
                                 className="w-9 h-9 object-cover rounded shrink-0 border border-gray-100"
                               />
                             )}
                             <div className="min-w-0">
                               <p className="font-medium text-gray-800 truncate">{title}</p>
                               <p className="text-xs text-gray-400">ID: {product.id} · SKU: {product.sku || "—"}</p>
                             </div>
                             {alreadyAdded && (
                               <span className="ml-auto shrink-0 text-xs text-green-600 font-semibold">Added</span>
                             )}
                           </button>
                         );
                       })}
                     </div>
                   )}
                 </div>

                 {/* Selected products list */}
                 {selectedProducts.length > 0 ? (
                   <div className="space-y-2">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                       {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                     </p>
                     {selectedProducts.map((product, idx) => (
                       <div
                         key={product.id}
                         className="flex items-center gap-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg"
                       >
                         <span className="text-xs text-orange-400 font-mono w-5 shrink-0">#{idx + 1}</span>
                         <div className="min-w-0 flex-1">
                           <p className="text-sm text-gray-800 truncate font-medium">{product.name}</p>
                           <p className="text-xs text-gray-400">ID: {product.id}</p>
                         </div>
                         <button
                           type="button"
                           onClick={() => handleRemoveProduct(product.id)}
                           className="shrink-0 text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                           title="Remove product"
                         >
                           <X size={14} />
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                     <Package size={28} className="mx-auto mb-2 opacity-40" />
                     <p className="text-xs">No products selected. Category pool will be used.</p>
                   </div>
                 )}
               </div>
             )}

             <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                 <LayoutGrid size={16} className="text-orange-600" /> Layout
                 Style
               </label>
              <select
                className={`w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white ${sectionConfig.focusColor} focus:outline-none transition-colors`}
                value={section.config?.layout || "grid"}
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: { ...section.config, layout: e.target.value },
                  })
                }
              >
                <option value="grid">📱 Grid Layout</option>
                <option value="slider">🎠 Slider Layout</option>
              </select>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Hash size={16} className="text-orange-600" /> Number of
                Products to Display
              </label>
              <InputAreaField
                register={register}
                inputLabel={`products_limit_${section.id}`}
                inputName={`products_limit_${section.id}`}
                inputType="number"
                defaultValue={section.config?.limit}
                inputPlaceholder="e.g., 10"
                isVertical
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: {
                      ...section.config,
                      limit: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        {section.type === "tab" && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Tag size={16} className="text-pink-600" /> Number of Tabs
              </label>
              <InputAreaField
                register={register}
                inputLabel={`tab_number_${section.id}`}
                inputName={`tab_number_${section.id}`}
                inputType="number"
                defaultValue={section.config?.number_of_tabs}
                inputPlaceholder="e.g., 3"
                isVertical
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: {
                      ...section.config,
                      number_of_tabs: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <InputMultipleSelectField
                label="Tab Categories"
                inputName={`tab_categories_${section.id}`}
                options={categoriesOptions}
                setValue={setValue}
                defaultSelected={
                  categoriesOptions.filter((cat) =>
                    section.config?.tab_categories?.includes(cat.id),
                  ) || []
                }
                isVertical
                isHandleChange={false}
                onChange={(selected) =>
                  onUpdate({
                    ...section,
                    config: {
                      ...section.config,
                      tab_categories: selected.map((i) => i.id),
                    },
                  })
                }
              />
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Hash size={16} className="text-pink-600" /> Products per Tab
              </label>
              <InputAreaField
                register={register}
                inputLabel={`products_per_tab_${section.id}`}
                inputName={`products_per_tab_${section.id}`}
                inputType="number"
                defaultValue={section.config?.products_per_tab}
                inputPlaceholder="e.g., 10"
                isVertical
                onChange={(e) =>
                  onUpdate({
                    ...section,
                    config: {
                      ...section.config,
                      products_per_tab: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionForm;