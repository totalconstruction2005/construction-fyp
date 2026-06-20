import React from "react";
import {
  Hammer,
  Building2,
  HardHat,
  Calculator,
  Construction,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import calcImg from "@assets/hero-img.jpg"; // 👉 add your calculator+house image here

const Instructions: React.FC = () => {
  const tips = [
    {
      icon: <Hammer className="w-10 h-10 text-teal-700" />,
      title: "Labour Quality",
      desc: "High quality & trained labor should be assigned.",
    },
    {
      icon: <Construction className="w-10 h-10 text-teal-700" />,
      title: "Foundation Quality",
      desc: "No compromise on foundation quality.",
    },
    {
      icon: <Building2 className="w-10 h-10 text-teal-700" />,
      title: "Building Material",
      desc: "Building material should be Premium Plus grade.",
    },
    {
      icon: <HardHat className="w-10 h-10 text-teal-700" />,
      title: "Construction Mode",
      desc: "Sourcing material yourself or outsourcing everything to a contractor.",
    },
    {
      icon: <Calculator className="w-10 h-10 text-teal-700" />,
      title: "Cost Calculator",
      desc: "Get quick cost estimate using our calculator.",
    },
  ];

  const features = [
    "Flexibility of Area Size and Units",
    "Separate Estimates for Grey Structure and Complete House",
    "Multiple Construction Modes",
    "Flexibility to Change the number of rooms",
  ];

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Section Heading */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
          Things to Keep In Mind While Constructing Your House
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10 text-sm">
          Your house is often the hard-earned fruit of your work over decades of your life.
          It only makes sense to be absolutely sure about where, when and particularly how to build your house.
          Following are some things you should keep in mind while constructing your house.
        </p>

        {/* Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 justify-items-center">
          {tips.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3">
              <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                {item.title}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-snug max-w-[180px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Construction Cost Calculator Section ---- */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          {/* Left Text Content */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              Construction Cost Calculator
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Want to learn more about Zameen.com’s Construction Cost Calculator
              and build your dream house?
            </p>

            <ul className="space-y-2 mt-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-center text-gray-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-800 mr-2" />
                  {f}
                </li>
              ))}
            </ul>

            <button className="mt-6 inline-flex items-center bg-teal-800 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 transition">
              Read More <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Right Image */}
          <div className="flex-1 mt-8 md:mt-0 flex justify-center">
            <img
              src={calcImg}
              alt="Construction Calculator Illustration"
              className="w-[260px] md:w-[320px] lg:w-[380px]"
            />
          </div>
        </div>
      </div>

      {/* ---- About Section ---- */}
      <div className="max-w-6xl mx-auto px-4 mt-14">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          About Construction Cost Calculator
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          The first challenge one usually encounters when building a house is not knowing how much the unit will
          cost to construct because there are several variables that might affect the cost such as the quality and
          type of materials used, the number of floors, and whether or not the house will be built by you or a
          construction company. Zameen has launched its new house construction cost calculator tool to provide its
          users with a reliable way to estimate the construction costs of their houses. If you want to build your
          dream home, you can quickly estimate the construction cost with our Construction Cost Calculator. This
          tool makes it simple to estimate home building costs. Simply enter the city where you intend to build
          your home, choose the area of the house in Marla or Kanals, and choose the quality of the materials you
          wish to use. You will get the estimated construction costs including grey structure cost, contractor cost,
          finishing cost, and price per sq. feet.
        </p>
      </div>
    </section>
  );
};

export default Instructions;
