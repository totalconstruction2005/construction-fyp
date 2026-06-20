// components/AboutSection.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import img1 from "@assets/img1.jpg";
import img2 from "@assets/img4.jpg";

const AboutSection: React.FC = () => {
  const features = [
    "Quality Construction",
    "On-time Delivery",
    "Client Satisfaction",
  ];

  return (
    <section id="about" className="py-7 sm:py-15 bg-white">
  <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
      {/* LEFT SIDE - IMAGE */}
      <div className="relative flex justify-center lg:justify-start">
        <div className="w-10/12 sm:w-3/5 lg:w-[85%] rounded-3xl shadow-lg relative">
          <img
            src={img1}
            alt="Construction image1"
            className="w-full h-auto object-cover rounded-3xl"
            loading="lazy"
          />
          <div
            className="absolute -bottom-[10%] -right-[10%] w-28 sm:w-36 lg:w-36 rounded-2xl overflow-hidden"
            style={{
              boxShadow:
                "inset 0 0 20px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={img2}
              alt="Construction image2"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - TEXT */}
      <div className="w-[85%] sm:w-[85%] mx-auto sm:text-center lg:text-left ">
        <p className="text-sm mt-3 sm:mt-0 font-semibold uppercase text-teal-900 tracking-wider mb-2">
          About Us
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800  mb-2 sm:mb-4">
          Building Excellence With Integrity & Passion
        </h2>
        <p className="text-gray-600 mb-3 sm:mb-4 text-sm  sm:text-sm leading-relaxed">
          We’re a trusted construction partner providing quality-driven
          solutions across residential, commercial, and industrial projects.
          With years of experience, our team ensures every build reflects
          craftsmanship and lasting value.
        </p>

        {/* Features Column */}
        <div className="relative">
          <div className="flex flex-col lg:block">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex lg:flex-row items-center mb-1 sm:mb-3 relative lg:pl-8"
              >
                {/* Tick Circle */}
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-xs bg-teal-950 rounded-full flex items-center justify-center z-10">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-white text-xs sm:text-sm"
                  />
                </div>

                {/* Feature Text */}
                <span className="ml-4 text-gray-600 text-sm sm:text-base lg:text-sm">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

export default AboutSection;
