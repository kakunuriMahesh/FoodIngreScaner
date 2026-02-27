const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,   // 🔥 prevent duplicates at DB level
  },
  icon: {
    type: String,
    default: "🧪",
  },
  health_risk: {
    type: String,
    default: "Low",
  },
  description: {
    type: String,
    default: "",
  },
  tip: {
    description_points: {
      type: [String],
      default: [],
    },
    what_it_does: {
      type: [String],
      default: [],
    },
    daily_limits: {
      type: String,
      default: "",
    },
  },
}, { timestamps: true, strict: false });
// 🔥 create unique index
IngredientSchema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model("Ingredient", IngredientSchema, "ingredients");
