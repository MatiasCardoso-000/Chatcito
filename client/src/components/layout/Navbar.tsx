import { useAuthStore } from "../../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from "../common/Dropdown";
import { User2Icon } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const authLinks = (
    <div className="py-1">
      <Link
        to={`/profile/${user?.username}`}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Profile
      </Link>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );

  const guestLinks = (
    <div className="py-1">
      <Link
        to="/login"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Register
      </Link>
    </div>
  );

  return (
    <nav className="bg-gradient-to-r from-[#396AFC] to-[#2948FF]

  shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div>
            <Link to="/" className="text-2xl font-bold text-white">
              Chatcito
            </Link>
          </div>
          <div>
            <Dropdown content={isAuthenticated ? authLinks : guestLinks}>
              <button className="text-white font-bold focus:outline-none flex gap-2">
              <User2Icon className="border border-white rounded-full"/>
                {isAuthenticated && user
                  ? `${
                      user?.username.slice(0, 1).toUpperCase() +
                      user?.username.slice(1, user.username.length)
                    }`
                  : "Menu"}
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
