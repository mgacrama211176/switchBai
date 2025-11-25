"use client";

import React, { useEffect } from "react";
import { ChatModalProps } from "./types";

export default function ChatModal({
  isOpen,
  onClose,
  children,
  zIndex = 60,
}: ChatModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center md:p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex }}
    >
      {children}
    </div>
  );
}
