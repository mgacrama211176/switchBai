"use client";

import React from "react";

const AboutUsSection = () => {
  const handleLearnMore = () => {
    // TODO: Navigate to /about
    console.log("Navigate to /about");
  };

  const stats = [
    {
      number: "500+",
      label: "Nintendo Switch Games",
      description: "Carefully curated collection",
    },
    {
      number: "10k+",
      label: "Happy Customers",
      description: "Trusted by gamers nationwide",
    },
    {
      number: "98%",
      label: "Customer Satisfaction",
      description: "Quality guaranteed service",
    },
    {
      number: "24/7",
      label: "Customer Support",
      description: "Always here to help",
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden w-full">
      {/* Diagonal Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-transparent to-blue-50   transform skew-x-12 origin-top-right" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-t from-transparent via-red-50  to-transparent transform -skew-x-6 origin-bottom-left"></div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-50"></div>

      <div className="w-full max-w-full px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Main Content - Staggered Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20 max-w-7xl mx-auto">
          {/* Left Content - Offset */}
          <div className="lg:pl-8">
            <div className="inline-block bg-funBlue text-white px-4 py-2 rounded-full text-sm font-bold mb-6 transform -rotate-2">
              🎮 About SwitchBai
            </div>

            <h2 className="text-5xl font-black text-neutral leading-tight mb-6">
              Your Trusted
              <br />
              <span className="text-lameRed">Nintendo Switch</span>
              <br />
              Game Partner
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                At SwitchBai, we're passionate gamers who understand the thrill
                of discovering your next favorite Nintendo Switch game without
                breaking the bank.
              </p>

              <p>
                Founded by gaming enthusiasts, we've built a trusted marketplace
                where quality meets affordability. Every game in our collection
                is carefully tested and verified to ensure you get the best
                gaming experience.
              </p>
            </div>

            {/* Unique Value Props - Stacked */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl transform rotate-1">
                <div className="w-12 h-12 bg-funBlue rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-neutral mb-1">
                    Quality Guaranteed
                  </h3>
                  <p className="text-sm text-gray-600">
                    Every game is tested and verified before listing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl transform -rotate-1">
                <div className="w-12 h-12 bg-lameRed rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">💰</span>
                </div>
                <div>
                  <h3 className="font-bold text-neutral mb-1">Best Prices</h3>
                  <p className="text-sm text-gray-600">
                    Up to 30% savings compared to retail prices
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl transform rotate-1">
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-neutral mb-1">
                    Fast & Reliable
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quick delivery and responsive customer service
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Stats Cards */}
          <div className="relative px-8">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                    index === 0
                      ? "transform -rotate-3 hover:rotate-0"
                      : index === 1
                        ? "transform rotate-2 hover:rotate-0 mt-8"
                        : index === 2
                          ? "transform rotate-3 hover:rotate-0 -mt-4"
                          : "transform -rotate-2 hover:rotate-0 mt-6"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-black text-funBlue mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm font-bold text-neutral mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 right-0 lg:right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>

            <div className="absolute -bottom-6 left-0 lg:left-4 w-20 h-20 bg-funBlue rounded-full flex items-center justify-center transform -rotate-12 shadow-lg">
              <span className="text-white font-bold text-sm">
                Since
                <br />
                2023
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section - Centered with Unique Design */}
        <div className="text-center relative max-w-4xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl font-black text-gray-400 transform rotate-12">
              SwitchBai
            </div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-neutral mb-4">
              Ready to Learn More About Our Story?
            </h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Discover how we became the Philippines' most trusted second-hand
              Nintendo Switch game marketplace.
            </p>

            {/* Unique CTA Button Design */}
            <div className="relative inline-block">
              <button
                onClick={handleLearnMore}
                className="group relative bg-neutral hover:bg-gray-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 transform hover:rotate-1"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>Learn More About Us</span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </span>
              </button>

              {/* Button decorations */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-lameRed rounded-full"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-funBlue rounded-full"></div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Join thousands of satisfied customers •
              <span className="text-funBlue font-semibold">
                {" "}
                Trusted since 2023
              </span>{" "}
              •
              <span className="text-lameRed font-semibold">
                {" "}
                Quality guaranteed
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
