import React from "react";
import { Outlet } from "react-router-dom";
import MyNavbar from "./MyNavbar";
import Footer from "./Footer";

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col pt-10">
      <MyNavbar transparent={false} />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default ClientLayout;
