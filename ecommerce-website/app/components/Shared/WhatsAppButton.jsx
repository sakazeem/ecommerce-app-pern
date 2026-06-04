"use client";
import React from "react";
import { useStore } from "@/app/providers/StoreProvider";

const WhatsAppButton = () => {
  const store = useStore();
  // Use DB whatsapp number; strip non-digits for wa.me link
  const raw = store.details?.whatsapp || store.socialLinks?.whatsapp || "";
  const phoneNumber = raw.replace(/\D/g, "") || "923340002625";
  const message = "Hello! I would like to inquire about your products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
			fixed bottom-5 left-5 max-md:bottom-15 max-md:left-3 z-50
			bg-green-500 hover:bg-green-600
			text-white
			p-2 rounded-full
			shadow-lg
			flex items-center justify-center
			transition-all duration-300
			hover:scale-110
			whatsapp-float
			"
      title="Chat with us on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-10 h-10 max-md:w-7 max-md:h-7"
      >
        <path d="M12.04 2C6.58 2 2.04 6.54 2.04 12c0 1.97.57 3.9 1.65 5.56L2 22l4.61-1.6A9.93 9.93 0 0 0 12.04 22c5.46 0 9.96-4.54 9.96-10S17.5 2 12.04 2zm.06 18c-1.63 0-3.22-.43-4.62-1.25l-.33-.2-2.73.95.9-2.65-.21-.35a7.93 7.93 0 1 1 6.99 3.5zm4.38-5.86c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.1.15 1.52.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
