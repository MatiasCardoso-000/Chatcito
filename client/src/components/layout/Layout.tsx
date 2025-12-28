import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { usePostStore } from "../../store/postStore";

export const Layout = () => {

  const { showComments} = usePostStore()

  return (
    <main className={`min-h-screen bg-gray-100
 text-gray-200 `}>
      <Navbar />
      <div className="container mx-auto p-6">
        <Outlet />
      </div>
    </main>
  );
};
