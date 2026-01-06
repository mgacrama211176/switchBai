"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessagesProps } from "./types";
import TypingIndicator from "./TypingIndicator";
import ChatFeedback from "./ChatFeedback";

export default function ChatMessages({
  messages,
  isTyping = false,
  onFeedbackRequested,
  showFeedbackFor,
  chatId,
  conversationEnded = false,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Request feedback for assistant messages after delay
  useEffect(() => {
    if (onFeedbackRequested && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !isTyping) {
        const timer = setTimeout(() => {
          onFeedbackRequested(messages.length - 1);
        }, 2000); // 2 second delay
        return () => clearTimeout(timer);
      }
    }
  }, [messages, isTyping, onFeedbackRequested]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-4 bg-gray-50">
      {messages.map((msg, idx) => (
        <div key={idx} className="space-y-2">
          <div
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
          {/* Show feedback for assistant messages */}
          {msg.role === "assistant" &&
            showFeedbackFor === idx &&
            chatId &&
            !conversationEnded && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-[80%]">
                  <ChatFeedback
                    messageIndex={idx}
                    chatId={chatId}
                    onFeedbackSubmitted={() => {
                      // Feedback submitted, hide it
                      if (onFeedbackRequested) {
                        onFeedbackRequested(-1);
                      }
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      ))}

      {isTyping && <TypingIndicator />}

      {conversationEnded && (
        <div className="flex justify-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold">Was this conversation helpful?</p>
            <p className="text-xs mt-1">Thank you for chatting with us!</p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
