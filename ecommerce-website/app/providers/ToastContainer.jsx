"use client";

import dynamic from "next/dynamic";
const ToastContainerProvider = dynamic(
	() => import("react-toastify").then((mod) => mod.ToastContainer),
	{ ssr: false },
);

export { ToastContainerProvider };
