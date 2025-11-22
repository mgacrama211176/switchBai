"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { HiX, HiPaperAirplane, HiSparkles } from "react-icons/hi";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface NegotiationChatProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

export default function NegotiationChat({
  isOpen,
  onClose,
  totalAmount,
}: NegotiationChatProps) {
  const { cart, applyDiscount } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [negotiationId, setNegotiationId] = useState<string>("");

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting & ID generation
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi boss! Unsay atoa run?",
          },
        ]);
      }
      if (!negotiationId) {
        setNegotiationId(crypto.randomUUID());
      }
    }
  }, [isOpen, messages.length, negotiationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          cartContext: {
            items: cart.items,
            totalAmount: totalAmount,
          },
          negotiationId,
        }),
      });

      const data = await response.json();

      // Check for leaked tool calls in content (fallback)
      const content = data.message?.content || "";
      const toolCallRegex = /<function=apply_discount>(.*?)<\/function>/;
      const match = content.match(toolCallRegex);

      if (data.toolCalls || match) {
        let amount = 0;

        if (data.toolCalls) {
          // Handle structured tool call
          const toolCall = data.toolCalls[0];
          if (toolCall.function.name === "apply_discount") {
            const args = JSON.parse(toolCall.function.arguments);
            amount = args.amount;
          }
        } else if (match) {
          // Handle leaked tool call
          try {
            const args = JSON.parse(match[1]);
            amount = args.amount;
          } catch (e) {
            console.error("Failed to parse leaked tool call:", e);
          }
        }

        if (amount > 0) {
          applyDiscount(amount);

          // Clean content if it was a leak
          const cleanContent = content.replace(toolCallRegex, "").trim();
          
          // If there's clean content, show it first
          if (cleanContent) {
             setMessages((prev) => [
              ...prev,
              { role: "assistant", content: cleanContent },
            ]);
          }

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Deal! I've applied a ₱${amount} discount for you. Enjoy your games!`,
            },
          ]);

          // Optional: Close chat after a delay
          setTimeout(() => {
            onClose();
          }, 3000);
          
          setIsLoading(false);
          return;
        }
      } 
      
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message.content },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having a bit of trouble hearing you. Can we try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-funBlue to-blue-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <HiSparkles className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="font-bold text-lg">Negotiate Price</h3>
              <p className="text-xs opacity-90">Talk to our AI Shopkeeper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-funBlue text-white rounded-br-none"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your offer..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-funBlue focus:border-transparent outline-none text-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-funBlue text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiPaperAirplane className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
