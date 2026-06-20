import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-teal-950 text-gray-300 max-w-[90rem] mx-auto px-3 sm:px-6 lg:px-8">

      {/* ======== FOOTER MAIN ======== */}
      <div className="pt-10 pb-5 sm:pt-14 sm:pb-6">
        <div className="max-w-[90rem] mx-auto px-3 sm:px-6 lg:px-8">
          {/* TOP GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 md:gap-14 border-b border-gray-700 pb-6 sm:pb-10">
            {/* LOGO + ABOUT */}
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="text-lime-400 text-2xl font-extrabold">⌃⌃</div>
                <h2 className="text-white text-lg font-bold">Total Construction</h2>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4 sm:mb-5">
                At Total Construction, we are dedicated to delivering exceptional construction
                services that stand the test of time.
              </p>

              {/* SOCIAL ICONS */}
              <div className="flex items-center gap-3 sm:gap-4 text-base">
                <FontAwesomeIcon
                  icon={faFacebookF}
                  className="hover:text-lime-400 cursor-pointer transition"
                />
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="hover:text-lime-400 cursor-pointer transition"
                />
                <FontAwesomeIcon
                  icon={faYoutube}
                  className="hover:text-lime-400 cursor-pointer transition"
                />
                <FontAwesomeIcon
                  icon={faXTwitter}
                  className="hover:text-lime-400 cursor-pointer transition"
                />
              </div>
            </div>

            {/* COMPANY */}
            <div>
              <h3 className="text-white font-semibold text-base mb-2 sm:mb-3">
                Company
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm">
                <li><a href="#" className="hover:text-lime-400 transition">Home</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">About</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Services</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Projects</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Contact</a></li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h3 className="text-white font-semibold text-base mb-2 sm:mb-3">
                Support
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-sm">
                <li><a href="#" className="hover:text-lime-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Testimonials</a></li>
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <h3 className="text-white font-semibold text-base mb-2 sm:mb-3">
                Contact Us
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="bg-lime-300 text-teal-950 p-1.5 sm:p-2 rounded-full text-sm">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Call us</p>
                    <p className="text-gray-300">+088 (246) 642-27-10</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-lime-300 text-teal-950 p-1.5 sm:p-2 rounded-full text-sm">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Send Email</p>
                    <p className="text-gray-300">info@totalconstruction.com</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-lime-300 text-teal-950 p-1.5 sm:p-2 rounded-full text-sm">
                    <FontAwesomeIcon icon={faLocationArrow} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Address</p>
                    <p className="text-gray-300">Rawalpindi</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* BOTTOM LINE */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 text-xs text-gray-400">
            <p>© 2025 Copyright by Total Construction</p>
            <div className="flex gap-4 sm:gap-6 mt-2 sm:mt-0">
              <a href="#" className="hover:text-lime-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-lime-400 transition">Terms & Condition</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
