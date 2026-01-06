"use client";

import React, { useState } from "react";
import { HiThumbUp, HiThumbDown, HiStar } from "react-icons/hi";

interface ChatFeedbackProps {
  messageIndex: number;
  chatId: string;
  onFeedbackSubmitted: () => void;
}

export default function ChatFeedback({
  messageIndex,
  chatId,
  onFeedbackSubmitted,
}: ChatFeedbackProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit() {
    if (helpful === null) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          helpful,
          rating: rating > 0 ? rating : undefined,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="mt-2 text-xs text-gray-500 italic">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-600 mb-2">Was this helpful?</p>
      <div className="flex items-center gap-2">
        {/* Thumbs Up/Down */}
        <button
          onClick={() => setHelpful(true)}
          className={`p-1.5 rounded-lg transition-colors ${
            helpful === true
              ? "bg-green-100 text-green-600"
              : "bg-white text-gray-400 hover:bg-gray-100"
          }`}
        >
          <HiThumbUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => setHelpful(false)}
          className={`p-1.5 rounded-lg transition-colors ${
            helpful === false
              ? "bg-red-100 text-red-600"
              : "bg-white text-gray-400 hover:bg-gray-100"
          }`}
        >
          <HiThumbDown className="w-4 h-4" />
        </button>

        {/* Star Rating (optional) */}
        {helpful !== null && (
          <div className="flex items-center gap-1 ml-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-colors ${
                  star <= rating
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                <HiStar className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

        {/* Comment (optional) */}
        {helpful !== null && (
          <div className="flex-1 ml-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              maxLength={500}
              className="w-full px-2 py-1 text-xs rounded border border-gray-200 focus:border-funBlue focus:ring-1 focus:ring-funBlue outline-none"
            />
          </div>
        )}

        {/* Submit Button */}
        {helpful !== null && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-3 py-1 text-xs bg-funBlue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
