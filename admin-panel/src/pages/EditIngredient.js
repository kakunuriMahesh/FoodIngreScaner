// src/pages/EditIngredient.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { uploadToCloudinary, deleteFromCloudinary } from "../api/cloudinaryConfig";

export default function EditIngredient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get("/admin/ingredients");
        const found = res.data.find((item) => item._id === id);

        if (!found) {
          setError("Ingredient not found");
          return;
        }

        // Ensure tip structure exists
        setIngredient({
          ...found,
          tip: {
            description_points: found.tip?.description_points || [],
            what_it_does: found.tip?.what_it_does || [],
            daily_limits: found.tip?.daily_limits || "",
          },
        });
      } catch (err) {
        setError("Failed to load ingredient");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredient();
  }, [id]);

  const handleChange = (field, value) => {
    setIngredient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTipChange = (field, value) => {
    setIngredient((prev) => ({
      ...prev,
      tip: { ...(prev.tip || {}), [field]: value },
    }));
  };

  const removeIcon = () => {
    const icon = ingredient.icon;
    if (icon && icon.startsWith("http")) {
      deleteFromCloudinary(icon);
    }
    handleChange("icon", "");
  };

  const handleSubmit = async () => {
    if (!ingredient) return;

    if (!window.confirm("Save changes to this ingredient?")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await API.put(`/admin/ingredients/${id}`, ingredient);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ingredient");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
        <div className="text-lg">Loading ingredient details...</div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/40 border border-red-800 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-300 mb-2">Error</h2>
            <p>{error || "Ingredient not found"}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Edit Ingredient</h1>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Name + Icon */}
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={ingredient.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingredient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Icon Image
                </label>
                <div className="flex flex-col gap-3">
                  {ingredient.icon && ingredient.icon.startsWith("http") ? (
                    <div className="relative w-20 h-20 group">
                      <img
                        src={ingredient.icon}
                        alt="icon"
                        className="w-full h-full object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        onClick={removeIcon}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {ingredient.icon && <span className="text-3xl bg-gray-800 p-2 rounded-lg border border-gray-700">{ingredient.icon}</span>}
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            // Delete old image if exists
                            if (ingredient.icon && ingredient.icon.startsWith("http")) {
                              deleteFromCloudinary(ingredient.icon);
                            }

                            setUploading(true);
                            try {
                              const url = await uploadToCloudinary(file);
                              handleChange("icon", url);
                            } catch (err) {
                              setError("Image upload failed: " + err.message);
                            } finally {
                              setUploading(false);
                            }
                          }}
                          className="hidden"
                          id="edit-icon-upload"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="edit-icon-upload"
                          className={`flex items-center justify-center px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-gray-700 transition ${
                            uploading ? "opacity-50 cursor-wait" : ""
                          }`}
                        >
                          {uploading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </span>
                          ) : (
                            "📸 Upload New Icon"
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Health Risk */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Health Risk Level
              </label>
              <select
                value={ingredient.health_risk || "Low"}
                onChange={(e) => handleChange("health_risk", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={ingredient.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Brief description of the ingredient..."
              />
            </div>

            {/* Tip Section */}
            <div className="border border-gray-700 rounded-lg p-5 space-y-5">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                💡 Tip Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description Points (one per line)
                </label>
                <textarea
                  rows={4}
                  value={(ingredient.tip?.description_points || []).join("\n")}
                  onChange={(e) =>
                    handleTipChange(
                      "description_points",
                      e.target.value.split("\n")
                    )
                  }
                  placeholder="Each line becomes a bullet point..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  What It Does (one per line)
                </label>
                <textarea
                  rows={4}
                  value={(ingredient.tip?.what_it_does || []).join("\n")}
                  onChange={(e) =>
                    handleTipChange(
                      "what_it_does",
                      e.target.value.split("\n")
                    )
                  }
                  placeholder="Each line becomes a bullet point..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Daily Limits
                </label>
                <input
                  type="text"
                  value={ingredient.tip?.daily_limits || ""}
                  onChange={(e) => handleTipChange("daily_limits", e.target.value)}
                  placeholder="e.g. Max 25g per day"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-8 py-2.5 rounded-lg font-medium transition ${
                saving
                  ? "bg-indigo-700 opacity-70 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
