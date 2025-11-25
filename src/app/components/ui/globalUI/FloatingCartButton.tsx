"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { HiShoppingCart } from "react-icons/hi";

export default function FloatingCartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  const handleClick = () => {
    router.push("/cart");
  };

  // Hide on cart page
  if (pathname === "/cart") {
    return null;
  }

  if (itemCount === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-gradient-to-r from-funBlue to-blue-600 text-white rounded-full p-4 sm:p-5 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] group"
      aria-label={`View cart (${itemCount} items)`}
    >
      <div className="relative">
        <HiShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 sm:min-w-[24px] sm:h-6 flex items-center justify-center px-1 sm:px-1.5 animate-pulse">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </div>
    </button>
  );
}
