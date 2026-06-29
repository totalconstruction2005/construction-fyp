import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/components";
import { useNavigate } from "react-router-dom";
import img1 from "@assets/img6.jpg";
import img2 from "@assets/img8.jpg";
import img3 from "@assets/img9.jpg";
import img4 from "@assets/img7.jpg";
import bgImg from "@assets/img7.jpg"; // background image

const ProjectsSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section id="projects" className="py-5 sm:py-15 bg-white">
      {/* === Main Content === */}
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[95%] sm:w-[85%] mx-auto">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4 sm:mb-8">
            {/* Left (60%) */}
            <div className="md:w-[60%] w-full mb-2 md:mb-0 text-center md:text-left">
              <p className="text-xs sm:text-sm font-semibold uppercase text-teal-800 tracking-wider mb-1">
                OUR PROJECTS
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
                Built to Last. <br className="hidden sm:block" /> Designed to Inspire.
              </h2>
            </div>

            {/* Right (40%) */}
            <div className="md:w-[40%] w-full text-gray-600 text-xs sm:text-xs leading-relaxed text-center md:text-left">
              <p className="mb-4">
                From high-end homes to modern office spaces, each Total Construction project is a reflection
                of quality, detail, and dedication. Our goal is to deliver lasting beauty and
                structural excellence.
              </p>
              <Link 
                to="/our-projects"
                className="inline-block bg-teal-900 text-lime-300 px-6 py-2 rounded-full text-sm font-semibold hover:bg-teal-800 transition"
              >
                VIEW ALL PROJECTS
              </Link>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-6">
              <div className="sm:w-[70%] w-full h-48 sm:h-75 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={img1}
                  alt="Project 1"
                  loading="lazy"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
              <div className="sm:w-[30%] w-full h-48 sm:h-75 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={img2}
                  alt="Project 2"
                  loading="lazy"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-6">
              <div className="sm:w-[30%] w-full h-48 sm:h-75 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={img3}
                  alt="Project 3"
                  loading="lazy"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
              <div className="sm:w-[70%] w-full h-48 sm:h-75 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={img4}
                  alt="Project 4"
                  loading="lazy"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === CTA Section (Full Width Background) === */}
      <div
        className="relative mt-7 h-[12rem] sm:h-[14rem] flex items-center w-full"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-teal-950/70"></div>

        {/* Inner Content aligned with grid above */}
        <div className="relative z-10 w-full">
          <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-[95%] sm:w-[85%] mx-auto flex flex-col sm:flex-row items-center justify-between text-white">
              {/* Left Text */}
              <div className="w-full sm:w-[70%] text-center sm:text-left mb-6 sm:mb-0">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3">
                  Let’s Build Your Dream Home
                </h2>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl">
                  Whether you’re envisioning a cozy residence or a luxurious estate, we’re here to
                  turn your dream into lasting reality — with quality, care, and craftsmanship.
                </p>
              </div>

              {/* Right Button */}
              <div className="w-full sm:w-[30%] flex justify-center sm:justify-end">
                <Button onClick={() => {
                   
                      navigate('/book-project');
                    
                  }}
                   label="ENQUIRE NOW" variant="primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
