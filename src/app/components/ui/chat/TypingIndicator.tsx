"use client";

import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-none p-3 md:p-3">
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
