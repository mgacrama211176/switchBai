import React from "react";
import { Game } from "@/app/types/games";
import { COMPARE_CONSTANTS } from "../utils/constants";

// Helper function to render detail fields consistently
export const renderDetailField = (label: string, content: React.ReactNode) => {
  return (
    <div>
      <h4 className={COMPARE_CONSTANTS.DETAIL_LABEL_CLASSES}>{label}</h4>
      {content}
    </div>
  );
};

// Helper function to render action buttons
export const renderActionButton = (
  game: Game,
  isInCart: boolean,
  disabled: boolean,
  onClick: () => void,
  buttonText: string,
) => {
  if (disabled) {
    return (
      <button
        disabled
        className={`${COMPARE_CONSTANTS.BUTTON_BASE_CLASSES} bg-gray-200 text-gray-500 cursor-not-allowed`}
      >
        {buttonText}
      </button>
    );
  }

  if (isInCart) {
    return (
      <button
        onClick={onClick}
        className={`${COMPARE_CONSTANTS.BUTTON_BASE_CLASSES} bg-gradient-to-r from-green-500 to-emerald-600 text-white`}
      >
        ✓ Added to Cart
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${COMPARE_CONSTANTS.BUTTON_BASE_CLASSES} bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600`}
    >
      {buttonText}
    </button>
  );
};
