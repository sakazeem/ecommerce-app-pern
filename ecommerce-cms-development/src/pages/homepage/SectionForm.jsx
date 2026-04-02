import ImageSelectorField from "@/components/form/fields/ImageSelectorField";
import InputAreaField from "@/components/form/fields/InputAreaField";
import InputMultipleSelectField from "@/components/form/fields/InputMultipleSelectField";
import VideoSelector from "@/components/image-uploader/VideoSelector";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import CategoryServices from "@/services/CategoryServices";
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

const SectionForm = ({ section, onUpdate, onDelete }) => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const { showingTranslateValue, showSelectedLanguageTranslation } =
    useUtilsFunction();

  // ─── Image slider state ───────────────────────────────────────────────────────
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
      if (typeof img === "object" && img !== null && img.imageId) {
        map[img.imageId] = img.categoryId || "";
      }
    });
    return map;
  });

  // ─── Video slider state — mirrors image slider pattern exactly ────────────────
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

  const [slideVideoCategories, setSlideVideoCategories] = useState(() => {
    if (section.type !== "video_slider") return {};
    const map = {};
    (section.config?.slides || []).forEach((s) => {
      if (s.videoId) map[s.videoId] = s.categoryId || "";
    });
    return map;
  });

  useEffect(() => {
    CategoryServices.getAllCategories().then((data) => {
      setCategories(data?.records || []);
    });
  }, []);

  // ─── Sync image slider to parent ─────────────────────────────────────────────
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

  // ─── Sync video slider to parent ─────────────────────────────────────────────
  useEffect(() => {
    if (section.type === "video_slider") {
      const slides = (selectedVideo || []).map((vidId) => ({
        videoId: vidId,
        categoryId: slideVideoCategories[vidId] || "",
      }));
      onUpdate({ ...section, config: { ...section.config, slides } });
    }
  }, [selectedVideo, slideVideoCategories]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        type="button"
        onClick={() => onDelete(section.id)}
        className="flex items-center ml-auto gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
      >
        <Trash2 size={16} />
        Delete
      </button>
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
              {section.type} Configuration
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure your {section.type} section settings
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

        {/* Video Slider — mirrors image slider pattern */}
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

              {(selectedVideo || []).length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Link each slide to a category
                  </p>
                  {(selectedVideo || []).map((vidId, idx) => (
                    <div
                      key={vidId}
                      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-xs text-gray-500 font-medium min-w-[60px]">
                        Slide {idx + 1}
                      </span>
                      <select
                        value={slideVideoCategories[vidId] || ""}
                        onChange={(e) =>
                          setSlideVideoCategories((prev) => ({
                            ...prev,
                            [vidId]: e.target.value,
                          }))
                        }
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:border-violet-500 focus:outline-none transition-colors"
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
                <Link size={16} className="text-blue-600" />
                Banner Link URL
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
                  <LayoutGrid size={16} className="text-green-600" />
                  Layout Style
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
                  <Image size={16} className="text-green-600" />
                  Design Style
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
                  <Grid3x3 size={16} className="text-green-600" />
                  Categories per Row
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
                <Boxes size={16} className="text-orange-600" />
                Product Category
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

            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <LayoutGrid size={16} className="text-orange-600" />
                Layout Style
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
                <Hash size={16} className="text-orange-600" />
                Number of Products to Display
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
                <Tag size={16} className="text-pink-600" />
                Number of Tabs
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
                <Hash size={16} className="text-pink-600" />
                Products per Tab
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
