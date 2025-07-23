"use client";

import { useState } from "react";
import Image from "next/image";
import RadialBackground from "@/app/components/ui/RadialBackground";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import HeroSection from "@/app/components/ui/home/HeroSection";
import CompareGamesSection from "./components/ui/home/CompareGamesSection";
import AboutUsSection from "./components/ui/home/AboutUsSection";

export default function Home() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement email subscription logic
    console.log("Email submitted:", email);
  };

  console.log(process.env.NEXT_PUBLIC_ENVIRONMENT);

  return (
    <main>
      {/* Global Navigation */}

      {/* Animated gradient background */}
      {process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? (
        <div className="relative flex min-h-screen flex-col items-center justify-center   bg-white">
          <Navigation />
          <HeroSection />
          <CompareGamesSection />
          <AboutUsSection />
        </div>
      ) : (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-6 pt-20 overflow-hidden bg-white">
          <RadialBackground />

          {/* Content */}
          <div className="relative w-full max-w-2xl space-y-12 text-center">
            {/* Logo */}
            <div className="mx-auto w-64 h-64 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={256}
                height={256}
                priority
                className="w-full h-full object-contain"
              />
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                We're cooking up something awesome
              </h1>
              <p className="text-xl text-gray-700">
                Stay tuned! Be the first to know when we launch.
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-w-0 flex-auto rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#00c3e3] bg-white"
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  className="flex-none rounded-lg bg-lameRed px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-lameRed/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lameRed transition-colors"
                >
                  Notify me
                </button>
              </div>
              <p className="text-sm text-gray-600">
                We care about your data. Read our{" "}
                <a
                  href="#"
                  className="font-medium text-funBlue hover:text-funBlue/80 hover:underline"
                >
                  Privacy Policy
                </a>
              </p>
            </form>

            {/* Social Links */}
            <div className="pt-6">
              <a
                href="https://www.facebook.com/SwitchTaBai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-funBlue transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Check our Facebook page
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
