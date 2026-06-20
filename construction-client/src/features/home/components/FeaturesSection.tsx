import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCertificate,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "On Time",
      description:
        "We respect your time with planning and predictable project timelines.",
      icon: faClock,
    },
    {
      title: "PEC Registered Construction Company",
      description:
        "We maintain the highest standards through PES registration.",
      icon: faCertificate,
    },
    {
      title: "Quality Materials",
      description:
        "We use trusted brands and durable materials built to last.",
      icon: faWrench,
    },
  ];

  return (
    <section className="flex justify-center py-8 sm:py-8 md:py-12 bg-transparent">
      <div className="w-[85%] sm:w-[85%] md:w-[85%] lg:w-[80%] bg-white rounded-2xl sm:rounded-3xl shadow-lg px-10 sm:px-6 md:px-10 py-6 sm:py-3 md:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-2 sm:space-y-3"
            >
              {/* ✅ Circle Icon */}
              <div className="bg-[#043B37] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full mb-1 sm:mb-2">
                <FontAwesomeIcon
                  icon={feature.icon}
                  className="text-lime-300 text-base sm:text-xl"
                />
              </div>

              {/* ✅ Title */}
              <h3 className="text-base sm:text-lg font-semibold text-[#043B37] mb-1">
                {feature.title}
              </h3>

              {/* ✅ Description */}
              <p className="text-gray-600 text-sm sm:text-[13px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
