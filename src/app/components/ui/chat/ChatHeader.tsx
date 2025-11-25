"use client";

import React from "react";
import { HiX } from "react-icons/hi";
import { ChatHeaderProps } from "./types";

export default function ChatHeader({
  title,
  subtitle,
  icon,
  onClose,
  headerColor = "from-funBlue to-blue-600",
}: ChatHeaderProps) {
  return (
    <div
      className={`bg-gradient-to-r ${headerColor} p-4 md:p-4 flex items-center justify-between text-white`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-bold text-lg md:text-lg">{title}</h3>
          {subtitle && (
            <p className="text-xs md:text-xs opacity-90">{subtitle}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close chat"
      >
        <HiX className="w-6 h-6" />
      </button>
    </div>
  );
}
