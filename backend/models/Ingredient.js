const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,   // 🔥 prevent duplicates at DB level (creates index automatically)
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
// note: unique:true on name is enough – mongoose will create the index automatically
// remove explicit schema.index call to avoid duplicate-index warning
module.exports = mongoose.model("Ingredient", IngredientSchema, "ingredients");
