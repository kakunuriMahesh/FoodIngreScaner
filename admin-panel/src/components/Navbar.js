// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Ingredients" },
  { to: "/pending", label: "Pending" },
  { to: "/add", label: "Add Ingredient" },
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>

          <div className="flex space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// import { Link } from "react-router-dom";

// function Navbar() {
//   return (
//     <div style={{ padding: 20, background: "#222", color: "#fff" }}>
//       <Link to="/" style={{ marginRight: 15, color: "#fff" }}>
//         Ingredients
//       </Link>
//       <Link to="/pending" style={{ marginRight: 15, color: "#fff" }}>
//         Pending
//       </Link>
//       <Link to="/add" style={{ color: "#fff" }}>
//         Add Ingredient
//       </Link>
//     </div>
//   );
// }

// export default Navbar;
