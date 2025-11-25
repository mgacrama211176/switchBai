"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { HiSparkles } from "react-icons/hi";
import ChatModal from "@/app/components/ui/chat/ChatModal";
import ChatHeader from "@/app/components/ui/chat/ChatHeader";
import ChatMessages from "@/app/components/ui/chat/ChatMessages";
import ChatInput from "@/app/components/ui/chat/ChatInput";
import { Message } from "@/app/components/ui/chat/types";

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
  const [isTyping, setIsTyping] = useState(false);
  const [negotiationId, setNegotiationId] = useState<string>("");

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
    setIsTyping(true);

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
          } else if (toolCall.function.name === "check_loyalty") {
            // Loyalty check is handled server-side, just wait for the response
            // The server will automatically send the AI's follow-up message
            setIsLoading(false);
            setIsTyping(false);
            return;
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
      console.error("Negotiation error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry boss, may problema. Try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <ChatModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white w-full h-full md:h-[600px] md:max-w-md md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <ChatHeader
          title="Negotiate Price"
          subtitle="Talk to bAI"
          icon={
            <HiSparkles className="w-6 h-6 md:w-6 md:h-6 text-yellow-300" />
          }
          onClose={onClose}
          headerColor="from-funBlue to-blue-600"
        />

        <ChatMessages messages={messages} isTyping={isTyping} />

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          placeholder="Type your offer..."
          disabled={isLoading}
          buttonColor="bg-funBlue hover:bg-blue-600"
        />
      </div>
    </ChatModal>
  );
}
