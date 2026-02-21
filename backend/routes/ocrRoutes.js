const express = require("express");
const multer = require("multer");
const { processImage } = require("../controllers/ocrController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/scan", upload.single("image"), processImage);

module.exports = router;
