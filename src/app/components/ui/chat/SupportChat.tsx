"use client";

import React, { useState, useEffect } from "react";
import { HiChatAlt2 } from "react-icons/hi";
import ChatModal from "@/app/components/ui/chat/ChatModal";
import ChatHeader from "@/app/components/ui/chat/ChatHeader";
import ChatMessages from "@/app/components/ui/chat/ChatMessages";
import ChatInput from "@/app/components/ui/chat/ChatInput";
import { Message } from "@/app/components/ui/chat/types";

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportChat({ isOpen, onClose }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string>("");
  const [showFeedbackFor, setShowFeedbackFor] = useState<number | null>(null);
  const [conversationEnded, setConversationEnded] = useState(false);

  // Initial greeting & ID generation
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Hi! How can I help you today?",
          },
        ]);
      }
      if (!chatId) {
        setChatId(crypto.randomUUID());
      }
    }
  }, [isOpen, messages.length, chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          chatId,
        }),
      });

      const data = await response.json();

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message.content },
        ]);

        // Handle conversation end
        if (data.conversationEnded) {
          setConversationEnded(true);
          setShowFeedbackFor(null); // Hide per-message feedback, show end feedback
        }
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I'm having trouble right now. Please try again later.",
          },
        ]);
      }
    } catch (error) {
      console.error("Support chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error. Please try again.",
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
          title="Support"
          subtitle="We're here to help"
          icon={<HiChatAlt2 className="w-6 h-6 md:w-6 md:h-6 text-white" />}
          onClose={onClose}
          headerColor="from-green-500 to-emerald-600"
        />

        <ChatMessages
          messages={messages}
          isTyping={isTyping}
          onFeedbackRequested={setShowFeedbackFor}
          showFeedbackFor={showFeedbackFor}
          chatId={chatId}
          conversationEnded={conversationEnded}
        />

        <ChatInput
          value={input}
          onChange={(value) => {
            setInput(value);
            // Hide feedback if user starts typing
            if (showFeedbackFor !== null) {
              setShowFeedbackFor(null);
            }
          }}
          onSubmit={handleSendMessage}
          placeholder="Ask us anything..."
          disabled={isLoading || conversationEnded}
          buttonColor="bg-green-500 hover:bg-emerald-600"
        />
      </div>
    </ChatModal>
  );
}
