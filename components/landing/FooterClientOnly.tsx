"use client";
import { motion } from "framer-motion";
import { useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { landingApi } from "@/lib/api/landing";
import {
  // InstagramLogoIcon,
  LinkedInLogoIcon,
  // TwitterLogoIcon,
} from "@radix-ui/react-icons";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function NewsLetterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailSchema = z
    .string()
    .email({ message: "Please enter a valid email address." });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const res = await landingApi.joinNewsLetter(email);

      setSuccess(true);
      setMessage(res.message);
      setError("");
    } catch (err: unknown) {
      let message = "Failed to join newsletter. Please try again.";
      if (typeof err === "object" && err !== null) {
        // Check for AxiosError shape
        if (
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } })
            .response?.data?.message === "string"
        ) {
          message = (err as { response: { data: { message: string } } })
            .response.data.message;
        } else if (
          "message" in err &&
          typeof (err as { message?: string }).message === "string"
        ) {
          message = (err as { message: string }).message;
        }
      }
      setError(message);
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full max-w-xl mx-auto mt-4"
    >
      <Input
        type="email"
        placeholder="Your Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={success || submitting}
        className={`flex-1 w-full bg-white/5 border-none border-[#DA7756] rounded-xl px-4 py-2 h-12 text-white placeholder:text-white/60 focus:ring-2 focus:ring-[#DA7756]/40 focus:border-[#DA7756] ${
          success ? "hidden" : ""
        }`}
        required
      />
      <Button
        type="submit"
        className="hidden sm:block bg-white hover:bg-black text-black text-sm font-normal p-2.5 px-5 h-11 rounded-full"
        disabled={success || submitting}
      >
        {success ? "Joined" : submitting ? "Joining..." : "Join Now"}
      </Button>
      {error && <div className="text-red-400 text-sm mt-2 w-full">{error}</div>}
      {success && (
        <div className="text-green-400 text-sm mt-2 w-full">
          {message || "Joined"}
        </div>
      )}
    </form>
  );
}

export default function FooterClientOnly() {
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <footer className="w-full z-10 py-8 pt-12 px-4 sm:px-8 md:px-16 lg:px-28 bg-black flex flex-col items-start justify-between gap-y-10 lg:gap-y-0">
      <motion.div
        className="flex  flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-20 items-start w-full "
        initial={false}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <div className="space-y-3 min-w-[180px] flex-1">
          <Image
            src="/logo-light.png"
            alt="logo"
            width={300}
            height={150}
            // className="w-10 h-10"
          />
        </div>
        <div className="space-y-2 mt-8 sm:mt-0">
          <p className="text-white font-semibold text-base sm:text-lg">
            Services
          </p>
          <p
            className="text-white/70 hover:text-white cursor-pointer text-sm sm:text-base"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Home
          </p>
          <p
            className="text-white/70 hover:text-white cursor-pointer text-sm sm:text-base"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("benefits-section");
            }}
          >
            Why Us
          </p>
          <p
            className="text-white/70 hover:text-white cursor-pointer text-sm sm:text-base"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("features-section");
            }}
          >
            Comparision
          </p>
          <p
            className="text-white/70 hover:text-white cursor-pointer text-sm sm:text-base"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("faq-section");
            }}
          >
            FAQ&apos;S
          </p>
        </div>
        <motion.div
          className="space-y-4"
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <p className="text-white font-semibold text-base sm:text-lg">
            Follow us on
          </p>

          <div className="flex gap-4">
            {/* <InstagramLogoIcon className="w-6 h-6 text-white/50 hover:text-white transition-colors" /> */}
            <LinkedInLogoIcon
              onClick={() => {
                window.open(
                  "https://www.linkedin.com/company/dotportion/",
                  "_blank"
                );
              }}
              className="w-6 h-6 text-white/50 hover:text-white transition-colors"
            />
            {/* <TwitterLogoIcon className="w-6 h-6 text-white/50 hover:text-white transition-colors" /> */}
          </div>
        </motion.div>
      </motion.div>

      {/* <motion.div
        className="space-y-4 max-w-xl w-full lg:w-[32rem]"
        initial={false}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      >
        <p className="text-lg text-white font-medium">Join our newsletter</p>
        <p className="text-sm text-white/50 max-w-3/4">
          Sign up to our mailing list below and be the first to know about new
          updates. Don&apos;t worry, we hate spam too.
        </p>
        <NewsLetterForm />
      </motion.div> */}
      <div className="w-full border-t border-white/30 my-6"></div>
      <p className="text-white/50 text-sm">
        Copyright © DotPortion. All rights reserved.
      </p>
    </footer>
  );
}
