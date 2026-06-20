import React from "react";
import familyImg from "@assets/family.jpg";

const TrustedSection: React.FC = () => {
  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="max-w-[90rem] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="w-[95%] sm:w-[85%] mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* LEFT SIDE - TEXT */}
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase text-teal-800 tracking-wider mb-1">
              PROVEN & TRUSTED
            </p>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-5 leading-snug">
              Backed by Results,<br />Built on Relationships
            </h2>

            <p className="text-gray-600 text-[0.75rem] sm:text-sm mb-4 sm:mb-6 leading-relaxed">
              Total Construction has become a name homeowners trust. Whether it's new
              construction or custom renovation, you're in good company when you
              build with Total Construction. Our strong partnerships are a reflection of the
              confidence our clients place in us — project after project.
            </p>

            <div className="grid grid-cols-2 gap-6 border-t border-gray-200 pt-3 sm:pt-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">100+</h3>
                <p className="text-teal-950 font-semibold mt-1 sm:mt-2 text-sm sm:text-base">
                  Satisfied Clients
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Over 100 projects built with trust and excellence.
                </p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">10 Yrs.</h3>
                <p className="text-teal-950 font-semibold mt-1 sm:mt-2 text-sm sm:text-base">
                  Structural Warranty
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Structural coverage & quality you can count on.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - IMAGE */}
          <div className="relative">
            <img
              src={familyImg}
              alt="Happy Family"
              loading="lazy"
              className="rounded-xl sm:rounded-2xl w-full h-[12rem] sm:h-[18rem] md:h-[22rem] object-cover shadow-lg"
            />
            <div className="absolute bottom-4 sm:bottom-6 -left-4 sm:-left-6 bg-lime-300 text-teal-950 font-extrabold px-2 sm:px-3 py-4 sm:py-5 rounded-md text-[0.7rem] sm:text-sm shadow-md">
              Long-Term Reliability
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedSection;
