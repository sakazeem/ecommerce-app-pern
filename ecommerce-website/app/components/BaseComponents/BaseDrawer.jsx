"use client";

import { Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// interface DrawerProps {
// 	open: boolean;
// 	onClose: () => void;
// 	title?: string;
// 	side?: "left" | "right";
// 	width?: string;
// 	children: React.ReactNode;
// }

export default function BaseDrawer({
  open,
  onClose,
  title,
  side = "right",
  width = "w-[420px]",
  children,
}) {
  const isRight = side === "right";

  useEffect(() => {
    if (open) {
      window.history.pushState({ drawer: true }, "");
    }
  }, [open]);

  useEffect(() => {
    const handlePopState = () => {
      if (open) {
        onClose();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [open]);

  return (
    <Transition show={open || false} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm/" />
        </TransitionChild>

        {/* Drawer */}
        <div className="fixed inset-0 overflow-hidden">
          <div
            className={`absolute inset-y-0 ${
              isRight ? "right-0" : "left-0"
            } flex max-w-full`}
          >
            <TransitionChild
              as={Fragment}
              enter="transform transition duration-300 ease-out"
              enterFrom={isRight ? "translate-x-full" : "-translate-x-full"}
              enterTo="translate-x-0"
              leave="transform transition duration-200 ease-in"
              leaveFrom="translate-x-0"
              leaveTo={isRight ? "translate-x-full" : "-translate-x-full"}
            >
              <DialogPanel
                className={`bg-white shadow-xl flex flex-col ${width}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <DialogTitle className="text-lg font-semibold">
                    {title}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-black"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
