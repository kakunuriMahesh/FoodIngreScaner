// src/pages/AddIngredient.jsx
import { useState } from "react";
import API from "../api/api";
import { uploadToCloudinary, deleteFromCloudinary } from "../api/cloudinaryConfig";

const createEmptyItem = () => ({
  name: "",
  icon: "🧪",
  health_risk: "Low",
  description: "",
  tip: {
    description_points: [],
    what_it_does: [],
    daily_limits: "",
  },
});

export default function AddIngredient() {
  const [mode, setMode] = useState("form"); // "form" or "json"
  const [items, setItems] = useState([createEmptyItem()]);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({}); // Tracking uploads per item index
  const [message, setMessage] = useState(null);

  // ─── Form helpers ───
  const handleField = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeIcon = (index) => {
    const icon = items[index].icon;
    if (icon && icon.startsWith("http")) {
      deleteFromCloudinary(icon);
    }
    handleField(index, "icon", "");
  };
  
  const handleIconUpload = async (index, file) => {
    if (!file) return;

    // Delete old image if exists
    const oldIcon = items[index].icon;
    if (oldIcon && oldIcon.startsWith("http")) {
      deleteFromCloudinary(oldIcon);
    }

    setUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const url = await uploadToCloudinary(file);
      handleField(index, "icon", url);
    } catch (err) {
      setMessage({ type: "error", text: "Image upload failed: " + err.message });
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleTipField = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, tip: { ...item.tip, [field]: value } }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Submit ───
  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      let payload;

      if (mode === "json") {
        if (!jsonInput.trim()) {
          setMessage({ type: "error", text: "JSON input is empty" });
          setLoading(false);
          return;
        }
        payload = JSON.parse(jsonInput);
      } else {
        // Validate all items have names
        const emptyName = items.findIndex((it) => !it.name.trim());
        if (emptyName !== -1) {
          setMessage({
            type: "error",
            text: `Item #${emptyName + 1}: Name is required`,
          });
          setLoading(false);
          return;
        }

        // Clean up: trim names, filter empty tip lines
        const cleaned = items.map((it) => ({
          ...it,
          name: it.name.trim(),
          tip: {
            ...it.tip,
            description_points: (it.tip.description_points || []).filter((s) => s.trim()),
            what_it_does: (it.tip.what_it_does || []).filter((s) => s.trim()),
          },
        }));

        // Send as array for multiple, single object for one
        payload = cleaned.length === 1 ? cleaned[0] : cleaned;
      }

      await API.post("/admin/ingredients", payload);
      setMessage({
        type: "success",
        text: `Ingredient(s) added successfully!`,
      });

      if (mode === "form") {
        setItems([createEmptyItem()]);
      } else {
        setJsonInput("");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message.includes("JSON")
          ? "Invalid JSON format"
          : "Failed to add ingredient",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Add New Ingredient(s)</h1>

        {/* Mode Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode("form")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === "form"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            📝 Form
          </button>
          <button
            onClick={() => setMode("json")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === "json"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {"{ }"} JSON
          </button>
        </div>

        {mode === "form" ? (
          <div className="space-y-6">
            {items.map((form, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 relative"
              >
                {/* Item number + remove */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-400">
                    Item #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {/* Name + Icon */}
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleField(idx, "name", e.target.value)}
                      placeholder="e.g. Sugar, Citric Acid"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                      Icon Image
                    </label>
                    <div className="flex flex-col gap-2">
                      {form.icon ? (
                        <div className="relative w-full h-10 group">
                          <img
                            src={form.icon}
                            alt="icon"
                            className="w-full h-full object-cover rounded-lg border border-gray-700"
                          />
                          <button
                            onClick={() => removeIcon(idx)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleIconUpload(idx, e.target.files[0])}
                            className="hidden"
                            id={`icon-upload-${idx}`}
                            disabled={uploading[idx]}
                          />
                          <label
                            htmlFor={`icon-upload-${idx}`}
                            className={`flex items-center justify-center w-full h-10 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-gray-700 transition ${
                              uploading[idx] ? "opacity-50 cursor-wait" : ""
                            }`}
                          >
                            {uploading[idx] ? (
                              <span className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                              </span>
                            ) : (
                              "📸 Upload Icon"
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Health Risk */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                    Health Risk
                  </label>
                  <select
                    value={form.health_risk}
                    onChange={(e) => handleField(idx, "health_risk", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleField(idx, "description", e.target.value)}
                    placeholder="Brief description..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                  />
                </div>

                {/* Tip Section */}
                <div className="border border-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                    💡 Tip Details
                  </h3>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                      Description Points (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(form.tip.description_points || []).join("\n")}
                      onChange={(e) =>
                        handleTipField(idx, "description_points", e.target.value.split("\n"))
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
                      value={(form.tip.what_it_does || []).join("\n")}
                      onChange={(e) =>
                        handleTipField(idx, "what_it_does", e.target.value.split("\n"))
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
                      value={form.tip.daily_limits}
                      onChange={(e) => handleTipField(idx, "daily_limits", e.target.value)}
                      placeholder="e.g. Max 25g per day"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add another item */}
            <button
              onClick={addItem}
              className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition font-medium"
            >
              + Add Another Ingredient
            </button>
          </div>
        ) : (
          /* JSON Mode */
          <div>
            <p className="text-gray-400 mb-4 text-sm">
              Paste valid JSON — single object or array of objects
            </p>
            <textarea
              className="w-full h-64 p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "name": "Sugar",\n    "icon": "🍬",\n    "category": "Sweetener",\n    "health_risk": "Medium",\n    "description": "A common sweetener...",\n    "tip": {\n      "description_points": ["Adds sweetness"],\n      "what_it_does": ["Raises blood sugar"],\n      "daily_limits": "Max 25g per day"\n    }\n  },\n  {\n    "name": "Salt",\n    "icon": "🧂",\n    "category": "Mineral",\n    "health_risk": "Medium"\n  }\n]`}
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-900/50 text-green-300"
                : "bg-red-900/50 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Adding..."
              : mode === "form" && items.length > 1
              ? `Submit ${items.length} Ingredients`
              : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
