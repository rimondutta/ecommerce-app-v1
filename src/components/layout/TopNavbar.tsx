"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSafePathname } from "@/lib/useSafePathname";
import {
  Sparkles,
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  Home,
  Flame,
  Gamepad2,
  Sparkle,
  Baby,
  LogOut,
  Package,
  Heart,
  Truck,
} from "lucide-react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa6";
import { useCart } from "@/components/providers/CartProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useUIStore } from "@/store/uiStore";
import { useSession, signOut } from "next-auth/react";

// ── Rocking Horse Brand Logo (Matching reference UI) ──────────────────────────
export function RockingHorseIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Rocker Runner Base */}
      <path
        d="M5 38C15 45 33 45 43 38"
        stroke="#5428D8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Rocker Runner Ends */}
      <path
        d="M4 35.5C4.5 37 5.5 37.5 6.5 37M44 35.5C43.5 37 42.5 37.5 41.5 37"
        stroke="#5428D8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Cross Legs */}
      <path
        d="M13.5 36.5L16.5 25M34.5 36.5L31.5 25"
        stroke="#5428D8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Horse Body */}
      <path
        d="M15 25C15 21.5 18 19 23 19H29C34 19 36.5 22 36.5 25C36.5 26.5 35 27 33 27H18C16 27 15 26.5 15 25Z"
        fill="#6D28D9"
      />
      {/* Saddle */}
      <path
        d="M23 19C23 21.8 25.5 23.5 28.5 23.5C31.5 23.5 33.5 21.8 33.5 19H23Z"
        fill="#C4B5FD"
      />
      {/* Horse Neck & Head */}
      <path
        d="M23 20L18 13C16.8 11.2 15 9.5 12 10C10.5 10.2 9 11.5 9.5 13C10 14.2 11.2 14.5 12.5 15.2L15.5 21L23 20Z"
        fill="#6D28D9"
      />
      {/* Mane details */}
      <circle cx="18" cy="11.5" r="2.5" fill="#A78BFA" />
      <circle cx="20.5" cy="15" r="2.5" fill="#A78BFA" />
      <circle cx="23" cy="18.5" r="2.5" fill="#A78BFA" />
      {/* Ear */}
      <path
        d="M14.5 9.5L16 6.5L18 9"
        fill="#5428D8"
        stroke="#5428D8"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Eye */}
      <circle cx="12" cy="12.5" r="1.2" fill="#FFFFFF" />
      {/* Tail */}
      <path
        d="M36.5 24C39.5 23 42 24.5 41 28"
        stroke="#A78BFA"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface DynamicMenuChild {
  _id?: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  order?: number;
}

interface DynamicMenuItem {
  _id: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
  openInNewTab?: boolean;
  isActive?: boolean;
  order?: number;
  children?: DynamicMenuChild[];
}

export default function TopNavbar() {
  const router = useRouter();
  const pathname = useSafePathname();
  const { openCart, count: cartCount } = useCart();
  const { openSearch } = useSearch();
  const { openMobileMenu, openAuthModal } = useUIStore();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>([]);

  const categoryRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch for dynamic cart count
  const mounted = React.useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for desktop search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      openSearch();
    }
  };

  const [categories, setCategories] = useState([
    { name: "Toys", slug: "toys", icon: "", image: "/images/categories/toys.webp" },
    { name: "Gadgets", slug: "gadgets", icon: "", image: "/images/categories/gadgets.webp" },
    { name: "Dolls", slug: "dolls", icon: "", image: "/images/categories/dolls.webp" },
    { name: "Puzzles", slug: "puzzles", icon: "", image: "/images/categories/puzzles.webp" },
    { name: "Toy Cars", slug: "toy-cars", icon: "", image: "/images/categories/toy-cars.webp" },
    { name: "Arts & Crafts", slug: "arts-crafts", icon: "", image: "/images/categories/arts-crafts.webp" },
    { name: "Cosmetics", slug: "cosmetics", icon: "", image: "/images/categories/cosmetics.webp" },
    { name: "Gift Sets", slug: "gift-sets", icon: "", image: "/images/categories/gift-sets.webp" },
  ]);

  // Dynamically load active categories & menu in idle time (does not block FCP/LCP)
  useEffect(() => {
    let isMounted = true;

    const loadNavMetadata = () => {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.success && Array.isArray(data.data) && data.data.length > 0) {
            setCategories(
              data.data.map((c: { name: string; slug: string; image?: string }) => ({
                name: c.name,
                slug: c.slug,
                image: c.image,
                icon: "",
              }))
            );
          }
        })
        .catch((err) => {
          console.warn("[TopNavbar] Category fetch error:", err);
        });

      fetch("/api/menu")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.success && Array.isArray(data.data) && data.data.length > 0) {
            setMenuItems(data.data);
          }
        })
        .catch((err) => {
          console.warn("[TopNavbar] Menu fetch error:", err);
        });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opt?: { timeout: number }) => number }).requestIdleCallback(
        loadNavMetadata,
        { timeout: 3000 }
      );
      return () => {
        isMounted = false;
        (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle);
      };
    } else {
      const timer = setTimeout(loadNavMetadata, 1500);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <header className="w-full bg-white font-sans sticky top-0 z-40 select-none transition-shadow human-navbar" suppressHydrationWarning>

      {/* ═══════════════════════════════════════════════
          1. TOP ANNOUNCEMENT BAR (Purple)
          ═══════════════════════════════════════════════ */}
      <div className="w-full human-announce-bar text-white text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">

          {/* Left: Free Shipping Announcement */}
          <div className="flex items-center gap-2 font-medium tracking-tight">
            <Truck className="w-4 h-4 text-white shrink-0" />
            <span>সারা বাংলাদেশ ডেলিভারি</span>
          </div>

          {/* Right: Quick Links & Social Icons */}
          <div className="hidden sm:flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-3 text-xs">
              <Link href="/track-order" className="hover:text-white transition-colors">
                Track Order
              </Link>
              <span className="text-white/40">|</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Help
              </Link>
              <span className="text-white/40">|</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/20 text-white/90">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white hover:scale-110 transition-transform"
              >
                <FaFacebookF className="w-3 h-3" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-white hover:scale-110 transition-transform"
              >
                <FaYoutube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white hover:scale-110 transition-transform"
              >
                <FaInstagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="hover:text-white hover:scale-110 transition-transform"
              >
                <FaTiktok className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          2. MAIN HEADER (Logo, Search Bar, Account, Cart)
          ═══════════════════════════════════════════════ */}
      <div className="w-full bg-white border-b border-gray-100 py-2.5 sm:py-4 px-3 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-2 xs:gap-4 sm:gap-8">

          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <button
              type="button"
              onClick={openMobileMenu}
              className="lg:hidden p-1.5 xs:p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2 group min-w-0">
              <RockingHorseIcon className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105 shrink-0" />
              <span className="font-extrabold text-lg xs:text-xl sm:text-2xl text-[#1E1B4B] tracking-tight truncate">
                Toy Hourse
              </span>
            </Link>
          </div>

          {/* Center: Search Bar with Purple Button */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for toys, gadgets..."
                className="w-full bg-[#FBF4EB] hover:bg-[#FDF8F0] focus:bg-white text-[#2C2416] placeholder-[#B5A898] text-sm rounded-full pl-5 pr-12 py-2.5 sm:py-3 border border-[#E8DDD0] focus:border-[#5428D8] focus:outline-none transition-all shadow-[inset_0_1px_3px_rgba(44,36,22,0.06)]"
              />
              <button
                type="submit"
                aria-label="Search products"
                className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5428D8] text-white hover:bg-[#481fbe] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right: Account & Cart Buttons */}
          <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-6 shrink-0">

            {/* Mobile Search Icon */}
            <button
              type="button"
              onClick={openSearch}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Button / Dropdown */}
            <div ref={accountRef} className="relative">
              {session?.user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#5428D8] py-2 px-2.5 sm:px-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {session.user.image ? (
                      <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          fill
                          className="object-cover"
                          sizes="20px"
                        />
                      </div>
                    ) : (
                      <User className="w-4 h-4 text-gray-700" />
                    )}
                    <span className="hidden sm:inline-block max-w-[90px] truncate">
                      {session.user.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isAccountOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Account Dropdown Menu */}
                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-[#2A1810] truncate">{session.user.name || session.user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#5428D8] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#5428D8] transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#5428D8] transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Wishlist</span>
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#5428D8] py-2 px-2.5 sm:px-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Sign in"
                >
                  <User className="w-4 h-4 text-gray-700" />
                  <span className="hidden sm:inline-block">Sign In / Sign Up</span>
                </button>
              )}
            </div>

            {/* Cart Button with Circular Red Badge */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-2 py-2 px-3 rounded-full hover:bg-gray-50 text-gray-800 hover:text-[#5428D8] transition-colors cursor-pointer"
              aria-label="View shopping cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-gray-800" />
                <span className="absolute -top-2 -right-2.5 bg-[#EF4444] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center leading-none shadow-xs">
                  {mounted ? cartCount : 0}
                </span>
              </div>
              <span className="hidden sm:inline-block text-sm font-bold">Cart</span>
            </button>

          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          3. CATEGORIES & LINKS SUB-NAVBAR
          ═══════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full bg-white border-b border-gray-100/80 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex items-center gap-8">

          {/* "All Categories" Purple Button */}
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="bg-[#5428D8] hover:bg-[#481fbe] text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-xs cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Categories Dropdown */}
            {isCategoryOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 animate-fade-in max-h-96 overflow-y-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${encodeURIComponent(cat.slug)}`}
                    onClick={() => setIsCategoryOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#5428D8] transition-colors"
                  >
                    {cat.image && (
                      <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0">
                        <Image src={cat.image} alt={cat.name} fill sizes="24px" className="object-contain" />
                      </div>
                    )}
                    <span className="font-semibold truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links (Dynamic from CMS) */}
          <nav className="flex items-center gap-6 xl:gap-8 text-sm">
            {menuItems.length > 0 ? (
              menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isCurrent =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url.split("?")[0]);

                if (hasChildren) {
                  return (
                    <div
                      key={item._id}
                      className="relative"
                      onMouseEnter={() => setActiveDropdown(item._id)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        href={item.url}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                        className={`flex items-center gap-1.5 font-bold transition-colors py-1 ${isCurrent
                          ? "text-[#5428D8]"
                          : "text-gray-800 hover:text-[#5428D8]"
                          }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="bg-[#EF4444] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2.5]" />
                      </Link>

                      {activeDropdown === item._id && (
                        <div className="absolute top-full left-0 pt-1 w-48 z-50">
                          <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                            {item.children?.map((child, ci) => (
                              <Link
                                key={ci}
                                href={child.url}
                                target={child.openInNewTab ? "_blank" : undefined}
                                rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                                className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8] transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item._id}
                    href={item.url}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${isCurrent
                      ? "text-[#5428D8]"
                      : "text-gray-800 hover:text-[#5428D8]"
                      }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-[#EF4444] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              /* Fallback static links matching initial design */
              <>
                <Link
                  href="/"
                  className="flex items-center text-[#5428D8] font-bold hover:opacity-85 transition-opacity"
                >
                  <span>Home</span>
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("toys")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href="/products?category=toys"
                    className="flex items-center gap-1.5 text-gray-800 hover:text-[#5428D8] font-bold transition-colors py-1"
                  >
                    <span>Toys</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2.5]" />
                  </Link>
                  {activeDropdown === "toys" && (
                    <div className="absolute top-full left-0 pt-1 w-48 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                        <Link href="/products?category=toys" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">All Toys</Link>
                        <Link href="/products?category=building-blocks" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Building Blocks</Link>
                        <Link href="/products?category=action-figures" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Action Figures</Link>
                        <Link href="/products?category=baby-toddler" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Baby & Toddler</Link>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("gadgets")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href="/products?category=gadgets"
                    className="flex items-center gap-1.5 text-gray-800 hover:text-[#5428D8] font-bold transition-colors py-1"
                  >
                    <span>Gadgets</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2.5]" />
                  </Link>
                  {activeDropdown === "gadgets" && (
                    <div className="absolute top-full left-0 pt-1 w-48 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                        <Link href="/products?category=gadgets" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">All Gadgets</Link>
                        <Link href="/products?category=remote-control" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Remote Control & Drones</Link>
                        <Link href="/products?category=gadgets" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Kids Smartwatches</Link>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown("cosmetics")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href="/products?category=cosmetics"
                    className="flex items-center gap-1.5 text-gray-800 hover:text-[#5428D8] font-bold transition-colors py-1"
                  >
                    <span>Cosmetics</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2.5]" />
                  </Link>
                  {activeDropdown === "cosmetics" && (
                    <div className="absolute top-full left-0 pt-1 w-48 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                        <Link href="/products?category=cosmetics" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">All Cosmetics</Link>
                        <Link href="/products?category=cosmetics" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Kids Safe Makeup</Link>
                        <Link href="/products?category=cosmetics" className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#5428D8]">Nail Art & Glitter</Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/products?tag=specialoffer"
                  className="flex items-center text-gray-800 hover:text-[#5428D8] font-bold transition-colors"
                >
                  <span>Deals</span>
                </Link>

                <Link
                  href="/about"
                  className="text-gray-800 hover:text-[#5428D8] font-bold transition-colors"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="text-gray-800 hover:text-[#5428D8] font-bold transition-colors"
                >
                  Contact
                </Link>
              </>
            )}
          </nav>

        </div>
      </div>

    </header>
  );
}
