"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/app/providers/StoreProvider";
import BaseImage from "../../BaseComponents/BaseImage";
import BaseLink from "../../BaseComponents/BaseLink";
import { ENV_VARIABLES } from "@/app/constants/env_variables";

const CategoriesSection = ({ data = [], isSlider = true }) => {
  const store = useStore();
  const rawData =
    data.length > 0 ? [...data, ...data] : store.content.categories;
  const slidesData = rawData || [];

  return (
    <section className="container-layout">
      {isSlider ? (
        <CustomCategorySlider slidesData={slidesData} />
      ) : (
        <section className="grid grid-cols-6 max-md:grid-cols-3 gap-5 items-center">
          {slidesData.slice(0, 6).map((category, idx) => (
            <CategoryCard key={idx} category={category} />
          ))}
        </section>
      )}
    </section>
  );
};

export default CategoriesSection;

function CustomCategorySlider({ slidesData }) {
  const [slidesPerView, setSlidesPerView] = useState(undefined);
  const [slideWidthPx, setSlideWidthPx] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef(null);
  const dragStartX = useRef(null);
  const isDragging = useRef(false);

  const DESKTOP_SPV = 7;
  const MOBILE_SPV = 3;
  const SPG = 2;
  const GAP = 20; // px — must match the `gap` value in the flex container

  // Measure container width and derive slide width in px.
  // Using px for both the slide size AND the translateX avoids the
  // % drift bug where translateX(%) is relative to the element width,
  // not the container — causing the gap to accumulate per step.
  useEffect(() => {
    function measure() {
      const spv = window.innerWidth >= 768 ? DESKTOP_SPV : MOBILE_SPV;
      setSlidesPerView(spv);
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth;
        // Total gap space = GAP × (spv - 1); remaining width split equally
        const sw = (containerW - GAP * (spv - 1)) / spv;
        setSlideWidthPx(sw);
      }
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Reset to first slide on breakpoint change
  const prevSPV = useRef(slidesPerView);
  useEffect(() => {
    if (prevSPV.current !== slidesPerView) {
      setCurrentIndex(0);
      prevSPV.current = slidesPerView;
    }
  }, [slidesPerView]);

  // Last valid index: last slide is flush with the right edge
  const maxIndex = slidesPerView
    ? Math.max(0, slidesData.length - slidesPerView)
    : 0;

  const showNavigation =
    slidesPerView === DESKTOP_SPV && slidesData.length > DESKTOP_SPV;

  // Clamp — slider stops at last slide, no wrap/rewind animation
  const next = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + SPG, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - SPG, 0));
  }, []);

  // ── Pointer / drag handlers (mouse + touch) ────────────────────────────────
  const onPointerDown = (clientX) => {
    dragStartX.current = clientX;
    isDragging.current = false;
  };
  const onPointerMove = (clientX) => {
    if (dragStartX.current === null) return;
    if (Math.abs(clientX - dragStartX.current) > 5) isDragging.current = true;
  };
  const onPointerUp = (clientX) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    dragStartX.current = null;
  };

  const handleTouchStart = (e) => onPointerDown(e.touches[0].clientX);
  const handleTouchMove = (e) => onPointerMove(e.touches[0].clientX);
  const handleTouchEnd = (e) => onPointerUp(e.changedTouches[0].clientX);
  const handleMouseDown = (e) => onPointerDown(e.clientX);
  const handleMouseMove = (e) => {
    if (dragStartX.current !== null) onPointerMove(e.clientX);
  };
  const handleMouseUp = (e) => onPointerUp(e.clientX);
  const handleMouseLeave = (e) => {
    if (dragStartX.current !== null) onPointerUp(e.clientX);
  };

  // ── Skeleton while container hasn't been measured yet ──────────────────────
  if (!slidesPerView || slideWidthPx === null) {
    return (
      <div ref={containerRef} className="flex gap-5 w-full">
        {Array.from({ length: DESKTOP_SPV }).map((_, i) => (
          <div key={i} className="flex-1">
            <div className="w-full aspect-square rounded-full bg-gray-100 animate-pulse" />
            <div className="h-3 mt-2 mx-auto w-3/4 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Exact pixel offset per step: one slide width + one gap
  const translatePx = currentIndex * (slideWidthPx + GAP);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="overflow-hidden w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: "grab" }}
      >
        <div
          style={{
            display: "flex",
            gap: `${GAP}px`,
            transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: `translateX(-${translatePx}px)`,
            willChange: "transform",
          }}
        >
          {slidesData.map((category, idx) => (
            <div
              key={idx}
              style={{
                flex: `0 0 ${slideWidthPx}px`,
                width: `${slideWidthPx}px`,
                minWidth: 0,
              }}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>

      {showNavigation && (
        <>
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            aria-label="Previous"
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 select-none disabled:opacity-40 disabled:cursor-default"
          >
            <ChevronRight className="rotate-180 size-6" />
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            aria-label="Next"
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 select-none disabled:opacity-40 disabled:cursor-default"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
    </div>
  );
}

function CategoryCard({ category }) {
  return (
    <BaseLink href={`/products?category=${category.slug}`}>
      <BaseImage
        src={
          category.icons
            ? ENV_VARIABLES.IMAGE_BASE_URL + "sm-image-" + category.icons
            : category.icon
        }
        className="w-full rounded-full h-auto"
        alt={category.title}
      />
      <p className="text-center capitalize mt-2 font-medium">
        {category.title}
      </p>
    </BaseLink>
  );
}
