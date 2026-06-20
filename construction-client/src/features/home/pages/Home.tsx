import React from "react";
import { MyNavbar } from "@layouts";
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  ServicesSection,
  ProjectsSection,
  DifferentiatorsSection,
  TrustedSection,
} from "../components";
import { Testimonials } from "@shared/components";
import { Footer, FooterBanner } from "@layouts";
import heroImg from "@assets/hero-img.jpg";

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ Hero Background Image */}
      <div
        className="absolute inset-0 h-[420px] sm:h-[520px] md:h-[560px]"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottomLeftRadius: "50% 7%",
          borderBottomRightRadius: "50% 7%",
        }}
      ></div>

      {/* ✅ Green Overlay */}
      <div
        className="absolute inset-0 h-[420px] sm:h-[520px] md:h-[560px] bg-teal-950/70"
        style={{
          borderBottomLeftRadius: "50% 7%",
          borderBottomRightRadius: "50% 7%",
        }}
      ></div>

      {/* ✅ Transparent Navbar over Hero */}
      <MyNavbar transparent />

      {/* ✅ Hero + Overlapping Features Section */}
      <main className="relative z-10 px-4 sm:px-7 md:px-10 lg:px-16">
        <HeroSection />

        {/* ✨ Overlapping Feature Section */}
        <div className="-mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 relative z-20">
          <FeaturesSection />
        </div>

        <AboutSection />
         </main>
        <ServicesSection />
        <ProjectsSection />
        <Testimonials />
        <TrustedSection />
      <DifferentiatorsSection />
      <FooterBanner/>
      <Footer />
    </div>
  );
};

export default Home;
