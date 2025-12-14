"use client";

import {
  Menu,
  X,
  Check,
  ChevronDown,
  Sparkles,
  FolderPlus,
  Compass,
  MessagesSquare,
  BarChart,
  Code,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";

import ScrollVelocity from "@/components/landing/ScrollVelocity";

import dynamic from "next/dynamic";
import {
  benefitsData,
  comparisionData,
  efficiencyData,
  faqData,
} from "@/data/landing";
import { landingApi } from "@/lib/api/landing";
import DotGrid from "@/components/landing/DotGrid";
import Image from "next/image";
import SpotlightCard from "@/components/landing/SpotlightCard";

import Link from "next/link";
import { redirect } from "next/navigation";

const InteractiveHoverButtonClient = dynamic(
  () =>
    import("@/components/magicui/interactive-hover-button").then((mod) => ({
      default: mod.InteractiveHoverButton,
    })),
  { ssr: false }
);

const FooterClientOnly = dynamic(
  () => import("@/components/landing/FooterClientOnly"),
  { ssr: false }
);

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  redirect("/auth/signin");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen  bg-[#F8F9FA]  font-poppins">
      {/* Sticky Glass Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50  bg-gradient-to-b from-white via-white to-transparent">
        <div className="max-w-7xl mx-auto pl-10 pr-10 sm:pr-20">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Show UI */}
            <div className="text-white/80 text-sm font-medium flex items-center space-x-2">
              <Image
                src="/logo-dark.png"
                alt="logo"
                width={150}
                height={150}
                // className="w-10 h-10"
              />
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-12">
              <a
                href="#"
                className="text-[#222] hover:text-black/70 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Home
              </a>

              <a
                href="#"
                className="text-[#222] hover:text-black/70 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("features-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Features
              </a>
              <a
                href="#"
                className="text-[#222] hover:text-black/70 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("benefits-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Benefits
              </a>

              <Link
                href="/docs"
                className="text-[#222] hover:text-black/70 transition-colors font-medium"
              >
                Docs
              </Link>
            </div>

            {/* Right side - Desktop Join Button & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Desktop Join Button - Hidden on mobile */}
              <Button
                className="hidden sm:block bg-[#222] hover:bg-white hover:border border-black hover:text-black text-white text-sm font-normal p-2.5 px-5 h-11 rounded-full"
                onClick={() => {
                  const el = document.getElementById("subscribe-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Join Waitlist
              </Button>

              {/* Mobile Menu Button - Only visible on mobile */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-black transition-colors p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slides down when open */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className=" bg-white ">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <a
                href="#"
                className="block text-[#222]  transition-colors font-medium py-2"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Home
              </a>
              <a
                href="#"
                className="block text-[#222] transition-colors font-medium py-2"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  e.preventDefault();
                  const el = document.getElementById("benefits-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Benefits
              </a>
              <a
                href="#"
                className="block text-[#222] transition-colors font-medium py-2"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  e.preventDefault();
                  const el = document.getElementById("features-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Features
              </a>

              <Link
                href="/docs"
                className="block text-[#222] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </Link>

              <a
                href="#"
                className="block text-[#222] transition-colors font-medium py-2"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  e.preventDefault();
                  const el = document.getElementById("faq-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                FAQ&apos;S
              </a>

              {/* Mobile Join Button */}
              <div className="pt-4">
                <Button
                  className="w-full bg-[#222]  text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById("subscribe-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  JOIN NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="min-h-screen">
        {/* main hero section */}
        <section className="relative h-[100vh] w-full overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0">
            <DotGrid
              dotSize={10}
              gap={15}
              baseColor="#f3f3f3"
              activeColor="#2222"
              proximity={120}
              shockRadius={250}
              shockStrength={5}
              resistance={750}
              returnDuration={1.5}
            />
          </div>
          {/* <div className="absolute bottom-0 w-full h-24 rounded-full bg-black blur-2xl  z-10" /> */}
          {/* Hero Section as children of Aurora */}
          <section className="w-full flex-col flex items-center text-center justify-center px-4 sm:px-6 lg:px-8 h-full max-w-4xl mx-auto">
            {/* Subtitle */}
            <div className="border-t border-[#222]/30 z-10 flex items-center gap-2 drop-shadow-md rounded-full px-4 py-2 w-fit bg-white mb-4">
              <Sparkles className="w-4 h-4" />
              <p className="text-[#222] text-[12px] font-normal font-inter tracking-wider uppercase">
                API BUILDING AI TOOL
              </p>
            </div>

            <h1 className="text-4xl sm:text-6xl z-10 mb-4 leading-tight font-semibold  text-[#222]">
              &quot;Build Powerful API&apos;s in minutes&quot;
            </h1>

            <p className="text-[#666] font-inter z-10 text-[12px] sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
              Launch your API in minutes. Connect databases, third‑party apps,
              AI integrations, without writing a line of code.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row z-10 items-center justify-center gap-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <InteractiveHoverButtonClient
                  // className=" bg-white z-50 hover:bg-[#666] hover:text-white text-black text-sm font-normal p-2.5 px-5 h-11 rounded-full border border-[#222]/30"
                  className="py-2"
                  onClick={() => {
                    const el = document.getElementById("subscribe-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Join Waitlist
                </InteractiveHoverButtonClient>
              </motion.div>
            </div>
          </section>
        </section>
        {/* Features */}
        <div className="bg-[#F8F9FA] text-[#222] min-h-screen font-sans ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 relative">
              {/* Left Column: Sticky Content */}
              <div className="lg:w-1/2 sm:h-screen  sm:sticky top-0 flex items-center">
                <div className="max-w-xl h-full flex flex-col justify-start items-start  py-24">
                  {/* AI-DRIVEN EFFICIENCY Tag */}

                  <div className="border border-black/10 z-10 flex items-center gap-2 drop-shadow-md rounded-full px-4 py-2 w-fit bg-white mb-4">
                    <Sparkles className="w-4 h-4" />
                    <p className="text-[#222] text-[10px] font-normal font-inter tracking-wider uppercase">
                      AI-DRIVEN EFFICIENCY
                    </p>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-[#222] mb-6 tracking-tight">
                    Build API&lsquo;s visually and deploy them
                  </h1>

                  {/* Sub-text */}
                  <p className="text-[#666] text-sm  max-w-lg mb-4 leading-relaxed">
                    here’s how you can create powerful, production-ready APIs,
                    without writing a single line of code.
                  </p>

                  {/* Feature Pills */}
                  <div className="space-y-1 flex flex-col gap-2">
                    <div className="bg-white inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-medium text-gray-600">
                        Built with team logic
                      </span>
                    </div>
                    <div className="bg-white inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200">
                      <Code className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-medium text-gray-600">
                        Custom Logic Nodes
                      </span>
                    </div>
                    <div className="bg-white inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200">
                      <BarChart className="w-4 h-4 text-gray-600" />
                      <span className="text-[10px] font-medium text-gray-600">
                        Insights without setup
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scrolling Cards */}
              <div className="lg:w-1/2">
                <div className="space-y-8 py-12 sm:py-32 max-w-lg">
                  {/* Card 1: Design Your API Visually */}
                  {efficiencyData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="bg-white rounded-lg p-4 min-h-[15vh] flex flex-col justify-center  border border-black/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`bg-${item.color}-100 p-3 rounded-lg`}>
                          <item.icon
                            className={`w-6 h-6 text-${item.color}-500  `}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#222] mb-2">
                            {item.title}
                          </h3>
                          <p className="text-[#666] text-sm leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div className=" h-5 sm:h-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* BENEFITS" */}
        <section
          id="benefits-section"
          className="w-full min-h-screen bg-[#F8F9FA]  relative flex flex-col items-center overflow-hidden justify-start"
        >
          <div className="border-t border-[#222]/30 z-10 flex items-center gap-2 drop-shadow-md rounded-full px-4 py-2 w-fit bg-white mb-4">
            <FolderPlus className="w-4 h-4" />
            <p className="text-[#222] text-[12px] font-normal font-inter tracking-wider uppercase">
              BENEFITS
            </p>
          </div>
          <h1 className="text-4xl sm:text-6xl  mb-4 leading-tight  font-semibold  text-[#222]">
            Why Choose Us?
          </h1>

          <p className="text-[#666] font-inter  text-[12px] sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed px-5">
            Innovative tools and powerful insights designed to elevate your
            business
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-10 mb-12">
            {benefitsData.map((item, index) => {
              return (
                <SpotlightCard
                  className="relative w-full  p-6 rounded-xl bg-white"
                  key={index}
                  spotlightColor={
                    item.color as `rgba(${number}, ${number}, ${number}, ${number})`
                  }
                >
                  <div className="relative flex items-center justify-center bg-gray-100/30 p-2 backdrop-blur-lg rounded-lg mb-10 w-fit">
                    <item.icon
                      className="w-6 h-6 sm:w-6 sm:h-6"
                      style={{ color: item.color.replace("0.5)", "1)") }}
                    />
                  </div>

                  <div className="font-semibold text-start text-[#222] text-lg sm:text-lg mb-2">
                    {item.title}
                  </div>

                  <div className="text-[13px] sm:text-[15px] text-[#666] text-start leading-relaxed mb-2 ">
                    {item.content}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

          <ScrollVelocity
            textsLine1={[
              "Faster Development",
              "Natural Language Input",
              "Higher Productivity",
              "Smarter Decisions",
              "Better Integration",
            ]}
            textsLine2={[
              "AI Assistance",
              "Error Reduction",
              "Quick Iteration",
              "Low Learning Curve",
              "Rapid Prototyping",
            ]}
          />
        </section>
        {/* Comparision" */}
        <section
          id="features-section"
          className="w-full min-h-screen bg-[#F8F9FA]  py-16 relative flex flex-col items-center justify-start"
        >
          <div className="border-t border-[#222]/30 z-10 flex items-center gap-2 drop-shadow-md rounded-full px-4 py-2 w-fit bg-white mb-4">
            <Compass className="w-4 h-4" />
            <p className="text-[#222] text-[12px] font-normal font-inter tracking-wider uppercase">
              COMPARISON
            </p>
          </div>
          <h1 className="text-4xl w-full sm:text-6xl  mb-4 text-center leading-tight font-semibold  text-[#222]">
            Why DotPortion Stands Out
          </h1>

          <p className="text-[#666] font-inter  text-[12px] sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            See how we compare against others in performance, growth
          </p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-12 w-full max-w-5xl z-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-black/80 text-sm font-medium flex items-center space-x-2">
                <Image
                  src="/logo-dark.png"
                  alt="logo"
                  width={150}
                  height={150}
                  // className="w-10 h-10"
                />
              </div>
              <div className="relative w-full z-10 px-4 border bg-white border-black/10 rounded-xl  overflow-hidden">
                {/* Card content */}

                {comparisionData.we.map((item, index) => (
                  <div
                    key={index}
                    className={`text-black flex items-center gap-6 px-4 ${
                      index !== 5 ? "border-b " : ""
                    } border-white/10 pt-4 pb-4`}
                  >
                    <Check className="w-6 h-6 text-green-400" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-white/80 text-sm font-medium flex items-center space-x-2 mb-3">
                <span className="text-black font-semibold text-lg">Others</span>
              </div>
              <div className="relative w-full z-10 px-4 border bg-white border-black/10 rounded-xl overflow-hidden">
                {/* Card content */}

                {comparisionData.others.map((item, index) => (
                  <div
                    key={index}
                    className={`text-black flex items-center gap-6 px-4 ${
                      index !== 5 ? "border-b " : ""
                    } border-white/10 pt-4 pb-4`}
                  >
                    <X className="w-6 h-6 text-red-400" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
        {/* FAQ'S" */}
        <section
          id="faq-section"
          className="w-full min-h-screen bg-[#F8F9FA] py-4 relative flex flex-col items-center justify-start"
        >
          <div className="border-t border-[#222]/30 z-10 flex items-center gap-2 drop-shadow-md rounded-full px-4 py-2 w-fit bg-white mb-4">
            <MessagesSquare className="w-4 h-4" />
            <p className="text-[#222] text-[12px] font-normal font-inter tracking-wider uppercase">
              FAQ&apos;S
            </p>
          </div>
          <h1 className="text-4xl sm:text-6xl  mb-4 max-w-4xl text-center leading-tight  font-semibold  text-[#222]">
            Answers to help you get started faster.
          </h1>

          <p className="text-[#666] font-inter  text-[12px] sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Get answers to your questions and learn about our platform
          </p>
          <div className="max-w-5xl w-full">
            <FAQAccordion />
          </div>
        </section>
        {/* footer */}
        <section
          id="subscribe-section"
          className="w-full  bg-[#F8F9FA]  pt-16 relative flex flex-col items-center justify-start"
        >
          <div className="z-10 max-w-5xl w-full max-h-72 overflow-hidden bg-white px-6 py-16 mb-24 flex sm:flex-row flex-col sm:items-center justify-between rounded-xl">
            <motion.div
              initial={false}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            >
              <h2 className="text-lg z-10 text-black  sm:text-3xl mb-2 leading-tight font-semibold">
                Be among the first to launch
                <br />
                your API
              </h2>
              <p className="text-[#666] z-10 font-inter text-sm mb-6 leading-relaxed">
                Get updates on beta features
              </p>
              <div>
                <SubscribeForm />
              </div>
            </motion.div>
            <div>
              <Image
                src="/market.png"
                alt="logo"
                width={400}
                height={150}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <FooterClientOnly />
        </section>
      </main>
    </div>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 relative overflow-hidden rounded-2xl">
      <div className="relative z-10 flex flex-col gap-4">
        {faqData.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              className={`w-full text-black rounded-xl backdrop-blur-md transition-all duration-200 border border-[#ECBBAA]/10 ${
                isOpen ? "bg-white border-[#DA7756]/30" : "bg-white"
              }`}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: "easeOut" }}
            >
              <button
                className={`w-full flex justify-between items-center p-6 text-left focus:outline-none transition-colors ${
                  isOpen ? "text-black font-semibold" : "text-black"
                }`}
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                suppressHydrationWarning
              >
                <span className="w-full">{item.question}</span>
                <span
                  className={`ml-4 transition-transform ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="w-6 h-6" />
                </span>
              </button>
              <div
                className={`w-full px-6 transition-all duration-300 ease-in-out overflow-hidden`}
                style={{
                  maxHeight: isOpen ? 200 : 0,
                  minHeight: isOpen ? 48 : 0,
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? "auto" : "none",
                }}
              >
                {isOpen && (
                  <div className="pb-5 text-black text-[15px] leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// SubscribeForm component
function SubscribeForm() {
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
      const res = await landingApi.joinWaitList(email);
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
      className="flex flex-col z-10 sm:flex-row items-start gap-4 w-full max-w-xl  mt-4"
    >
      <Input
        type="email"
        placeholder="Your Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={success || submitting}
        className={`flex-1 w-full bg-white border border-[#222] rounded-xl px-4 py-2 h-12 text-[#222] placeholder:text-[#222] focus:ring-2 focus:ring-[#222]/40 focus:border-[#222] ${
          success ? "hidden" : ""
        }`}
        required
        suppressHydrationWarning
      />
      <Button
        type="submit"
        className="bg-[#222] hover:bg-black text-white text-sm font-normal p-2.5 px-5 h-11 rounded-full"
        disabled={success || submitting}
        suppressHydrationWarning
      >
        {success ? "Joined" : submitting ? "Joining..." : "Join Waitlist"}
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
