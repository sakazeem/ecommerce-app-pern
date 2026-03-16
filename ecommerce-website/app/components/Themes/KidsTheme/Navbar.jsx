"use client";
import { useEffect, useState, useRef } from "react";
import BaseLink from "@/app/components/BaseComponents/BaseLink";
import Logo from "@/app/components/Shared/Logo";
import { useStore } from "@/app/providers/StoreProvider";
import { useCartStore } from "@/app/store/cartStore";
import { Heart, ShoppingCartIcon, User, Menu, X, Search } from "lucide-react";
import SearchInput from "../../Shared/form/SearchInput";
import NavigationMenu from "./NavigationMenu";
import { useAuth } from "@/app/providers/AuthProvider";
import CartDrawer from "@/app/[locale]/(pages)/cart/cartDrawer";
import AuthDrawer from "../../Shared/AuthDrawer";
import { SOCIAL_CONFIG } from "./Footer";
import { useRouter } from "next/navigation";
import { useAuthUIStore } from "@/app/store/useAuthUIStore";
import BaseDrawer from "../../BaseComponents/BaseDrawer";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  // const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const {
    authDrawerOpen,
    openAuthDrawer,
    closeAuthDrawer,
    cartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    searchOpen,
    toggleSearch,
    closeSearch,
  } = useAuthUIStore();

  const store = useStore();
  const { cart, favourites } = useCartStore();

  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const cartCount = cart?.length || 0;
  const favCount = favourites?.length || 0;

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Top Header */}

      <header className="text-headerText bg-header w-full py-2 p4">
        <section className="container-layout text-center p4 flex items-center justify-center">
          <div className="max-md:hidden flex gap-2">
            <BaseLink href="/about-us" className="hover:underline">
              About Us
            </BaseLink>
            <BaseLink href="/contact-us" className="hover:underline">
              Contact Us
            </BaseLink>
          </div>
          <p className="flex-1">{store.content.header.text}</p>
          <ul className="max-md:hidden flex gap-3 text-lg flex-wrap justify-center items-center text-primary">
            {SOCIAL_CONFIG.slice(0, 3).map(({ key, icon: Icon, label }) => {
              const href = store.socialLinks?.[key];
              if (!href) return null;

              return (
                <li key={key}>
                  <BaseLink
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="
										text-light hover:text-primary transition
									"
                  >
                    <Icon />
                  </BaseLink>
                </li>
              );
            })}
          </ul>
        </section>
      </header>
      <div className="sticky top-0 z-40">
        {/* Main Navbar */}
        <div className="border-b border-border-color py-3 sm:py-5 bg-light relative">
          <section className="flex container-layout items-center justify-between gap-3 sm:gap-10">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1">
              {/* Mobile Menu Button */}
              <button
                className="sm:hidden p-2 rounded-md hover:bg-gray-100 transition"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Logo
                src={store.content.logo}
                className="w-40 max-md:w-28 h-auto object-contain mx-auto max-md:hidden"
              />
            </div>
            {/* Logo */}
            <div className="flex-1 md:flex-2">
              {/* Desktop Search */}
              <div className="hidden md:block flex-1 md:w-3/4/">
                <SearchInput className="w-full" />
              </div>
              <Logo
                src={store.content.logo}
                className="w-40 max-md:w-28 h-auto object-contain mx-auto md:hidden"
              />
            </div>
            {/* Right Section (Icons) */}
            <div className="flex flex-1 justify-end items-center gap-4 sm:gap-6 relative">
              {/* Search Icon for Mobile */}
              <button className="sm:hidden" onClick={() => toggleSearch()}>
                <Search className="cursor-pointer hover:text-primary transition" />
              </button>

              {/* Favourites */}
              <BaseLink href="/favourites" className="relative hidden sm:block">
                <Heart className="cursor-pointer hover:text-primary transition stroke-1" />
                {favCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-light text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </BaseLink>

              {/* Cart */}
              <button
                // href="/cart"
                onClick={() => {
                  openCartDrawer();
                }}
                className="relative"
              >
                <ShoppingCartIcon className="cursor-pointer hover:text-primary transition stroke-1" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-light text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User */}

              <button
                onClick={() => {
                  !isAuthenticated ? openAuthDrawer() : router.push("/profile");
                }}
                // href={!isAuthenticated ? "/login" : "/profile"}
              >
                <User className="cursor-pointer hover:text-primary transition hidden sm:block stroke-1" />
              </button>
            </div>
          </section>

          {/* Mobile Search Dropdown */}
          <BaseDrawer
            open={searchOpen}
            onClose={closeSearch}
            title="Search"
            side="right"
            width="w-[350px]"
          >
            <SearchInput className="w-full" placeholder="Search products..." />
          </BaseDrawer>
        </div>

        {/* <AuthDrawer open={authDrawerOpen} setOpen={setAuthDrawerOpen} /> */}
        <AuthDrawer
          open={authDrawerOpen}
          setOpen={(val) => (val ? openAuthDrawer() : closeAuthDrawer())}
        />
        <CartDrawer
          open={cartDrawerOpen}
          setOpen={(val) => (val ? openCartDrawer() : closeCartDrawer())}
        />
        {/* Navigation Menu */}
        <NavigationMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>
    </>
  );
};

export default Navbar;
