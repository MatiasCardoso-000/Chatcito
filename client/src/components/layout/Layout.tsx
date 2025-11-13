import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export const Layout = () => {
  return (
    <main className="min-h-screen bg-gray-800 text-gray-200">
      <Navbar />
      <div className="container mx-auto p-6">
        <Outlet />
      </div>
    </main>
  );
};
