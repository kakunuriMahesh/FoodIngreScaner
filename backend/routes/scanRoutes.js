// const express = require("express");
// const router = express.Router();
// const Fuse = require("fuse.js");
// const Ingredient = require("../models/Ingredient");

// // CLEAN TEXT
// const cleanIngredientText = (text) => {
//   text = text.toLowerCase();
//   text = text.replace(/\(.*?\)/g, "");
//   text = text.replace(/\[.*?\]/g, "");
//   text = text.replace(/;/g, ",");
//   text = text.replace(/[^a-z,\-\s]/g, " ");
//   text = text.replace(/\s+/g, " ");
//   return text.trim();
// };

// router.post("/scan-text", async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text) {
//       return res.status(400).json({ message: "Text is required" });
//     }

//     const cleanedText = cleanIngredientText(text);

//     const inputIngredients = cleanedText
//       .split(",")
//       .map((i) => i.trim())
//       .filter((i) => i.length > 2);

//     // 🔹 Get ingredients from MongoDB
//     const dbIngredients = await Ingredient.find({}).lean();

//     const fuse = new Fuse(dbIngredients, {
//       keys: ["name"],
//       threshold: 0.3,
//     });

//     const found = [];
//     const missing = [];

//     inputIngredients.forEach((ingredient) => {
//       // Direct match first
//       const direct = dbIngredients.find((item) =>
//         item.name.toLowerCase().includes(ingredient)
//       );
//       console.log("Direct Match:", fuse);

//       if (direct) {
//         found.push(direct);
//       } else {
//         const fuzzy = fuse.search(ingredient);

//         if (fuzzy.length > 0) {
//           found.push(fuzzy[0].item);
//         } else {
//           missing.push(ingredient);
//         }
//       }
//     });

//     return res.json({ found, missing });

//   } catch (error) {
//     console.error("Scan Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

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
    const { text, ingredients } = req.body;

    // ── Input validation ────────────────────────────────────────
    if (!text && (!Array.isArray(ingredients) || ingredients.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Either 'text' (string) or 'ingredients' (array) is required",
      });
    }

    // ── Prepare input ingredients array ─────────────────────────
    let inputIngredients = [];

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      // Frontend already sent an array → clean each item
      inputIngredients = ingredients
        .map(cleanIngredient)
        .filter(Boolean)
        .filter((item) => item.length > 1);
    } else if (typeof text === "string" && text.trim()) {
      // Classic string input → clean & split
      const cleaned = cleanIngredient(text);
      inputIngredients = cleaned
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 1);
    }

    if (inputIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid ingredients found after cleaning",
      });
    }

    // ── Load all ingredients from DB (lean for speed) ───────────
    const dbIngredients = await Ingredient.find({}).lean();

    if (dbIngredients.length === 0) {
      return res.status(200).json({
        success: true,
        found: [],
        missing: inputIngredients,
        message: "No ingredients in database",
      });
    }

    // ── Setup Fuse.js for fuzzy search ──────────────────────────
    const fuse = new Fuse(dbIngredients, {
      keys: ["name"],
      threshold: 0.35,          // 0.0 = perfect match, 0.4 = quite loose
      ignoreLocation: true,
      includeScore: true,
      shouldSort: true,
    });

    const found = [];
    const missing = [];

    // ── Match each input ingredient ─────────────────────────────
    inputIngredients.forEach((ingredient) => {
      // 1. Try exact substring match first (fast)
      const directMatch = dbIngredients.find((item) =>
        item.name.toLowerCase().includes(ingredient)
      );

      if (directMatch) {
        found.push(directMatch);
        return;
      }

      // 2. Fuzzy search if no direct match
      const fuzzyResults = fuse.search(ingredient);

      if (fuzzyResults.length > 0 && fuzzyResults[0].score < 0.4) {
        // Take the best match if score is good enough
        found.push(fuzzyResults[0].item);
      } else {
        missing.push(ingredient);
      }
    });

    // ── Response ────────────────────────────────────────────────
    return res.json({
      success: true,
      found,          // array of matched Ingredient documents
      missing,        // array of strings that weren't matched
      inputCount: inputIngredients.length,
    });

  } catch (error) {
    console.error("Scan-text error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing ingredients",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;