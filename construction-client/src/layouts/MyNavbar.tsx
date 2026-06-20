// MyNavbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth";

interface NavbarProps {
  transparent?: boolean;
}

const MyNavbar: React.FC<NavbarProps> = ({ transparent = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showServices, setShowServices] = useState(false); // desktop dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false); // mobile accordion
  const [showUserMenu, setShowUserMenu] = useState(false); // desktop user dropdown
  const [mobileEstimatorOpen, setMobileEstimatorOpen] = useState(false); // mobile admin estimator accordion
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null); // wrapper for Services + dropdown
  const userMenuRef = useRef<HTMLDivElement | null>(null); // wrapper for user menu
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Prevent background scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Detect scroll to apply background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 150);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  // 🔹 Dynamic color logic (keeps your original intention)
  const isDarkBg = transparent ? true : false;

  // helper: close services if focus moved outside wrapper
  const handleServicesBlur = (e: React.FocusEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!servicesRef.current) {
      setShowServices(false);
      return;
    }
    // if the new focused element is not inside servicesRef, close
    if (!related || !servicesRef.current.contains(related)) {
      setShowServices(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      setShowUserMenu(false);
    }
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-colors duration-150 ${
        isOpen
          ? "bg-white text-gray-800 shadow-lg"
          : transparent
          ? scrolled
            ? "bg-black/40 backdrop-blur-lg text-white shadow-md"
            : "bg-transparent text-white"
          : "bg-white text-gray-800 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={isAdmin ? "/admin/dashboard" : "/"}
              className={`text-xl font-semibold transition-colors duration-300 ${
                isDarkBg ? "text-white" : "text-gray-900"
              }`}
            >
              Total Construction
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {!isAdmin && (
              <>
                {/* Home */}
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkBg ? "text-white/90 hover:text-lime-300" : "text-gray-700 hover:text-lime-600"
                  }`}
                >
                  Home
                </Link>

                {/* About */}
                <Link
                  to="/about"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkBg ? "text-white/90 hover:text-lime-300" : "text-gray-700 hover:text-lime-600"
                  }`}
                >
                  About
                </Link>

                {/* Our Services dropdown (desktop) */}
                <div
                  ref={servicesRef}
                  className="relative"
                  onMouseEnter={() => setShowServices(true)}
                  onMouseLeave={() => {
                    setTimeout(() => setShowServices(false), 120);
                  }}
                >
                  <button
                    aria-expanded={showServices}
                    aria-haspopup="menu"
                    className={`flex items-center gap-2 text-sm font-medium px-1 py-1 transition-colors duration-200 ${
                      isDarkBg ? "text-white/90 hover:text-lime-300" : "text-gray-700 hover:text-lime-600"
                    }`}
                    type="button"
                    onBlur={handleServicesBlur}
                  >
                    Our Services
                    <svg
                      className={`w-3 h-3 transform ${showServices ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.26 4.66a.75.75 0 01-1.08 0L5.21 8.28a.75.75 0 01.02-1.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {showServices && (
                    <div
                      role="menu"
                      aria-label="Services menu"
                      className="absolute left-0 top-[100%] w-56 bg-white text-gray-700 rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      onMouseEnter={() => setShowServices(true)}
                      onMouseLeave={() => {
                        setTimeout(() => setShowServices(false), 120);
                      }}
                    >
                      <Link
                        to="/estimator"
                        className="group relative block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <span className="absolute left-0 top-0 h-full w-1 bg-teal-800 scale-y-0 origin-top transition-transform duration-200 group-hover:scale-y-100"></span>
                        Construction Cost Estimator
                      </Link>

                      <Link
                        to="/design-studio"
                        className="group relative block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <span className="absolute left-0 top-0 h-full w-1 bg-teal-800 scale-y-0 origin-top transition-transform duration-200 group-hover:scale-y-100"></span>
                        Design Studio
                      </Link>

                      <Link
                        to="/construct-your-house"
                        className="group relative block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <span className="absolute left-0 top-0 h-full w-1 bg-teal-800 scale-y-0 origin-top transition-transform duration-200 group-hover:scale-y-100"></span>
                        Construct Your House
                      </Link>

                      <Link
                        to="/my-projects"
                        className="group relative block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <span className="absolute left-0 top-0 h-full w-1 bg-teal-800 scale-y-0 origin-top transition-transform duration-200 group-hover:scale-y-100"></span>
                        Progress Tracking
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/book-project"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkBg ? "text-white/90 hover:text-lime-300" : "text-gray-700 hover:text-lime-600"
                  }`}
                >
                  Start Your Project
                </Link>


                <button 
                  onClick={() => {
                    if (location.pathname === '/') {
                      const footerBanner = document.querySelector('.footer-banner-section');
                      if (footerBanner) {
                        footerBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    } else {
                      navigate('/contact-us');
                    }
                  }}
                  className="bg-lime-300 text-green-900 px-5 py-1.5 rounded-full font-medium text-sm hover:bg-lime-400 transition duration-300"
                >
                  GET IN TOUCH
                </button>
              </>
            )}


            {isAuthenticated ? (
              <div 
                ref={userMenuRef} 
                className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => {
                  setTimeout(() => setShowUserMenu(false), 120);
                }}
              >
                <button
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isDarkBg
                      ? "text-white/90 hover:bg-white/10"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {user?.name || user?.email}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.26 4.66a.75.75 0 01-1.08 0L5.21 8.28a.75.75 0 01.02-1.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 top-[calc(100%+4px)] w-48 bg-white text-gray-700 rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => {
                      setTimeout(() => setShowUserMenu(false), 150);
                    }}
                  >
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="group relative block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      <span className="absolute left-0 top-0 h-full w-1 bg-teal-800 scale-y-0 origin-top transition-transform duration-200 group-hover:scale-y-100"></span>
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="group relative w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                    >
                      <span className="absolute left-0 top-0 h-full w-1 bg-red-600 scale-y-0 origin-top transition-transform duration-200 group-hover:scale-y-100"></span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isDarkBg ? "text-white/90 hover:text-lime-300" : "text-gray-700 hover:text-lime-600"
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className={`focus:outline-none ${
                isDarkBg ? "text-white hover:text-lime-300" : "text-gray-700 hover:text-lime-600"
              }`}
              aria-label="Open menu"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/10 z-40"></div>}

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-xs bg-gradient-to-b from-lime-50 to-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-lime-200 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-lime-100 bg-white/70 backdrop-blur-md">
          <span className="text-xl font-extrabold text-lime-800 tracking-wide">Total Construction</span>
          <button onClick={() => setIsOpen(false)} className="text-lime-800 hover:text-lime-600 text-2xl" aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="px-6 py-6 overflow-y-auto max-h-full">
          <nav className="flex flex-col gap-3">
            {isAdminRoute ? (
              <>
                {/* Admin Navigation */}
                <Link onClick={() => setIsOpen(false)} to="/admin/dashboard" className="text-gray-700 hover:text-lime-600 font-medium">
                  Dashboard
                </Link>
                <Link onClick={() => setIsOpen(false)} to="/admin/employees" className="text-gray-700 hover:text-lime-600 font-medium">
                  Employees
                </Link>
                <Link onClick={() => setIsOpen(false)} to="/admin/map-requests" className="text-gray-700 hover:text-lime-600 font-medium">
                  Map Requests
                </Link>
                <Link onClick={() => setIsOpen(false)} to="/admin/projects" className="text-gray-700 hover:text-lime-600 font-medium">
                  Projects
                </Link>
                <Link onClick={() => setIsOpen(false)} to="/admin/floor-plans" className="text-gray-700 hover:text-lime-600 font-medium">
                  Floor Plans
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileEstimatorOpen((open) => !open)}
                  className="w-full flex items-center justify-between text-gray-700 hover:text-lime-600 font-medium"
                  aria-expanded={mobileEstimatorOpen}
                  aria-controls="admin-estimator-menu"
                >
                  <span>Estimator</span>
                  <svg className={`w-4 h-4 transform ${mobileEstimatorOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.26 4.66a.75.75 0 01-1.08 0L5.21 8.28a.75.75 0 01.02-1.07z" clipRule="evenodd" />
                  </svg>
                </button>
                {mobileEstimatorOpen && (
                  <div id="admin-estimator-menu" className="mt-2 pl-4 flex flex-col gap-2">
                    <Link onClick={() => setIsOpen(false)} to="/admin/estimator/regions" className="text-gray-600 hover:text-lime-600">
                      Region Rates
                    </Link>
                    <Link onClick={() => setIsOpen(false)} to="/admin/estimator/breakdown" className="text-gray-600 hover:text-lime-600">
                      Breakdown Tree
                    </Link>
                    <Link onClick={() => setIsOpen(false)} to="/admin/estimator/preview" className="text-gray-600 hover:text-lime-600">
                      Estimate Preview
                    </Link>
                    <Link onClick={() => setIsOpen(false)} to="/admin/estimator/popular-calculations" className="text-gray-600 hover:text-lime-600">
                      Popular Calculations
                    </Link>
                  </div>
                )}
                <Link onClick={() => setIsOpen(false)} to="/admin/settings" className="text-gray-700 hover:text-lime-600 font-medium">
                  Settings
                </Link>
              </>
            ) : (
              <>
                {/* Public Navigation */}
                <Link onClick={() => setIsOpen(false)} to="/" className="text-gray-700 hover:text-lime-600 font-medium">
                  Home
                </Link>

                <Link to="/about" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-lime-600 font-medium">
                  About
                </Link>

                {/* Mobile services accordion */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen((s) => !s)}
                    className="flex w-full justify-between items-center text-gray-700 hover:text-lime-600 font-medium"
                    aria-expanded={mobileServicesOpen}
                    aria-controls="mobile-services"
                  >
                    <span>Our Services</span>
                    <svg className={`w-4 h-4 transform ${mobileServicesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.26 4.66a.75.75 0 01-1.08 0L5.21 8.28a.75.75 0 01.02-1.07z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {mobileServicesOpen && (
                    <div id="mobile-services" className="mt-2 pl-3 flex flex-col gap-2">
                      <Link to="/estimator" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-lime-600">
                        Construction Cost Estimator
                      </Link>
                      <Link to="/design-studio" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-lime-600">
                        Design Studio
                      </Link>
                      <Link to="/construct-your-house" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-lime-600">
                        Construct Your House
                      </Link>
                      <Link to="/my-projects" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-lime-600">
                        Progress Tracking
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/book-project" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-lime-600 font-medium">
                  Start Your Project
                </Link>
              </>
            )}


            {isAuthenticated ? (
              <div className="space-y-3 border-t border-gray-200 pt-3 mt-3">
                <div className="text-gray-700 font-medium text-sm">{user?.name || user?.email}</div>
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-700 hover:text-lime-600 font-medium"
                >
                  Settings
                </Link>
                <button 
                  onClick={() => { 
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-700 transition duration-300"
                  type="button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-lime-600 font-medium">
                Login
              </Link>
            )}

            {!isAdminRoute && (
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (location.pathname === '/') {
                      setTimeout(() => {
                        const footerBanner = document.querySelector('.footer-banner-section');
                        if (footerBanner) {
                          footerBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 300);
                    } else {
                      navigate('/contact-us');
                    }
                  }}
                  className="w-full bg-lime-300 text-green-900 px-5 py-2 rounded-full font-medium text-sm hover:bg-lime-400 transition duration-300"
                >
                  GET IN TOUCH
                </button>
              </div>
            )}
          </nav>
        </div>

        <div className="absolute bottom-6 left-0 w-full text-center text-gray-400 text-xs">© 2025 Total Construction</div>
      </div>
    </nav>
  );
};

export default MyNavbar;
