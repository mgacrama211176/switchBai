"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { HiLogout, HiHome } from "react-icons/hi";

interface AdminHeaderProps {
  userEmail: string;
}

export default function AdminHeader({ userEmail }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-funBlue to-lameRed bg-clip-text text-transparent">
                SwitchBai
              </h1>
              <span className="text-sm font-semibold text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                Admin
              </span>
            </Link>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {userEmail}
            </span>

            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
              title="View Site"
            >
              <HiHome className="w-5 h-5" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-lameRed text-white hover:bg-lameRed/90 transition-colors duration-300"
            >
              <HiLogout className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
