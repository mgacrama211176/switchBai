import React from "react";

interface GameCardSkeletonProps {
  count?: number;
}

const GameCardSkeleton: React.FC<GameCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`skeleton-${index}`}
          className="game-card shadow-lg relative flex-shrink-0 w-48 md:w-52 bg-white rounded-2xl overflow-hidden animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="w-full h-full bg-gray-300"></div>
          </div>

          {/* Content Skeleton */}
          <div className="p-3 space-y-2">
            {/* Title Skeleton */}
            <div className="h-8 flex items-start">
              <div className="w-full space-y-2">
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>

            {/* Platform Skeleton */}
            <div className="flex justify-center">
              <div className="h-6 bg-gray-300 rounded-full w-24"></div>
            </div>

            {/* Pricing Skeleton */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-gray-300 rounded w-20"></div>
                <div className="text-right space-y-1">
                  <div className="h-3 bg-gray-300 rounded w-12"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="h-2 bg-gray-300 rounded w-24"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2 pt-1">
              <div className="flex-1 h-10 bg-gray-300 rounded-xl"></div>
              <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
};

export default GameCardSkeleton;
