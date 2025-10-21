"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { siteConfig } from "@/config/site";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const subjects = [
    "General",
    "Rental Questions",
    "Purchase Inquiry",
    "Trade/Sell Games",
    "Technical Support",
    "Other",
  ];

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

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }
    if (!formData.subject) {
      return "Please select a subject";
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      return "Message must be at least 10 characters long";
    }
    if (formData.message.length > 500) {
      return "Message must be less than 500 characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "General",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-6xl font-black text-gray-900 mb-4">
            Get in <span className="text-funBlue">Touch</span>
          </h1>
          <p className="text-xl text-gray-600">
            Have questions? We're here to help with your Nintendo Switch needs.
          </p>
        </div>
      </section>

      {/* Main Content Section - Two Column Layout */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* LEFT: Contact Form (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-gray-600 mb-6">
                  Fill out the form and we'll respond within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300"
                    >
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.message.length}/500 characters
                    </div>
                  </div>

                  {submitStatus === "success" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-green-800 font-semibold">
                        ✅ Thanks for reaching out! We'll get back to you within
                        24 hours.
                      </p>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 font-semibold">
                        ❌ Oops! Something went wrong. Please try emailing us
                        directly at{" "}
                        <a
                          href={`mailto:${siteConfig.contact.email}`}
                          className="underline hover:no-underline"
                        >
                          {siteConfig.contact.email}
                        </a>
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isSubmitting
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending Message...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT: Contact Info Sidebar (1/3 width) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Office Hours Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border transform rotate-1 hover:rotate-0 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🕒</span>
                  <h3 className="text-lg font-bold text-gray-900">
                    Office Hours
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mon-Fri</span>
                    <span className="font-semibold">
                      {siteConfig.officeHours.weekday}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold">
                      {siteConfig.officeHours.saturday}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold">
                      {siteConfig.officeHours.sunday}
                    </span>
                  </div>
                </div>

                {/* Availability Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                  <span className="text-xs font-bold text-green-700">
                    ✓ 24-hour response time
                  </span>
                </div>
              </div>

              {/* Direct Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border transform -rotate-1 hover:rotate-0 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📞</span>
                  <h3 className="text-lg font-bold text-gray-900">
                    Direct Contact
                  </h3>
                </div>

                <div className="space-y-3">
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="block group"
                  >
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="text-sm font-semibold text-funBlue group-hover:underline">
                      {siteConfig.contact.email}
                    </div>
                  </a>

                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="block group"
                  >
                    <div className="text-xs text-gray-500 mb-1">Phone</div>
                    <div className="text-sm font-semibold text-funBlue group-hover:underline">
                      {siteConfig.contact.phoneDisplay}
                    </div>
                  </a>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {siteConfig.contact.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links (Compact) */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💬</span>
                  <h3 className="text-lg font-bold text-gray-900">Follow Us</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {siteConfig.social.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.color} text-white p-2 rounded-lg hover:scale-110 transition-all duration-300`}
                      aria-label={social.name}
                    >
                      <span className="text-xl">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Help Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Need Quick Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Check out our About page for common questions and more
                  information about our services.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-funBlue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm"
                >
                  Learn More
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ContactPage;
