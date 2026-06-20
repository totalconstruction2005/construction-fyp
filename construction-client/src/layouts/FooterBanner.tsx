import React from "react";
import { useNavigate } from "react-router-dom";

const FooterBanner: React.FC = () => {
  const navigate = useNavigate();

  const handleScheduleMeeting = () => {
    navigate("/contact-us");
  };

  return (
    <section
      className="footer-banner-section bg-teal-950 text-gray-300 max-w-[90rem] mx-auto px-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-lime-300 rounded-3xl p-8 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-teal-950 gap-6 sm:gap-10">
          {/* LEFT TEXT */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2">
              Ready to start your project?
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
              From Idea to Reality, <br className="hidden sm:block" />
              Let’s Begin
            </h2>
          </div>

          {/* RIGHT TEXT + BUTTON */}
          <div className="sm:text-left flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            {/* Calendar Icon */}
            <div className="hidden sm:block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-teal-950"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                />
              </svg>
            </div>

            {/* Text Content */}
            <div className="w-full">
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Schedule a Meeting with Us!
              </h3>
              <p className="text-xs sm:text-sm mb-4 max-w-full sm:max-w-md leading-relaxed">
                With just a few clicks, choose a convenient date and time that suits you and schedule a productive and efficient meeting with our team.
              </p>
              <button
                onClick={handleScheduleMeeting}
                className="bg-teal-950 text-lime-300 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-900 transition shadow-lg hover:shadow-xl"
              >
                Schedule Your Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterBanner;
