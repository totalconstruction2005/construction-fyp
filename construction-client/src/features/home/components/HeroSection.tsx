import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center text-center text-white py-32 px-7  sm:px-6 lg:px-8 bg-transparent"
    >
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col items-center">
        {/* Experience Tag */}
        <div className="mb-4">
          <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            25+ YEARS OF EXCELLENCE
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl px-4 md:px-8 sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
          Building Your Dreams to Reality
        </h1>

        {/* Subtext */}
        <p className="text-xs sm:text-base md:text-sm text-gray-200 mb-10">
          From custom homes to commercial spaces, Total Construction delivers quality
          construction solutions — on time, on budget, and built to last.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
