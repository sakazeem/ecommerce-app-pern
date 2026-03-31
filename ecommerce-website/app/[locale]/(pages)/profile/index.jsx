"use client";
import { MapPin, Heart, LogOut, Package, Star, User } from "lucide-react";
import { useState } from "react";
import FavouritesPage from "../favourites";
import ProfileSidebar from "./ProfileSidebar";
import Orders from "./tabContents/Orders";
import Profile from "./tabContents/Profile";
import Reviews from "./tabContents/Reviews";
import Addresses from "./tabContents/Addresses";

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  // Sample data
  const user = {
    name: "Salman Azeem",
    email: "salman@example.com",
    phone: "+92 300 1234567",
  };

  const menuItems = [
    { id: "profile", icon: User, label: "Your profile" },
    { id: "addresses", icon: MapPin, label: "Addresses" },
    { id: "orders", icon: Package, label: "Your orders" },
    { id: "reviews", icon: Star, label: "Your reviews" },
    // { id: "coupons", icon: CreditCard, label: "Coupons & offers" },
    // { id: "credit", icon: CreditCard, label: "Credit balance" },
    { id: "wishlist", icon: Heart, label: "Wishlist" },
    { id: "logout", icon: LogOut, label: "Logout", isLogoutButton: true },
    // { id: "stores", icon: Store, label: "Followed stores" },
    // { id: "history", icon: History, label: "Browsing history" },
    // { id: "language", icon: Globe, label: "Country/Region & Language" },
    // { id: "payment", icon: CreditCard, label: "Your payment methods" },
    // { id: "security", icon: Shield, label: "Account security" },
    // { id: "permissions", icon: Lock, label: "Permissions" },
    // { id: "notifications", icon: Bell, label: "Notifications" },
  ];

  const renderOrdersContent = () => {
    return <Orders />;
  };

  const renderProfileContent = () => <Profile user={user} />;

  const renderAddressesContent = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-6 border-2 border-secondary">
        <div className="flex justify-between items-start mb-4">
          <div>
            {/* <div className="font-semibold text-lg mb-2">Home Address</div> */}
            <p className="text-gray-600">123 Main Street, Block A</p>
            <p className="text-gray-600">Karachi, Sindh, 75500</p>
            <p className="text-gray-600">Pakistan</p>
            <p className="text-gray-600 mt-2">+92 300 1234567</p>
          </div>
          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
            Default
          </span>
        </div>
        <div className="flex gap-3">
          <button className="text-secondary hover:text-secondary font-medium">
            Edit
          </button>
          <button className="text-gray-500 hover:text-gray-600 font-medium">
            Delete
          </button>
        </div>
      </div>
      <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-secondary hover:text-secondary transition-colors">
        + Add New Address
      </button>
    </div>
  );

  const renderWishlistContent = () => <FavouritesPage />;

  const renderReviewsContent = () => <Reviews />;

  const renderContent = () => {
    if (activeTab.startsWith("orders") || activeTab.startsWith("all-orders")) {
      return renderOrdersContent();
    }

    switch (activeTab) {
      case "profile":
        return renderProfileContent();
      case "addresses":
        return <Addresses />;
      case "wishlist":
        return renderWishlistContent();
      case "reviews":
        return renderReviewsContent();
      default:
        return (
          <div className="bg-white rounded-lg p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">🚧</div>
            <div className="text-lg">Coming Soon</div>
            <div className="text-sm mt-2">
              This section is under development
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[50vh]">
      <div className="container-layout pt-10 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <ProfileSidebar
            user={user}
            menuItems={menuItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg border sticky top-48 p-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
