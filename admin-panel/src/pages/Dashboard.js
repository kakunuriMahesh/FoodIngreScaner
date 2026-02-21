// src/pages/Dashboard.jsx  (make this your new "/")
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = [
    { title: "Total Ingredients", value: "1,248", color: "text-blue-400" },
    { title: "Pending Approval", value: "17", color: "text-yellow-400" },
    { title: "High Risk Items", value: "42", color: "text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition"
            >
              <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/add"
                className="block py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center font-medium transition"
              >
                Add New Ingredient
              </Link>
              <Link
                to="/pending"
                className="block py-3 px-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-center font-medium transition"
              >
                Review Pending Items
              </Link>
              <Link
                to="/"
                className="block py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-center font-medium transition"
              >
                View All Ingredients
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500 text-sm">(Recent actions would appear here)</p>
            {/* You can later connect real logs */}
          </div>
        </div>
      </div>
    </div>
  );
}