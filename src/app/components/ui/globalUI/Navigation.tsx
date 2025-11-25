"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiMenu,
  HiX,
  HiInformationCircle,
  HiMail,
  HiSwitchHorizontal,
  HiChevronDown,
  HiClipboardList,
} from "react-icons/hi";
import { PiGameControllerThin } from "react-icons/pi";
import { RiParentLine } from "react-icons/ri";

interface SubMenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  description?: string;
  subItems?: SubMenuItem[];
}

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll direction detection with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const currentScrollPos = window.scrollY;

        // Show nav if at top of page
        if (currentScrollPos < 10) {
          setVisible(true);
          setScrolled(false);
        } else {
          // Show nav if scrolling up, hide if scrolling down
          setVisible(prevScrollPos > currentScrollPos);
          setScrolled(true);
        }

        setPrevScrollPos(currentScrollPos);
      }, 10); // Throttle to 10ms
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  // Close mobile menu when nav hides
  useEffect(() => {
    if (!visible && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [visible, isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      name: "Games",
      icon: <PiGameControllerThin className="w-6 h-6" />,
      description: "Browse, rent and compare games",
      subItems: [
        {
          name: "Browse Games",
          href: "/games",
          icon: <PiGameControllerThin className="w-5 h-5" />,
          description: "View all available games",
        },
        {
          name: "Rent a Game",
          href: "/rent-a-game",
          icon: <RiParentLine className="w-5 h-5" />,
          description: "Rent games from our collection",
        },
        {
          name: "Compare Games",
          href: "/compare",
          icon: <HiSwitchHorizontal className="w-5 h-5" />,
          description: "Compare game features and prices",
        },
        {
          name: "Trade Game",
          href: "/trade-game",
          icon: <HiSwitchHorizontal className="w-5 h-5" />,
          description: "Trade your games with us",
        },
      ],
    },
    {
      name: "About SwitchBai",
      href: "/about",
      icon: <HiInformationCircle className="w-6 h-6" />,
      description: "Learn more about us",
    },
    {
      name: "Track Order",
      href: "/track-order",
      icon: <HiClipboardList className="w-6 h-6" />,
      description: "Track your order status",
    },
    {
      name: "Contact Us",
      href: "/contact",
      icon: <HiMail className="w-6 h-6" />,
      description: "Get in touch with our team",
    },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      handleMobileMenuToggle();
    }
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrolled
            ? "bg-white/60 backdrop-blur-xl shadow-xl border-b border-gray-100"
            : "bg-white/70 backdrop-blur-md shadow-lg border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-auto">
            {/* Logo Only */}
            <Link
              href="/"
              className="flex items-center group"
              aria-label="switchBai home"
            >
              <div className="w-24 h-24 relative p-1 rounded-xl py-4">
                <Image
                  src="/logo.webp"
                  alt="switchBai Logo"
                  width={1000}
                  height={1000}
                  priority
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2">
              {/* Navigation Items */}
              {navigationItems.map((item) =>
                item.subItems ? (
                  <div
                    key={item.name}
                    className="relative"
                    ref={openDropdown === item.name ? dropdownRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.name ? null : item.name,
                        )
                      }
                      className="flex items-center space-x-2 text-gray-800 hover:text-lameRed font-medium transition-all duration-300 relative px-3 py-2 rounded-lg hover:bg-lameRed/5 group"
                      aria-label={`Open ${item.name} menu`}
                      aria-expanded={openDropdown === item.name}
                    >
                      <span className="text-lameRed group-hover:text-lameRed transition-colors duration-300">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                      <HiChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                      {/* Subtle hover underline */}
                      <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-funBlue to-lameRed scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 group"
                          >
                            <div className="text-lameRed group-hover:text-lameRed transition-colors duration-300 mt-0.5">
                              {subItem.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-lameRed transition-colors duration-200">
                                {subItem.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {subItem.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className="flex items-center space-x-2 text-gray-800 hover:text-red font-medium transition-all duration-300 relative px-3 py-2 rounded-lg hover:bg-red/5 group"
                    aria-label={`Navigate to ${item.name}`}
                  >
                    <span className="text-lameRed group-hover:text-lameRed transition-colors duration-300">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>

                    {/* Subtle hover underline */}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue to-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
                  </Link>
                ),
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleMobileMenuToggle}
                onKeyDown={handleKeyDown}
                className="p-3 rounded-lg text-gray-700 hover:text-funBlue hover:bg-funBlue/5 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-funBlue/20 transition-all duration-200 min-h-14 min-w-14 flex items-center justify-center"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
                tabIndex={0}
              >
                {isMobileMenuOpen ? (
                  <HiX className="w-7 h-7" />
                ) : (
                  <HiMenu className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-200 overflow-hidden ${
            isMobileMenuOpen
              ? "max-h-screen opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2"
          }`}
        >
          <div className="border-t border-gray-300 bg-white shadow-lg">
            <div className="px-5 pt-5 pb-6 space-y-3 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Mobile Navigation Items */}
              {navigationItems.map((item, index) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className="space-y-1">
                      {/* Parent Item */}
                      <div className="flex items-center space-x-3 px-5 py-4 text-base font-bold text-gray-900 min-h-14 bg-gray-50 rounded-lg">
                        <span className="text-lameRed text-xl">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {/* Sub Items */}
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center space-x-3 px-5 py-4 pl-14 text-sm font-medium text-gray-900 hover:text-funBlue hover:bg-funBlue/5 active:bg-gray-100 rounded-lg transition-all duration-200 group min-h-14"
                          onClick={handleMobileMenuClose}
                          aria-label={`Navigate to ${subItem.name}`}
                        >
                          <span className="text-funBlue group-hover:text-funBlue transition-colors duration-200 text-lg">
                            {subItem.icon}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold">{subItem.name}</div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {subItem.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className="flex items-center space-x-3 px-5 py-4 text-base font-medium text-gray-900 hover:text-funBlue hover:bg-funBlue/5 active:bg-gray-100 rounded-lg transition-all duration-200 group min-h-14"
                      onClick={handleMobileMenuClose}
                      aria-label={`Navigate to ${item.name}`}
                    >
                      <span className="text-funBlue group-hover:text-funBlue transition-colors duration-200 text-xl">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  )}
                  {/* Divider between sections */}
                  {index < navigationItems.length - 1 && (
                    <div className="my-2 border-t border-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
