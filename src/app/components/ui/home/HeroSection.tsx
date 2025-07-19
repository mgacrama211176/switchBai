import React from "react";
import Image from "next/image";

type Props = {};

const HeroSection = (props: Props) => {
  return (
    <div className="h-full w-full">
      <div className="flex flex-col items-center justify-center h-screen ">
        <Image
          src="/heroImage.png"
          alt="switchBai Logo"
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-full bg-black/50 backdrop-blur-sm" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
};

export default HeroSection;
