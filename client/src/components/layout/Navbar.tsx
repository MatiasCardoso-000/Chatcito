
const Navbar = () => {
  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div>
            <a href="/" className="text-2xl font-bold text-white">
              Chatcito
            </a>
          </div>
          <div>
            <a href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</a>
            <a href="/register" className="text-gray-300 hover:text-white ml-4 px-3 py-2 rounded-md text-sm font-medium">Register</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;