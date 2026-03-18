const express = require("express");
const router = express.Router();
const Fuse = require("fuse.js");
const Ingredient = require("../models/Ingredient");

// ─────────────────────────────────────────────
// Utility: Clean and normalize a single ingredient name
// ─────────────────────────────────────────────
const cleanIngredient = (str) => {
  if (!str || typeof str !== "string") return "";

  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, "")           // remove anything in parentheses
    .replace(/\[.*?\]/g, "")           // remove anything in brackets
    .replace(/;/g, ",")                // semicolon → comma
    .replace(/[^a-z0-9\s\-]/g, " ")    // keep only letters, numbers, space, hyphen
    .replace(/\s+/g, " ")              // collapse multiple spaces
    .trim();
};

// ─────────────────────────────────────────────
// Main route: /api/scan-text
// Accepts either { text: "..." } or { ingredients: ["...", "..."] }
// ─────────────────────────────────────────────
router.post("/scan-text", async (req, res) => {
  try {
    // body can contain { text: "..." } or { ingredients: ["...", "..."] }
    const { text, ingredients } = req.body;

    if (!text && !Array.isArray(ingredients)) {
      return res.status(400).json({ message: "Text or ingredients array is required" });
    }

    // produce a single cleaned comma-separated string regardless of input form
    let cleanedText;
    if (Array.isArray(ingredients)) {
      cleanedText = ingredients
        .map((i) => cleanIngredient(i))
        .filter(Boolean)
        .join(",");
    } else {
      cleanedText = text
        .split(",")
        .map((i) => cleanIngredient(i))
        .filter(Boolean)
        .join(",");
    }

    const inputIngredients = cleanedText
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 2);

    const dbIngredients = await Ingredient.find({}).lean();

    const fuse = new Fuse(dbIngredients, {
      keys: ["name"],
      threshold: 0.3,
    });

    const foundMap = {};
    const missingMap = {};

    inputIngredients.forEach((ingredient) => {
      const direct = dbIngredients.find((item) =>
        item.name.toLowerCase().includes(ingredient)
      );

      let matchedItem = null;

      if (direct) {
        matchedItem = direct;
      } else {
        const fuzzy = fuse.search(ingredient);
        if (fuzzy.length > 0) {
          matchedItem = fuzzy[0].item;
        }
      }

      if (matchedItem) {
        const key = matchedItem.name.toLowerCase();

        if (!foundMap[key]) {
          foundMap[key] = { ...matchedItem, count: 1 };
        } else {
          foundMap[key].count += 1;
        }
      } else {
        if (!missingMap[ingredient]) {
          missingMap[ingredient] = { name: ingredient, count: 1 };
        } else {
          missingMap[ingredient].count += 1;
        }
      }
    });

    res.json({
      found: Object.values(foundMap),
      missing: Object.keys(missingMap), // return array of ingredient names only
    });

  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;