"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessagesProps } from "./types";
import TypingIndicator from "./TypingIndicator";

export default function ChatMessages({
  messages,
  isTyping = false,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-4 bg-gray-50">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex animate-fadeIn ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] md:max-w-[80%] p-3 md:p-3 rounded-2xl ${
              msg.role === "user"
                ? "bg-funBlue text-white rounded-br-none"
                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
            }`}
          >
            <p className="text-base md:text-sm leading-relaxed">
              {msg.content}
            </p>
          </div>
        </div>
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
