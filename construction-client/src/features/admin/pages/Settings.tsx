import React from "react";
import { Link } from "react-router-dom";

const Settings: React.FC = () => {
  return (
    <>
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Admin</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Settings</h1>
        <p className="text-sm text-gray-600 mt-2">Configure administrative options and tools.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Link
          to="/admin/settings/contractor-plans"
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Contractor Plans</h2>
              <p className="text-sm text-gray-600 mt-1">Manage available contractor service plans</p>
            </div>
            <span className="text-emerald-600 text-sm font-semibold">Manage</span>
          </div>
        </Link>

        <Link
          to="/admin/settings/change-password"
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-600 mt-1">Update your account password securely</p>
            </div>
            <span className="text-emerald-600 text-sm font-semibold">Update</span>
          </div>
        </Link>
      </section>
    </>
  );
};

export default Settings;
