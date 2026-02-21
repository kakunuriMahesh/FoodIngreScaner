const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Ingredient = require("../models/Ingredient");
const PendingIngredient = require("../models/PendingIngredient");
const { deleteImage } = require("../services/cloudinaryService");


// ==============================
// 0️⃣ Delete Cloudinary Image
// ==============================
router.post("/cloudinary/delete", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: "Public ID is required" });
    }
    const result = await deleteImage(publicId);
    res.json({ message: "Cloudinary image deleted", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 1️⃣ Get All Pending Ingredients
// ==============================
router.get("/admin/pending", async (req, res) => {
  try {
    const pending = await PendingIngredient.find();
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 2️⃣ Approve Ingredient
// Move from pending → ingredients
// ==============================
router.post("/admin/approve/:id", async (req, res) => {
  try {
    const pendingItem = await PendingIngredient.findById(req.params.id);

    if (!pendingItem) {
      return res.status(404).json({ message: "Not found" });
    }

    // Use the edited data from req.body directly (frontend sends all details)
    await Ingredient.create(req.body);

    // Delete from pending
    await PendingIngredient.findByIdAndDelete(req.params.id);

    res.json({ message: "Ingredient approved and moved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 3️⃣ Delete Pending Ingredient
// ==============================
router.delete("/admin/pending/:id", async (req, res) => {
  try {
    await PendingIngredient.findByIdAndDelete(req.params.id);
    res.json({ message: "Pending ingredient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 4️⃣ Get All Approved Ingredients
// ==============================
router.get("/admin/ingredients", async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 5️⃣ Add New Ingredient (Single or Bulk)
// ==============================
router.post("/admin/ingredients", async (req, res) => {
  try {
    const data = req.body;

    // If array → insert many
    if (Array.isArray(data)) {
      const inserted = await Ingredient.insertMany(data);
      return res.json({
        message: "Multiple ingredients added successfully",
        count: inserted.length
      });
    }

    // If single object → insert one
    const newIngredient = new Ingredient(data);
    await newIngredient.save();

    res.json({
      message: "Ingredient added successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ==============================
// 6️⃣ Update Ingredient
// ==============================
router.put("/admin/ingredients/:id", async (req, res) => {
  try {
    await Ingredient.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Ingredient updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 7️⃣ Delete Ingredient
// ==============================
router.delete("/admin/ingredients/:id", async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// 8️⃣ Search Ingredient
// ==============================
router.get("/admin/ingredients/search/:name", async (req, res) => {
  try {
    const results = await Ingredient.find({
      name: { $regex: req.params.name, $options: "i" }
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;