const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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

module.exports = mongoose.model("Ingredient", IngredientSchema, "ingredients");
