// src/pages/Pending.jsx
import { useEffect, useState } from "react";
import API from "../api/api";
import { uploadToCloudinary, deleteFromCloudinary } from "../api/cloudinaryConfig";

export default function Pending() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [uploading, setUploading] = useState({});
  const [feedback, setFeedback] = useState({});
  const [expandedTip, setExpandedTip] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/pending");
      setPending(res.data || []);
    } catch (err) {
      console.error("Failed to load pending ingredients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setPending((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleTipChange = (id, field, value) => {
    setPending((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, tip: { ...(item.tip || {}), [field]: value } }
          : item
      )
    );
  };

  const removeIcon = (id) => {
    const item = pending.find((i) => i._id === id);
    if (item && item.icon && item.icon.startsWith("http")) {
      deleteFromCloudinary(item.icon);
    }
    handleChange(id, "icon", "");
  };

  const handleIconUpload = async (id, file) => {
    if (!file) return;

    // Delete old image if exists
    const item = pending.find((i) => i._id === id);
    if (item && item.icon && item.icon.startsWith("http")) {
      deleteFromCloudinary(item.icon);
    }

    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const url = await uploadToCloudinary(file);
      handleChange(id, "icon", url);
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [id]: { type: "error", msg: "Image upload failed: " + err.message },
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const approve = async (id) => {
    const item = pending.find((i) => i._id === id);
    if (!item) return;

    if (!item.name?.trim()) {
      setFeedback((prev) => ({
        ...prev,
        [id]: { type: "error", msg: "Name is required" },
      }));
      return;
    }

    const confirmed = window.confirm(
      `Approve "${item.name}" with current changes?`
    );
    if (!confirmed) return;

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setFeedback((prev) => ({ ...prev, [id]: null }));

    try {
      await API.post(`/admin/approve/${id}`, {
        name: item.name.trim(),
        icon: item.icon || "🧪",
        health_risk: item.health_risk || "Low",
        description: item.description?.trim() || "",
        tip: {
          description_points: item.tip?.description_points || [],
          what_it_does: item.tip?.what_it_does || [],
          daily_limits: item.tip?.daily_limits || "",
        },
      });

      setFeedback((prev) => ({
        ...prev,
        [id]: { type: "success", msg: "Approved successfully" },
      }));

      setTimeout(() => {
        setPending((prev) => prev.filter((i) => i._id !== id));
      }, 1400);
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [id]: {
          type: "error",
          msg: err.response?.data?.message || "Failed to approve",
        },
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Really delete this pending item?")) return;

    const item = pending.find((i) => i._id === id);
    if (item && item.icon && item.icon.startsWith("http")) {
      deleteFromCloudinary(item.icon);
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await API.delete(`/admin/pending/${id}`);
      setPending((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [id]: { type: "error", msg: "Failed to delete" },
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-gray-400 text-lg animate-pulse">
          Loading pending ingredients...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Pending Ingredients Review
        </h1>

        {pending.length === 0 ? (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-lg">No ingredients waiting for approval</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.map((item) => {
              const isLoading = actionLoading[item._id];
              const fb = feedback[item._id];
              const tipOpen = expandedTip[item._id];

              return (
                <div
                  key={item._id}
                  className={`bg-gray-900 border rounded-xl p-5 sm:p-6 transition-all duration-200 ${
                    fb?.type === "success"
                      ? "border-green-700/60 bg-green-950/30"
                      : fb?.type === "error"
                      ? "border-red-700/60 bg-red-950/30"
                      : "border-gray-800 hover:border-gray-600"
                  }`}
                >
                  {/* Row 1: Name + Icon */}
                  <div className="grid gap-4 sm:grid-cols-2 mb-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.name || ""}
                        onChange={(e) => handleChange(item._id, "name", e.target.value)}
                        placeholder="Ingredient name"
                        className={`w-full bg-gray-800 border ${
                          !item.name?.trim() ? "border-red-600" : "border-gray-700"
                        } rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                        Icon Image
                      </label>
                      <div className="flex flex-col gap-2">
                        {item.icon && item.icon.startsWith("http") ? (
                          <div className="relative w-full h-11 group">
                            <img
                              src={item.icon}
                              alt="icon"
                              className="w-full h-full object-cover rounded-lg border border-gray-700"
                            />
                            <button
                              onClick={() => removeIcon(item._id)}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {item.icon && <span className="text-2xl bg-gray-800 p-2 rounded-lg border border-gray-700">{item.icon}</span>}
                            <div className="relative flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleIconUpload(item._id, e.target.files[0])}
                                className="hidden"
                                id={`pending-icon-upload-${item._id}`}
                                disabled={uploading[item._id]}
                              />
                              <label
                                htmlFor={`pending-icon-upload-${item._id}`}
                                className={`flex items-center justify-center w-full h-11 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-gray-700 transition ${
                                  uploading[item._id] ? "opacity-50 cursor-wait" : ""
                                }`}
                              >
                                {uploading[item._id] ? (
                                  <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    ...
                                  </span>
                                ) : (
                                  "📸 Upload"
                                )}
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Description + Health Risk */}
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr] mb-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={item.description || ""}
                        onChange={(e) => handleChange(item._id, "description", e.target.value)}
                        placeholder="Brief description of the ingredient..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                        Health Risk
                      </label>
                      <select
                        value={item.health_risk || "Low"}
                        onChange={(e) => handleChange(item._id, "health_risk", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Tip Section (Collapsible) */}
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTip((prev) => ({
                          ...prev,
                          [item._id]: !prev[item._id],
                        }))
                      }
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition text-sm font-medium text-gray-300"
                    >
                      <span>💡 Tip Details</span>
                      <span>{tipOpen ? "▲" : "▼"}</span>
                    </button>

                    {tipOpen && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                            Description Points (one per line)
                          </label>
                          <textarea
                            rows={3}
                            value={(item.tip?.description_points || []).join("\n")}
                            onChange={(e) =>
                              handleTipChange(
                                item._id,
                                "description_points",
                                e.target.value.split("\n")
                              )
                            }
                            placeholder="Each line becomes a bullet point..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                            What It Does (one per line)
                          </label>
                          <textarea
                            rows={3}
                            value={(item.tip?.what_it_does || []).join("\n")}
                            onChange={(e) =>
                              handleTipChange(
                                item._id,
                                "what_it_does",
                                e.target.value.split("\n")
                              )
                            }
                            placeholder="Each line becomes a bullet point..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                            Daily Limits
                          </label>
                          <input
                            type="text"
                            value={item.tip?.daily_limits || ""}
                            onChange={(e) =>
                              handleTipChange(item._id, "daily_limits", e.target.value)
                            }
                            placeholder="e.g. Max 25g per day"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-5 border-t border-gray-800 flex flex-wrap gap-4 items-center">
                    <button
                      onClick={() => approve(item._id)}
                      disabled={isLoading || !item.name?.trim()}
                      className={`min-w-[110px] px-6 py-2.5 rounded-lg font-medium transition shadow-sm ${
                        isLoading
                          ? "bg-green-800 opacity-70 cursor-not-allowed"
                          : !item.name?.trim()
                          ? "bg-green-800/50 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-500 active:bg-green-700"
                      } text-white`}
                    >
                      {isLoading ? "Approving..." : "Approve"}
                    </button>

                    <button
                      onClick={() => remove(item._id)}
                      disabled={isLoading}
                      className={`min-w-[100px] px-5 py-2.5 rounded-lg font-medium transition ${
                        isLoading
                          ? "bg-red-800 opacity-70 cursor-not-allowed"
                          : "bg-red-700/80 hover:bg-red-700 text-white"
                      }`}
                    >
                      {isLoading ? "..." : "Delete"}
                    </button>

                    {fb && (
                      <div
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          fb.type === "success"
                            ? "bg-green-900/70 text-green-200 border border-green-800/50"
                            : "bg-red-900/70 text-red-200 border border-red-800/50"
                        }`}
                      >
                        {fb.msg}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
