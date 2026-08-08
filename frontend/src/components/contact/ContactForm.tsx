"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This is a static front-end: wire this up to your email/API service of choice.
    setSubmitted(true);
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl shadow-brand-blue/10 md:p-8">
      <h2 className="text-[22px] font-bold text-brand-navy">Get In Touch With Us</h2>

      {submitted ? (
        <div className="mt-6 rounded-lg bg-brand-mist p-5 text-[14.5px] text-brand-navy">
          Thanks for reaching out — we&rsquo;ve received your message and will get back to you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="sr-only">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                placeholder="First Name*"
                className="h-12 w-full rounded-lg border border-black/10 bg-brand-mist/60 px-4 text-[14.5px] outline-none transition focus:border-brand-blue focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                className="h-12 w-full rounded-lg border border-black/10 bg-brand-mist/60 px-4 text-[14.5px] outline-none transition focus:border-brand-blue focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contactNo" className="sr-only">
              Contact No
            </label>
            <input
              id="contactNo"
              name="contactNo"
              required
              type="tel"
              placeholder="Contact No*"
              className="h-12 w-full rounded-lg border border-black/10 bg-brand-mist/60 px-4 text-[14.5px] outline-none transition focus:border-brand-blue focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">
              Email Id
            </label>
            <input
              id="email"
              name="email"
              required
              type="email"
              placeholder="Email Id*"
              className="h-12 w-full rounded-lg border border-black/10 bg-brand-mist/60 px-4 text-[14.5px] outline-none transition focus:border-brand-blue focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Message"
              className="w-full resize-none rounded-lg border border-black/10 bg-brand-mist/60 px-4 py-3 text-[14.5px] outline-none transition focus:border-brand-blue focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-darker to-brand-blue px-8 text-[15px] font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:brightness-110"
          >
            Submit
            <Send className="size-4" />
          </button>
        </form>
      )}
    </div>
  );
}
