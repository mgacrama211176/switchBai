import React from "react";

type Props = {};

const RadialBackground = (props: Props) => {
  return (
    <div className="absolute inset-0 animate-float opacity-90">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff4554]/30 via-transparent to-[#00c3e3]/30 blur-3xl" />
    </div>
  );
};

export default RadialBackground;
