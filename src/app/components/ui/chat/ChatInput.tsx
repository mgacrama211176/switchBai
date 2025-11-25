"use client";

import React, { useRef, useEffect } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { ChatInputProps } from "./types";

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
  buttonColor = "bg-funBlue",
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [disabled]);

  return (
    <form onSubmit={onSubmit} className="p-4 bg-white border-t">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-funBlue focus:border-transparent outline-none text-black"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className={`p-2 ${buttonColor} text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          aria-label="Send message"
        >
          <HiPaperAirplane className="w-5 h-5 rotate-90" />
        </button>
      </div>
    </form>
  );
}
