import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHelmetSafety, faRulerCombined, faUsers, faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";

const DifferentiatorsSection: React.FC = () => {

  const features = [
    {
      icon: faMapMarkedAlt,
      title: "Local Knowledge",
      desc: "Deep understanding of Austin’s codes, climate, and construction standards.",
    },
    {
      icon: faHelmetSafety,
      title: "Pro Team",
      desc: "Skilled, certified builders and project managers committed to quality.",
    },
    {
      icon: faRulerCombined,
      title: "Smart Designs",
      desc: "Modern layouts and features built for comfort, function, and flow.",
    },
    {
      icon: faUsers,
      title: "Client Focus",
      desc: "Responsive service and communication — your satisfaction is our priority.",
    },
  ];

  return (
     <section id="why-us" className="py-12 sm:py-18 bg-gray-50">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[95%] sm:w-[85%] mx-auto grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          {/* LEFT SIDE - TEXT CONTENT */}
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase text-teal-800 tracking-wider mb-1">
              Why Total Construction
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
              What Sets Us Apart
            </h2>
            <p className="text-gray-600 text-sm  leading-relaxed">
              We’re more than just builders — we’re your trusted local partner.
              From smart design to solid delivery, every detail is handled with
              care, precision, and pride.
            </p>
          </div>

          {/* RIGHT SIDE - FEATURE CARDS */}
          <div className="grid grid-cols-2 gap-0 sm:gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 sm:p-7 text-center sm:text-left"
              >
                <div className="flex items-center justify-center sm:justify-start mb-4">
                  <div className="bg-teal-950 text-lime-300 p-3 rounded-full text-lg">
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                </div>
                <h3 className="text-teal-950 font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;