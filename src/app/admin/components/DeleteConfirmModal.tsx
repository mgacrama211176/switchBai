"use client";

import { useState } from "react";
import { Game } from "@/app/types/games";
import Image from "next/image";
import { HiExclamationCircle } from "react-icons/hi";
import Toast from "./Toast";

interface DeleteConfirmModalProps {
  game: Game;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({
  game,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/games/${game.gameBarcode}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setToast({
          message: data.error || "Failed to delete game",
          type: "error",
        });
        setIsDeleting(false);
      }
    } catch (error) {
      setToast({ message: "An error occurred", type: "error" });
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-3 rounded-xl bg-lameRed/10">
              <HiExclamationCircle className="w-8 h-8 text-lameRed" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Delete Game</h2>
              <p className="text-sm text-gray-600 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this game?
          </p>

          {/* Game Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
              <Image
                src={game.gameImageURL}
                alt={game.gameTitle}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{game.gameTitle}</p>
              <p className="text-sm text-gray-600">
                Barcode: {game.gameBarcode}
              </p>
              <p className="text-sm text-gray-600">
                Stock: {game.gameAvailableStocks} units
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-3 rounded-xl bg-lameRed text-white font-semibold hover:bg-lameRed/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Game"}
          </button>
        </div>
      </div>
    </div>
  );
}
