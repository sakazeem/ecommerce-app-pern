"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const HeroSection = ({
  slides = [],
  autoPlay = true,
  autoPlayDelay = 4000,
  speed = 500,
  showNavigation = true,
  showPagination = true,
}) => {
  const router = useRouter();

  // index 0 = last-clone, 1..N = real slides, N+1 = first-clone
  const [index, setIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const intervalRef = useRef(null);

  // ---------------------------
  // DRAG / SWIPE SUPPORT
  // ---------------------------
  const dragStartX = useRef(null);
  const isDragging = useRef(false);
  const SWIPE_THRESHOLD = 50;

  const onPointerDown = (clientX) => {
    dragStartX.current = clientX;
    isDragging.current = false;
    setIsPaused(true);
  };

  const onPointerMove = (clientX) => {
    if (dragStartX.current === null) return;
    if (Math.abs(clientX - dragStartX.current) > 5) {
      isDragging.current = true;
    }
  };

  const onPointerUp = useCallback((clientX) => {
    if (dragStartX.current === null) return;
    const delta = clientX - dragStartX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) goNext();
      else goPrev();
    }
    dragStartX.current = null;
    setIsPaused(false);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => onPointerDown(e.touches[0].clientX);
  const handleTouchMove = (e) => onPointerMove(e.touches[0].clientX);
  const handleTouchEnd = (e) => onPointerUp(e.changedTouches[0].clientX);

  // Mouse handlers
  const handleMouseDown = (e) => onPointerDown(e.clientX);
  const handleMouseMove = (e) => {
    if (dragStartX.current !== null) onPointerMove(e.clientX);
  };
  const handleMouseUp = (e) => onPointerUp(e.clientX);
  const handleMouseLeave = (e) => {
    if (dragStartX.current !== null) onPointerUp(e.clientX);
    setIsPaused(false);
  };

  const slidesCount = slides.length;
  if (!slidesCount) return null;

  const extendedSlides = [
    slides[slidesCount - 1], // clone of last → index 0
    ...slides, // real slides  → index 1..N
    slides[0], // clone of first → index N+1
  ];

  // ---------------------------
  // SLIDE TO AN INDEX (animated)
  // ---------------------------
  const slideTo = useCallback(
    (nextIndex) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const track = trackRef.current;
      if (!track) return;

      // Apply transition then move
      track.style.transition = `transform ${speed}ms ease-out`;
      setIndex(nextIndex);

      // After animation ends, check if we hit a clone and jump instantly
      const timer = setTimeout(() => {
        if (nextIndex === slidesCount + 1) {
          // Was on first-clone → jump to real first (index 1) without animation
          track.style.transition = "none";
          setIndex(1);
          // Re-enable in next paint so React doesn't batch the transition back on
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              isAnimating.current = false;
            });
          });
        } else if (nextIndex === 0) {
          // Was on last-clone → jump to real last
          track.style.transition = "none";
          setIndex(slidesCount);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              isAnimating.current = false;
            });
          });
        } else {
          isAnimating.current = false;
        }
      }, speed);

      return () => clearTimeout(timer);
    },
    [speed, slidesCount],
  );

  const goNext = useCallback(() => {
    setIndex((prev) => {
      slideTo(prev + 1);
      return prev; // actual update happens inside slideTo via setIndex
    });
  }, [slideTo]);

  const goPrev = useCallback(() => {
    setIndex((prev) => {
      slideTo(prev - 1);
      return prev;
    });
  }, [slideTo]);

  // Simpler direct callers (buttons & autoplay)
  const next = useCallback(() => {
    if (isAnimating.current) return;
    setIndex((prev) => {
      const ni = prev + 1;
      slideTo(ni);
      return prev;
    });
  }, [slideTo]);

  const prev = useCallback(() => {
    if (isAnimating.current) return;
    setIndex((prev) => {
      const ni = prev - 1;
      slideTo(ni);
      return prev;
    });
  }, [slideTo]);

  // ---------------------------
  // AUTOPLAY
  // ---------------------------
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    intervalRef.current = setInterval(() => {
      next();
    }, autoPlayDelay);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, autoPlay, autoPlayDelay, next]);

  // ---------------------------
  // CLICK HANDLER
  // ---------------------------
  const handleClick = (slide) => {
    if (isDragging.current) return;
    if (slide?.categorySlug) {
      router.push(`/products?category=${slide.categorySlug}`);
    }
  };

  // Active dot index (0-based, real slides only)
  const activeDot =
    index === 0 ? slidesCount - 1 : index === slidesCount + 1 ? 0 : index - 1;

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* TRACK */}
      <div
        ref={trackRef}
        className="flex w-full select-none"
        style={{
          transform: `translateX(-${index * 100}%)`,
          cursor: dragStartX.current !== null ? "grabbing" : "grab",
        }}
      >
        {extendedSlides.map((slide, i) => (
          <div
            key={i}
            className="min-w-full cursor-pointer"
            onClick={() => handleClick(slide)}
          >
            <img
              src={slide.src}
              width={1920}
              height={550}
              loading={i === 1 ? "eager" : "lazy"}
              fetchPriority={i === 1 ? "high" : "auto"}
              className="w-full h-auto"
              alt={slide.alt || `Banner ${i}`}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* NAVIGATION */}
      {showNavigation && (
        <>
          <button
            onClick={prev}
            className="absolute left-6 max-md:left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 select-none"
          >
            <ChevronRight className="rotate-180 size-6 max-md:size-5" />
          </button>

          <button
            onClick={next}
            className="absolute right-6 max-md:right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-light bg-secondary/85 hover:brightness-95 shadow-md rounded-full p-1 max-md:p-0.5 select-none"
          >
            <ChevronRight className="size-6 max-md:size-5" />
          </button>
        </>
      )}

      {/* DOTS */}
      {showPagination && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => slideTo(i + 1)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeDot === i ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
