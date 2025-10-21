"use client";

import React from "react";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { siteConfig } from "@/config/site";

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-2/3 h-3/4 bg-gradient-to-bl from-blue-100/60 to-transparent transform skew-x-6 origin-top-right"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-red-100/60 to-transparent transform -skew-x-12 origin-bottom-left"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                Est. 2023 • Cebu City
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
              We're{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-funBlue to-blue-500">
                SwitchBai
              </span>
            </h1>
            <p className="text-2xl text-gray-600 mb-4 leading-relaxed">
              Your friendly neighborhood Nintendo Switch game source
            </p>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Making Nintendo Switch gaming accessible, affordable, and
              community-driven in Cebu City, Philippines 🇵🇭
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border transform rotate-1 hover:rotate-0 transition-all duration-300">
                <div className="text-3xl font-black text-funBlue mb-2">
                  500+
                </div>
                <div className="text-sm font-bold text-gray-700">
                  Games Available
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border transform -rotate-1 hover:rotate-0 transition-all duration-300">
                <div className="text-3xl font-black text-lameRed mb-2">
                  10k+
                </div>
                <div className="text-sm font-bold text-gray-700">
                  Happy Gamers
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border transform rotate-2 hover:rotate-0 transition-all duration-300">
                <div className="text-3xl font-black text-green-600 mb-2">
                  98%
                </div>
                <div className="text-sm font-bold text-gray-700">
                  Satisfaction
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border transform -rotate-2 hover:rotate-0 transition-all duration-300">
                <div className="text-3xl font-black text-purple-600 mb-2">
                  24/7
                </div>
                <div className="text-sm font-bold text-gray-700">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-transparent to-blue-50 transform skew-x-12 origin-top-right" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block bg-funBlue text-white px-4 py-2 rounded-full text-sm font-bold mb-6 transform -rotate-2">
                📖 OUR STORY
              </div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Started with a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lameRed to-pink-500">
                  Passion
                </span>{" "}
                for Gaming
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">SwitchBai</strong> was born
                  in <strong className="text-funBlue">2023</strong> right here
                  in <strong className="text-lameRed">Cebu City</strong>. As
                  gamers ourselves, we noticed something: amazing Nintendo
                  Switch titles were sitting on shelves, finished but still full
                  of joy to give. Meanwhile, other gamers wanted to experience
                  these same adventures but found retail prices challenging.
                </p>
                <p>
                  That's when it clicked—what if we could create a{" "}
                  <strong className="text-funBlue">community</strong> where
                  gamers could buy quality second-hand games, rent titles
                  they're curious about, and eventually trade with each other?
                </p>
                <p>
                  The name "SwitchBai" combines our love for{" "}
                  <strong className="text-gray-900">Nintendo Switch</strong>{" "}
                  with the friendly Cebuano term{" "}
                  <strong className="text-lameRed">"bai"</strong> (friend). It's
                  our way of saying: we're not just a store—we're your{" "}
                  <strong>gaming buddy</strong>, your trusted friend in the
                  world of Nintendo Switch games.
                </p>
              </div>
            </div>

            {/* Right Content - Values */}
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: "✨",
                  title: "Quality First",
                  desc: "Every game tested",
                },
                {
                  icon: "🤝",
                  title: "Trust & Honesty",
                  desc: "Transparent pricing",
                },
                {
                  icon: "👥",
                  title: "Community",
                  desc: "Gamers helping gamers",
                },
                { icon: "💰", title: "Affordability", desc: "10% savings" },
              ].map((value, index) => (
                <div
                  key={value.title}
                  className={`bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
                    index === 0
                      ? "transform -rotate-2 hover:rotate-0"
                      : index === 1
                        ? "transform rotate-2 hover:rotate-0 mt-8"
                        : index === 2
                          ? "transform rotate-1 hover:rotate-0 -mt-4"
                          : "transform -rotate-1 hover:rotate-0 mt-4"
                  }`}
                >
                  <div className="text-4xl mb-3">{value.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <div className="inline-block bg-lameRed text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform rotate-2">
              🎯 OUR MISSION & VISION
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Building Something{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-funBlue to-indigo-500">
                Special
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-white rounded-3xl p-10 shadow-2xl border transform -rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-funBlue to-blue-500 rounded-full flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Making Nintendo Switch gaming{" "}
                <strong className="text-funBlue">accessible</strong>,{" "}
                <strong className="text-green-600">affordable</strong>, and{" "}
                <strong className="text-lameRed">community-driven</strong>.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe every gamer should have the opportunity to experience
                amazing Nintendo Switch titles without breaking the bank. By
                offering verified second-hand games at fair prices and flexible
                rental options, we're making that possible.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-gradient-to-br from-funBlue to-blue-500 rounded-3xl p-10 shadow-2xl text-white transform rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">🌟</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-xl leading-relaxed mb-6">
                Building the Philippines'{" "}
                <strong>most trusted gaming community</strong>.
              </p>
              <p className="text-blue-50 leading-relaxed">
                We envision a future where SwitchBai is more than just a
                marketplace—it's a thriving community where gamers connect,
                share experiences, and help each other discover amazing games.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform -rotate-2">
              ⚡ HOW IT WORKS
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Simple, Fast, & Reliable
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your hands on quality games has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-funBlue to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
                <span className="text-3xl">🔍</span>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border h-full">
                <div className="text-funBlue font-bold text-sm mb-2">
                  STEP 1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Browse Games
                </h3>
                <p className="text-sm text-gray-600">
                  Explore our real-time inventory
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-gray-300 text-4xl">→</div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
                <span className="text-3xl">🎮</span>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border h-full">
                <div className="text-purple-600 font-bold text-sm mb-2">
                  STEP 2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Choose Option
                </h3>
                <p className="text-sm text-gray-600">Buy or rent, you decide</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-gray-300 text-4xl">→</div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
                <span className="text-3xl">✨</span>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border h-full">
                <div className="text-green-600 font-bold text-sm mb-2">
                  STEP 3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Play & Enjoy
                </h3>
                <p className="text-sm text-gray-600">Quality guaranteed fun!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform rotate-2">
              🎯 OUR SERVICES
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lameRed to-pink-500">
                Adventure
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buy Service */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-funBlue to-blue-500 rounded-full flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Buy Games
              </h3>
              <p className="text-gray-600 mb-6">
                Second-hand games with 10% savings compared to retail
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">
                    Quality tested & verified
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">
                    100% authentic games
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">
                    Real-time inventory
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Fair pricing</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-funBlue to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300">
                Browse Games
              </button>
            </div>

            {/* Rent Service */}
            <div className="bg-gradient-to-br from-lameRed to-pink-500 rounded-3xl p-8 shadow-xl text-white transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-3xl">🏠</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Rent Games</h3>
                <p className="text-pink-50 mb-6">
                  Flexible 1-4 week rentals at affordable rates
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">✓</span>
                    <span className="text-sm text-pink-50">
                      ₱300-₱400 per week
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">✓</span>
                    <span className="text-sm text-pink-50">
                      Easy game swapping
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">✓</span>
                    <span className="text-sm text-pink-50">
                      Try before you buy
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">✓</span>
                    <span className="text-sm text-pink-50">
                      Cebu City service
                    </span>
                  </li>
                </ul>
                <button className="w-full bg-white text-lameRed font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300">
                  Rent Now
                </button>
              </div>
            </div>

            {/* Trade Service (Coming Soon) */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-xl text-white transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🔄</span>
                </div>
                <div className="inline-block bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                  COMING SOON
                </div>
                <h3 className="text-2xl font-bold mb-4">Trade Games</h3>
                <p className="text-gray-300 mb-6">
                  Exchange your completed games with other gamers
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">○</span>
                    <span className="text-sm text-gray-400">
                      Game-to-game trading
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">○</span>
                    <span className="text-sm text-gray-400">
                      Earn trade credits
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">○</span>
                    <span className="text-sm text-gray-400">
                      Connect with gamers
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">○</span>
                    <span className="text-sm text-gray-400">
                      Build your collection
                    </span>
                  </li>
                </ul>
                <button className="w-full bg-gray-700 text-gray-400 font-bold py-3 px-6 rounded-xl cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-4 transform -rotate-2">
              🏆 WHY SWITCHBAI?
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Your Trusted{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Gaming Partner
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "✅",
                title: "Quality Guaranteed",
                desc: "Every game tested and verified before reaching you",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: "💰",
                title: "Best Prices",
                desc: "10% savings compared to retail with transparent pricing",
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: "⚡",
                title: "Real-Time Updates",
                desc: "Live inventory and instant availability checks",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: "🏙️",
                title: "Local & Reliable",
                desc: "Based in Cebu City with quick meetups",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: "👥",
                title: "Community Focus",
                desc: "Gamers helping gamers, building friendships",
                color: "from-red-500 to-pink-500",
              },
              {
                icon: "🔒",
                title: "100% Authentic",
                desc: "No bootlegs, reproductions, or counterfeits ever",
                color: "from-gray-700 to-gray-900",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform duration-300`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-funBlue to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-white/10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-2xl text-blue-50 mb-8 leading-relaxed">
            Come on, bai—let's play! 🎮
          </p>
          <p className="text-lg text-blue-100 mb-12 max-w-2xl mx-auto">
            Whether you're looking to buy your next adventure or rent a game to
            try, we're here to help you experience the best Nintendo Switch has
            to offer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/games"
              className="bg-white text-funBlue font-bold py-4 px-8 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Browse Games
            </a>
            <a
              href="/rent-a-game"
              className="bg-lameRed text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Rent Now
            </a>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-50">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <span>📧</span>
              <span>{siteConfig.contact.email}</span>
            </a>
            <span className="hidden sm:block text-blue-300">•</span>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <span>📱</span>
              <span>{siteConfig.contact.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AboutPage;
