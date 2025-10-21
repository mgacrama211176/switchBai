"use client";

import { Game } from "@/app/types/games";
import GameForm from "./GameForm";
import { HiX } from "react-icons/hi";

interface EditGameModalProps {
  game: Game;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGameModal({
  game,
  onClose,
  onSuccess,
}: EditGameModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Game</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-300"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <GameForm
            mode="edit"
            initialData={game}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
