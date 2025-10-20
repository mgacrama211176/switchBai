import React, { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log("Contact form submitted:", formData);
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Us",
      description: "Get in touch via email",
      value: "maruronu@gmail.com",
      action: "mailto:maruronu@gmail.com",
      color: "bg-gradient-to-r from-funBlue to-blue-500",
    },
    {
      icon: "📱",
      title: "Call Us",
      description: "Speak with our team",
      value: "+63 939 681 0206",
      action: "tel:+639396810206",
      color: "bg-gradient-to-r from-success to-green-600",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with us online",
      value: "Available 24/7",
      action: "#",
      color: "bg-gradient-to-r from-lameRed to-pink-500",
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/SwitchTaBai/",
      icon: "📘",
      color: "bg-blue-600",
    },
    {
      name: "Instagram",
      url: "#",
      icon: "📷",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      name: "Twitter",
      url: "#",
      icon: "🐦",
      color: "bg-blue-400",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden w-full">
      {/* Diagonal Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-lameRed/20 to-transparent transform -skew-x-6 origin-bottom-right"></div>
        <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 bg-gradient-to-br from-success/30 to-transparent transform rotate-45 rounded-full"></div>
      </div>

      <div className="w-full  px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 relative w-full max-w-4xl mx-auto">
          {/* Contact Badge */}
          <div className="inline-block bg-funBlue text-white px-4 py-2 rounded-full text-sm font-bold mb-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
            📞 Get In Touch
          </div>

          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight relative">
            Let's Talk About
            <span className=" md:inline text-funBlue transform hover:rotate-1 transition-transform duration-300 inline-block">
              {" "}
              Your Games
            </span>
            {/* Floating decorations around title */}
            <div className="absolute -top-4 right-0 lg:right-8 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg opacity-80 animate-bounce">
              <span className="text-lg">💬</span>
            </div>
            <div className="absolute -bottom-4 left-0 lg:left-8 w-10 h-10 bg-lameRed rounded-full flex items-center justify-center transform -rotate-12 shadow-lg opacity-80">
              <span className="text-white font-bold text-xs">24/7</span>
            </div>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Have questions about our Nintendo Switch games? Need help with your
            order? We're here to help you find the perfect games at the best
            prices.
          </p>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <div
                key={method.title}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1"
              >
                <div
                  className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mb-4 mx-auto transform hover:rotate-12 transition-transform duration-300`}
                >
                  <span className="text-2xl">{method.icon}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {method.description}
                </p>
                <a
                  href={method.action}
                  className="text-funBlue font-semibold hover:text-blue-600 transition-colors duration-200"
                >
                  {method.value}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Form */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 transform hover:rotate-1 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✍️</span>
                Send us a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-funBlue focus:bg-white focus:ring-2 focus:ring-funBlue/20 transition-all duration-300"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-funBlue focus:bg-white focus:ring-2 focus:ring-funBlue/20 transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-funBlue focus:bg-white focus:ring-2 focus:ring-funBlue/20 transition-all duration-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-funBlue focus:bg-white focus:ring-2 focus:ring-funBlue/20 transition-all duration-300 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full bg-gradient-to-r from-funBlue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform hover:rotate-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    Send Message
                    <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>
              </form>
            </div>

            {/* Form decorations */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-funBlue rounded-full transform rotate-45 shadow-lg"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-lameRed rounded-full transform -rotate-12 shadow-lg"></div>
          </div>

          {/* Contact Info & Social */}
          <div className="space-y-8">
            {/* Office Hours */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 transform -rotate-1 hover:rotate-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🕒</span>
                Office Hours
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">
                    Monday - Friday
                  </span>
                  <span className="text-gray-900 font-bold">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Saturday</span>
                  <span className="text-gray-900 font-bold">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Sunday</span>
                  <span className="text-funBlue font-bold">Closed</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      24/7 Online Support
                    </p>
                    <p className="text-gray-600 text-sm">
                      Email and chat available anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 transform rotate-1 hover:rotate-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🌐</span>
                Follow Us
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1"
                  >
                    <div
                      className={`w-12 h-12 ${social.color} rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300`}
                    >
                      <span className="text-xl">{social.icon}</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">
                        {social.name}
                      </p>
                      <p className="text-gray-600 text-sm">Connect with us</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-funBlue/10 to-lameRed/10 rounded-3xl p-8 border border-gray-200 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                Quick Contact
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="text-gray-900 font-semibold">Email Support</p>
                    <p className="text-gray-600 text-sm">maruronu@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-gray-900 font-semibold">WhatsApp</p>
                    <p className="text-gray-600 text-sm">+63 939 681 0206</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorations */}
        <div className="absolute top-1/4 left-0 w-6 h-6 bg-funBlue rounded-full opacity-60 transform rotate-45"></div>
        <div className="absolute bottom-1/4 right-0 w-8 h-8 bg-lameRed rounded-full opacity-60 transform -rotate-12"></div>
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-success rounded-full opacity-60 transform rotate-90"></div>
      </div>
    </section>
  );
};

export default ContactSection;
