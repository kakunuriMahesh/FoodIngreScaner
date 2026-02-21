// src/pages/Ingredients.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { deleteFromCloudinary } from "../api/cloudinaryConfig";

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  const fetchIngredients = async (query = "") => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const url = query
        ? `/admin/ingredients/search/${encodeURIComponent(query)}`
        : "/admin/ingredients";
      const res = await API.get(url);
      setIngredients(res.data || []);
    } catch (err) {
      console.error("Failed to fetch ingredients:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteIngredient = async (id) => {
    if (!window.confirm("Delete this ingredient permanently?")) return;

    try {
      const item = ingredients.find((i) => i._id === id);
      if (item && item.icon && item.icon.startsWith("http")) {
        deleteFromCloudinary(item.icon);
      }
      await API.delete(`/admin/ingredients/${id}`);
      fetchIngredients(search);
    } catch (err) {
      alert("Failed to delete ingredient");
    }
  };

  const handleReset = () => {
    setSearch("");
    fetchIngredients("");
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Pagination
  const totalItems = ingredients.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = ingredients.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const riskBadge = (risk) => {
    const r = (risk || "").toLowerCase();
    if (r === "low") return "bg-green-900/60 text-green-300";
    if (r === "medium") return "bg-yellow-900/60 text-yellow-300";
    if (r === "high") return "bg-red-900/60 text-red-300";
    return "bg-gray-800 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">All Ingredients</h1>

          <div className="flex flex-wrap gap-3">
            <input
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => fetchIngredients(search)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Loading / Empty / Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading ingredients...</div>
        ) : ingredients.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-gray-400 text-lg">
              {search ? "No ingredients match your search" : "No ingredients found"}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-900 shadow-sm">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Name
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300">
                      Risk
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-300 hidden lg:table-cell">
                      Tip
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {currentItems.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-100 flex items-center">
                        {item.icon && item.icon.startsWith("http") ? (
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded shadow-sm mr-3"
                          />
                        ) : (
                          <span className="mr-3 text-lg">{item.icon || "🧪"}</span>
                        )}
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${riskBadge(
                            item.health_risk
                          )}`}
                        >
                          {item.health_risk || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        {item.tip &&
                        (item.tip.description_points?.length > 0 ||
                          item.tip.what_it_does?.length > 0 ||
                          item.tip.daily_limits) ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                            ✓ Has Tip
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/edit/${item._id}`)}
                            className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-700 text-sm rounded-md transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteIngredient(item._id)}
                            className="px-3 py-1.5 bg-red-700/80 hover:bg-red-800 text-sm rounded-md transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-400">
                  Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition ${
                            pageNum === currentPage
                              ? "bg-blue-600 text-white font-medium"
                              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
