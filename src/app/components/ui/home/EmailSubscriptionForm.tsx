"use client";

import { useState } from "react";

export default function EmailSubscriptionForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement email subscription logic
    console.log("Email submitted:", email);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-w-0 flex-auto rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#00c3e3] bg-white"
          placeholder="Enter your email"
        />
        <button
          type="submit"
          className="flex-none rounded-lg bg-lameRed px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-lameRed/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lameRed transition-colors"
        >
          Notify me
        </button>
      </div>
      <p className="text-sm text-gray-600">
        We care about your data. Read our{" "}
        <a
          href="#"
          className="font-medium text-funBlue hover:text-funBlue/80 hover:underline"
        >
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
