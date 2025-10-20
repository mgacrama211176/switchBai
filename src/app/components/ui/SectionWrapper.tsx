import React from "react";

interface SectionWrapperProps {
  children: React.ReactNode;
  variant?: "light" | "dark" | "gradient" | "white";
  className?: string;
  id?: string;
}

export function SectionWrapper({
  children,
  variant = "light",
  className = "",
  id,
}: SectionWrapperProps) {
  const variantClasses = {
    light: "bg-gray-50",
    dark: "bg-neutral",
    gradient: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
    white: "bg-white",
  };

  const variantBackgrounds = {
    light: (
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-transparent to-blue-50 transform skew-x-12 origin-top-right" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-t from-transparent via-red-50 to-transparent transform -skew-x-6 origin-bottom-left" />
      </div>
    ),
    dark: (
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-funBlue/10 to-transparent transform skew-x-12 origin-top-left" />
        <div className="absolute bottom-0 right-0 w-1/4 h-2/3 bg-gradient-to-l from-lameRed/10 to-transparent transform -skew-x-6 origin-bottom-right" />
      </div>
    ),
    gradient: (
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-2/3 h-3/4 bg-gradient-to-bl from-blue-100/60 to-transparent transform skew-x-6 origin-top-right" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-red-100/60 to-transparent transform -skew-x-12 origin-bottom-left" />
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-gradient-to-br from-purple-100/40 to-transparent transform rotate-45 rounded-full" />
      </div>
    ),
    white: null,
  };

  return (
    <section
      id={id}
      className={`py-20 ${variantClasses[variant]} relative overflow-hidden w-full ${className}`}
    >
      {variantBackgrounds[variant]}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
