"use client";

import React from "react";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [{ name: "About Us", href: "/about" }],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    games: [
      { name: "Latest Games", href: "/games/latest" },
      { name: "Compare Games", href: "/compare" },
      { name: "Game Categories", href: "/categories" },
      { name: "Pre-owned Games", href: "/pre-owned" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: "📘",
      href: "https://facebook.com/switchbai",
      color: "hover:bg-blue-600",
    },
    {
      name: "Instagram",
      icon: "📷",
      href: "https://instagram.com/switchbai",
      color: "hover:bg-pink-600",
    },
    {
      name: "Twitter",
      icon: "🐦",
      href: "https://twitter.com/switchbai",
      color: "hover:bg-blue-400",
    },
    {
      name: "YouTube",
      icon: "📺",
      href: "https://youtube.com/switchbai",
      color: "hover:bg-red-600",
    },
    {
      name: "TikTok",
      icon: "🎵",
      href: "https://tiktok.com/@switchbai",
      color: "hover:bg-black",
    },
  ];

  const paymentMethods = [
    { name: "GCash", icon: "📱" },
    { name: "Maya", icon: "📱" },
    { name: "Bank Transfer", icon: "🏦" },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden w-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-funBlue/10 to-transparent transform skew-x-12 origin-top-left"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-2/3 bg-gradient-to-l from-lameRed/10 to-transparent transform -skew-x-6 origin-bottom-right"></div>
        <div className="absolute top-1/3 right-1/4 w-1/6 h-1/6 bg-gradient-to-br from-success/20 to-transparent transform rotate-45 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full px-8 lg:px-12 xl:px-16 py-16 max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="switchBai Logo"
                    width={500}
                    height={500}
                    priority
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-2xl font-black text-gray-600">SwitchBai</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Your trusted source for quality second-hand Nintendo Switch
                games. We offer the best prices, verified quality, and
                exceptional customer service.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-bold text-gray-600 mb-3 flex items-center gap-2">
                <span className="text-xl">📧</span>
                Stay Updated
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Get notified about new game arrivals and exclusive deals!
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-gray-600 placeholder-gray-400 focus:outline-none focus:border-funBlue focus:bg-white/30 transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-funBlue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🏢</span>
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-funBlue transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🛟</span>
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-funBlue transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Games Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎮</span>
              Games
            </h4>
            <ul className="space-y-3">
              {footerLinks.games.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-funBlue transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📞</span>
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-funBlue">📧</span>
                <a
                  href="mailto:maruronu@gmail.com"
                  className="text-gray-600 hover:text-funBlue transition-colors duration-200 text-sm"
                >
                  maruronu@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-funBlue">📱</span>
                <a
                  href="tel:+639396810206"
                  className="text-gray-600 hover:text-funBlue transition-colors duration-200 text-sm"
                >
                  +63 939 681 0206
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-funBlue">📍</span>
                <span className="text-gray-600 text-sm">
                  Cebu City, Philippines
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Payment Methods */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Social Media */}
            <div>
              <h4 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span className="text-xl">🌐</span>
                Follow Us
              </h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-white/10 border border-gray-200 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-all duration-300 ${social.color}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span className="text-xl">💳</span>
                Payment Methods
              </h4>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center gap-2 bg-white/10 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-gray-600 text-sm font-medium">
                      {method.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-gray-600 text-sm">
              © {currentYear} SwitchBai. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-funBlue transition-colors duration-200 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-600 text-sm font-medium">
                  SSL Secure
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-blue-400">🛡️</span>
                <span className="text-gray-600 text-sm font-medium">
                  GDPR Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorations */}
        <div className="absolute top-1/4 left-0 w-4 h-4 bg-funBlue rounded-full opacity-60 transform rotate-45"></div>
        <div className="absolute bottom-1/4 right-0 w-6 h-6 bg-lameRed rounded-full opacity-60 transform -rotate-12"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-success rounded-full opacity-60 transform rotate-90"></div>
      </div>
    </footer>
  );
};

export default Footer;
