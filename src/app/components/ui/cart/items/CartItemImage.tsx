"use client";

import SafeImage from "@/app/components/ui/SafeImage";

interface CartItemImageProps {
  src: string;
  alt: string;
  badge?: React.ReactNode;
}

export default function CartItemImage({ src, alt, badge }: CartItemImageProps) {
  return (
    <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
      <SafeImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="64px"
      />
      {badge && <div className="absolute top-0.5 left-0.5 z-10">{badge}</div>}
    </div>
  );
}
