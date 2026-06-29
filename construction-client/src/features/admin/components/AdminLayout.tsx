import React, {
  useEffect,
  useState,
} from "react";

import { ChevronDown } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { useAuth } from "@features/auth";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEstimatorMenu, setShowEstimatorMenu] =
  useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isSettingsActive = location.pathname.startsWith("/admin/settings");
  useEffect(() => {
  if (
    location.pathname.startsWith(
      "/admin/estimator"
    )
  ) {
    setShowEstimatorMenu(true);
  }
}, [location.pathname]);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50">
      <MyNavbar transparent={false} />

      <div className="flex w-full max-w-7xl mx-auto px-4 py-14 gap-6 flex-grow flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-56 shrink-0 bg-white rounded-2xl shadow p-4 h-fit lg:sticky lg:top-20 self-start">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-3">
            Admin
          </p>
          <nav className="space-y-2 text-sm font-semibold">
            <Link
              to="/admin/dashboard"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/admin/dashboard")
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/employees"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/admin/employees")
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Employees
            </Link>
            <Link
              to="/admin/reviews"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/admin/reviews")
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Reviews
            </Link>
            <Link
              to="/admin/map-requests"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/admin/map-requests")
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Map Requests
            </Link>
            <Link
              to="/admin/projects"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/admin/projects")
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Projects
            </Link>
            <Link
              to="/admin/floor-plans"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/admin/floor-plans")
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Floor Plans
            </Link>

            <button
  type="button"
  onClick={() =>
    setShowEstimatorMenu(
      !showEstimatorMenu
    )
  }
  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
    location.pathname.startsWith(
      "/admin/estimator"
    )
      ? "bg-emerald-100 text-emerald-700"
      : "hover:bg-emerald-50 text-gray-800"
  }`}
>
  <span>Estimator</span>

  <ChevronDown
  size={16}
  className={`transition-transform duration-300 ${
    showEstimatorMenu
      ? "rotate-180"
      : "rotate-0"
  }`}
/>
</button>
            <div
  className={`
    overflow-hidden transition-all duration-300 ease-in-out
    ${
      showEstimatorMenu
        ? "max-h-96 opacity-100 mt-2"
        : "max-h-0 opacity-0"
    }
  `}
>
  <div className="pl-4 space-y-1">
    <Link
      to="/admin/estimator/regions"
      className={`block px-3 py-1.5 rounded-lg text-sm transition ${
        isActive("/admin/estimator/regions")
          ? "bg-emerald-100 text-emerald-700 font-semibold"
          : "hover:bg-emerald-50 text-gray-700"
      }`}
    >
      Region Rates
    </Link>

    <Link
      to="/admin/estimator/breakdown"
      className={`block px-3 py-1.5 rounded-lg text-sm transition ${
        isActive("/admin/estimator/breakdown")
          ? "bg-emerald-100 text-emerald-700 font-semibold"
          : "hover:bg-emerald-50 text-gray-700"
      }`}
    >
      Breakdown Tree
    </Link>

    <Link
      to="/admin/estimator/preview"
      className={`block px-3 py-1.5 rounded-lg text-sm transition ${
        isActive("/admin/estimator/preview")
          ? "bg-emerald-100 text-emerald-700 font-semibold"
          : "hover:bg-emerald-50 text-gray-700"
      }`}
    >
      Estimate Preview
    </Link>

    <Link
      to="/admin/estimator/popular-calculations"
      className={`block px-3 py-1.5 rounded-lg text-sm transition ${
        isActive("/admin/estimator/popular-calculations")
          ? "bg-emerald-100 text-emerald-700 font-semibold"
          : "hover:bg-emerald-50 text-gray-700"
      }`}
    >
      Popular Calculations
    </Link>
  </div>
</div>
            <Link
              to="/admin/settings"
              className={`block px-3 py-2 rounded-lg transition ${
                isSettingsActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-gray-800"
              }`}
            >
              Settings
            </Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition"
              type="button"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to login again to
              access the admin panel.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminLayout;
