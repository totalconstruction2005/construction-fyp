import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHammer } from "@fortawesome/free-solid-svg-icons";
import img2 from "@assets/img2.jpg";
import img3 from "@assets/img3.jpg";
import img5 from "@assets/img5.jpg";

const ServicesSection: React.FC = () => {
  const services = [
    {
      title: "Construction Cost Estimate",
      description:
        "Get accurate cost estimates for your construction project with detailed breakdowns.",
      buttonText: "ENQUIRE NOW",
      link: "/estimator",
      img: img2,
    },
    {
      title: "Design Studio",
      description:
        "Visualize your dream project in 3D with our advanced design studio tools.",
      buttonText: "ENQUIRE NOW",
      link: "/design-studio",
      img: img3,
    },
    {
      title: "Construct Your House",
      description:
        "Start your construction journey by booking your project with our expert team.",
      buttonText: "ENQUIRE NOW",
      link: "/construct-your-house",
      img: img5,
    },
  ];

  return (
    <section id="services" className="py-7 sm:py-15 bg-gray-50">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[95%] sm:w-[85%] mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase text-teal-900 tracking-wider mb-2">
            WHAT WE DO
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-5 sm:mb-12 w-full sm:w-[80%] md:w-[70%] lg:w-[50%] mx-auto leading-snug">
            Our Full-Spectrum Construction Services
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-10 md:gap-7">
            {services.map((service, index) => (
              <div
                key={index}
                className="relative group flex flex-col items-center mb-24 sm:mb-36 md:mb-40"
              >
                {/* Image */}
                <div
                  className="w-full h-[15rem] sm:h-[18rem] overflow-hidden rounded-xl shadow-lg flex-shrink-0"
                  style={{
                    borderBottomLeftRadius: "50% 8%",
                    borderBottomRightRadius: "50% 8%",
                  }}
                >
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    style={{
                      borderBottomLeftRadius: "50% 8%",
                      borderBottomRightRadius: "50% 8%",
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Floating Card */}
                <div className="absolute left-1/2 -bottom-24 sm:-bottom-40 transform -translate-x-1/2 w-[85%] sm:w-[80%] bg-white rounded-xl shadow-xl p-4 sm:p-6 z-10 flex flex-col justify-between h-[12rem] sm:h-[14rem] lg:h-[15rem]">
                  <div className="flex flex-col items-center text-center">
                    <FontAwesomeIcon
                      icon={faHammer}
                      className="text-teal-900 text-2xl sm:text-3xl mb-2"
                    />
                    <h3 className="text-base sm:text-lg font-semibold text-teal-900 mb-1">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-xs leading-relaxed mb-1">
                      {service.description}
                    </p>
                  </div>
                  <Link
                    to={service.link}
                    className="text-teal-800 cursor-pointer text-xs sm:text-sm font-semibold underline hover:text-teal-950 transition"
                  >
                    {service.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default ServicesSection;
