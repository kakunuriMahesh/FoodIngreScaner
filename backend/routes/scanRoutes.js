const express = require("express");
const router = express.Router();
const Fuse = require("fuse.js");
const Ingredient = require("../models/Ingredient");

// CLEAN TEXT
const cleanIngredientText = (text) => {
  text = text.toLowerCase();
  text = text.replace(/\(.*?\)/g, "");
  text = text.replace(/\[.*?\]/g, "");
  text = text.replace(/;/g, ",");
  text = text.replace(/[^a-z,\-\s]/g, " ");
  text = text.replace(/\s+/g, " ");
  return text.trim();
};

router.post("/scan-text", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const cleanedText = cleanIngredientText(text);

    const inputIngredients = cleanedText
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 2);

    // 🔹 Get ingredients from MongoDB
    const dbIngredients = await Ingredient.find({}).lean();

    const fuse = new Fuse(dbIngredients, {
      keys: ["name"],
      threshold: 0.3,
    });

    const found = [];
    const missing = [];

    inputIngredients.forEach((ingredient) => {
      // Direct match first
      const direct = dbIngredients.find((item) =>
        item.name.toLowerCase().includes(ingredient)
      );

      if (direct) {
        found.push(direct);
      } else {
        const fuzzy = fuse.search(ingredient);

        if (fuzzy.length > 0) {
          found.push(fuzzy[0].item);
        } else {
          missing.push(ingredient);
        }
      }
    });

    return res.json({ found, missing });

  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
