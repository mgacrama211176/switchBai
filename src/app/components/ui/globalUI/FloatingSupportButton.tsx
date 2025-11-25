"use client";

import React from "react";
import { HiChatAlt2 } from "react-icons/hi";

interface FloatingSupportButtonProps {
  onClick: () => void;
}

export default function FloatingSupportButton({
  onClick,
}: FloatingSupportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-4 sm:p-5 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] group"
      aria-label="Open support chat"
    >
      <HiChatAlt2 className="w-6 h-6 sm:w-7 sm:h-7" />
    </button>
  );
}
