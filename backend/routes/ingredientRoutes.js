const express = require("express");
const router = express.Router();
const PendingIngredient = require("../models/PendingIngredient");

router.post("/add-ingredient", async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients || !Array.isArray(ingredients)) {
            return res.status(400).json({ error: "Invalid ingredients array" });
        }

        const savedIngredients = await PendingIngredient.insertMany(
            ingredients.map(name => ({ name }))
        );

        res.json({
            success: true,
            count: savedIngredients.length,
            ingredients: savedIngredients
        });

    } catch (error) {
        console.error("Add Ingredient Error:", error);
        res.status(500).json({ error: "Failed to add ingredients" });
    }
});

module.exports = router;
