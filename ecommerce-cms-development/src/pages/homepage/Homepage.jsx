import React, { useEffect, useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
	GripVertical,
	Plus,
	Save,
	LayoutDashboard,
	Image,
	Grid3x3,
	Package,
	Layers,
} from "lucide-react";
import SectionForm from "./SectionForm";
import HomepageSectionsServices from "@/services/HomepageSectionsServices";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const ITEM_TYPE = "SECTION";

/* ---------------- Draggable Section ---------------- */
const DraggableSection = ({
	section,
	index,
	moveSection,
	onUpdate,
	onDelete,
}) => {
	const ref = React.useRef(null);

	const [, drop] = useDrop({
		accept: ITEM_TYPE,
		hover(item) {
			if (item.index === index) return;
			moveSection(item.index, index);
			item.index = index;
		},
	});

	const [{ isDragging }, drag] = useDrag({
		type: ITEM_TYPE,
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	drag(drop(ref));

	const getSectionIcon = () => {
		switch (section.type) {
			case "slider":
				return <Image size={16} className="text-purple-600" />;
			case "banner":
				return <Image size={16} className="text-blue-600" />;
			case "categories":
				return <Grid3x3 size={16} className="text-green-600" />;
			case "products":
				return <Package size={16} className="text-orange-600" />;
			case "tab":
				return <Layers size={16} className="text-pink-600" />;
			default:
				return <Layers size={16} className="text-gray-600" />;
		}
	};

	const getSectionBadgeColor = () => {
		switch (section.type) {
			case "slider":
				return "bg-purple-100 text-purple-700";
			case "banner":
				return "bg-blue-100 text-blue-700";
			case "categories":
				return "bg-green-100 text-green-700";
			case "products":
				return "bg-orange-100 text-orange-700";
			case "tab":
				return "bg-pink-100 text-pink-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<div
			ref={ref}
			className={`group relative rounded-xl border-2 bg-white transition-all duration-200 mb-4 ${
				isDragging
					? "opacity-50 shadow-2xl border-blue-400 scale-105"
					: "border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300"
			}`}>
			{/* Drag Handle */}
			<div className="absolute left-0 top-0 bottom-0 flex items-center px-3 cursor-grab active:cursor-grabbing">
				<div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-blue-500 transition-colors">
					<GripVertical size={20} />
				</div>
			</div>

			{/* Section Badge */}
			<div className="flex gap-2 items-center absolute left-4 top-2">
				<div className=" w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
					{index + 1}
				</div>
				<div className="">
					<div
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-medium ${getSectionBadgeColor()}`}>
						{getSectionIcon()}
						<span className="uppercase">{section.type?.replace("_"," ")}</span>
					</div>
				</div>

				{/* Position Indicator */}
			</div>

			<div className="pl-14 pr-4 py-6">
				<SectionForm
					section={section}
					onUpdate={onUpdate}
					onDelete={onDelete}
				/>
			</div>
		</div>
	);
};

/* ---------------- Homepage Builder ---------------- */
const Homepage = () => {
	const [sections, setSections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshKey, setRefreshKey] = useState(false);
	const [initialOrder, setInitialOrder] = useState([]);
	const [orderChanged, setOrderChanged] = useState(false);

	useEffect(() => {
		setLoading(true);
		HomepageSectionsServices.getHomepageSections()
			.then((res) => {
				setSections(res || []);
				setInitialOrder(res?.map((s) => s.id) || []);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [refreshKey]);

	const moveSection = useCallback(
		(fromIndex, toIndex) => {
			setSections((prev) => {
				const updated = [...prev];
				const [moved] = updated.splice(fromIndex, 1);
				updated.splice(toIndex, 0, moved);

				const newOrder = updated.map((s) => s.id);
				setOrderChanged(
					JSON.stringify(newOrder) !== JSON.stringify(initialOrder),
				);

				return updated;
			});
		},
		[initialOrder],
	);

	const handleUpdateOrder = async () => {
		try {
			await HomepageSectionsServices.reorderHomepageSection(
				sections.map((s, i) => ({
					id: s.id,
					position: i + 1,
				})),
			);

			toast.success("Section order updated!");
			setInitialOrder(sections.map((s) => s.id));
			setOrderChanged(false);
		} catch (err) {
			console.error(err);
			toast.error("Failed to update order");
		}
	};

	const handleUpdate = (updatedSection) => {
		setSections((prev) =>
			prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
		);
	};

	const handleDelete = async (id) => {
		if (!`${id}`.includes("_uuid4"))
			await HomepageSectionsServices.deleteHomepageSection(id);
		setSections((prev) => prev.filter((s) => s.id !== id));
	};

	const handleAdd = (type) => {
		let config = {};
		if (type === "slider") config = { images: [], autoplay: false };
		if (type === "banner") config = { image: null, link: "" };
		if (type === "categories") config = { category_ids: [], layout: "grid" };
		if (type === "products") config = { category_id: "", limit: 10 };
		if (type === "tab")
			config = { number_of_tabs: 3, tab_categories: [], products_per_tab: 10 };

		const newSection = { id: uuidv4() + "_uuid4", type, title: null, config };
		setSections((prev) => [...prev, newSection]);
	};

	const handleSave = async () => {
    const invalidVideoSection = sections.find(
      (sec) =>
        sec.type === "video_slider" &&
        (!sec.config?.slides || sec.config.slides.length < 4),
    );

    if (invalidVideoSection) {
      toast.error("Each Video Slider must have at least 4 videos");
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        sections.map((sec) => {
          if (sec.title && typeof sec.title === "string") {
            sec.title = { en: sec.title };
          }

          if (`${sec.id}`.includes("_uuid4")) {
            const { id, ...payload } = sec;
            return HomepageSectionsServices.addHomepageSection(payload);
          }
          return HomepageSectionsServices.updateHomepageSection(sec.id, sec);
        }),
      );

      toast.success("Homepage sections saved!");
      setRefreshKey((prev) => !prev);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

	return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className=" mx-auto px-4/ py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <LayoutDashboard size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Homepage Builder
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Design and manage your homepage sections
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <select
                  onChange={(e) => {
                    if (!e.target.value) return;
                    handleAdd(e.target.value);
                    e.target.value = "";
                  }}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium text-gray-700"
                >
                  <option value="">➕ Add Section</option>
                  <option value="slider">🎠 Slider</option>
                  <option value="video_slider">▶️ Video Slider</option>
                  <option value="banner">🖼️ Banner</option>
                  <option value="categories">📁 Categories</option>
                  <option value="products">📦 Products</option>
                  <option value="tab">📑 Tabs</option>
                </select>

                {orderChanged && (
                  <button
                    onClick={handleUpdateOrder}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <GripVertical size={18} />
                    Update Order
                  </button>
                )}

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save All"}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4 font-medium">
                Loading homepage sections...
              </p>
            </div>
          )}

          {!loading && sections.length === 0 && (
            <div className="text-center py-24 bg-white border-2 border-dashed border-gray-300 rounded-2xl">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="text-blue-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No sections yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start building your homepage by adding your first section
              </p>
              <button
                onClick={() => handleAdd("slider")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus size={20} />
                Add Your First Section
              </button>
            </div>
          )}

          {!loading && sections.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Sections:{" "}
                  <span className="text-blue-600 font-bold">
                    {sections.length}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  💡 Drag sections to reorder
                </p>
              </div>

              {sections.map((section, index) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  index={index}
                  moveSection={moveSection}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
        <div
          className={`group relative rounded-xl border-2 bg-white transition-all duration-200 mb-4 ${"border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300"}`}
        >
          {/* Drag Handle */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 cursor-grab active:cursor-grabbing"></div>

          <div className="pl-14 pr-4 py-6">
            <div className="flex gap-3 flex-wrap">
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  handleAdd(e.target.value);
                  e.target.value = "";
                }}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium text-gray-700"
              >
                <option value="">➕ Add Section</option>
                <option value="slider">🎠 Slider</option>
                <option value="video_slider">▶️ Video Slider</option>
                <option value="banner">🖼️ Banner</option>
                <option value="categories">📁 Categories</option>
                <option value="products">📦 Products</option>
                <option value="tab">📑 Tabs</option>
              </select>

              {orderChanged && (
                <button
                  onClick={handleUpdateOrder}
                  className="flex flex-1 items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <GripVertical size={18} />
                  Update Order
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex flex-1 items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
      </div>
    </DndProvider>
  );
};

export default Homepage;
