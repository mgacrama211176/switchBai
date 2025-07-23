"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiMenu,
  HiX,
  HiInformationCircle,
  HiMail,
  HiSearch,
  HiSwitchHorizontal,
} from "react-icons/hi";
import { PiGameControllerThin } from "react-icons/pi";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
};

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      name: "Games",
      href: "/games",
      icon: <PiGameControllerThin className="w-6 h-6" />,
      description: "Browse our game collection",
    },
    {
      name: "Compare",
      href: "/copare",
      icon: <HiSwitchHorizontal className="w-6 h-6" />,
      description: "Browse our game collection",
    },
    {
      name: "About SwitchBai",
      href: "/about",
      icon: <HiInformationCircle className="w-6 h-6" />,
      description: "Learn more about us",
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality here
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
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
              <div className="w-32 h-32 relative p-1 rounded-xl  py-4">
                <Image
                  src="/logo.png"
                  alt="switchBai Logo"
                  width={500}
                  height={500}
                  priority
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Desktop Navigation with Search */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red font-medium transition-all duration-300 relative px-3 py-2 rounded-lg hover:bg-red/5 group"
                  aria-label={`Navigate to ${item.name}`}
                >
                  <span className="text-lameRed/70 group-hover:text-lameRed transition-colors duration-300">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>

                  {/* Subtle hover underline */}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue to-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full"></span>
                </Link>
              ))}

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all duration-300 text-sm bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </form>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleMobileMenuToggle}
                onKeyDown={handleKeyDown}
                className="p-2 rounded-lg text-gray-700 hover:text-blue hover:bg-blue/5 focus:outline-none focus:ring-2 focus:ring-blue/20 transition-all duration-300"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
                tabIndex={0}
              >
                {isMobileMenuOpen ? (
                  <HiX className="w-6 h-6" />
                ) : (
                  <HiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all duration-300 bg-gray-50/50"
                  />
                </div>
              </form>

              {/* Mobile Navigation Items */}
              {navigationItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-blue hover:bg-blue/5 rounded-lg transition-all duration-300 group"
                  onClick={handleMobileMenuClose}
                  aria-label={`Navigate to ${item.name}`}
                >
                  <span className="text-blue/70 group-hover:text-blue transition-colors duration-300">
                    {item.icon}
                  </span>
                  <div>
                    <div>{item.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={handleMobileMenuClose}
        />
      )}
    </>
  );
};

export default Navigation;
