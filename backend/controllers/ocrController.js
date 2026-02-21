// const axios = require("axios");
// const FormData = require("form-data");
// const Scan = require("../models/Scan");

// exports.processImage = async (req, res) => {
//   try {
//     const imageBuffer = req.file.buffer;

//     const formData = new FormData();
//     formData.append("file", imageBuffer, {
//       filename: "image.jpg",
//       contentType: "image/jpeg",
//     });

//     const response = await axios.post(
//       "http://127.0.0.1:8001/extract-text",
//       formData,
//       {
//         headers: formData.getHeaders(),
//       }
//     );

//     const extractedText = response.data.text;

//     const newScan = new Scan({
//       extractedText,
//     });

//     await newScan.save();

//     res.json({
//       success: true,
//       text: extractedText,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// const axios = require("axios");
// const FormData = require("form-data");

// exports.processImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded" });
//     }

//     const formData = new FormData();

//     // IMPORTANT: FastAPI expects field name "file"
//     formData.append("file", req.file.buffer, {
//       filename: "image.jpg",
//       contentType: req.file.mimetype,
//     });

//     const response = await axios.post(
//       "http://127.0.0.1:8001/extract-text",
//       formData,
//       {
//         headers: formData.getHeaders(),
//       }
//     );

//     res.json({
//       success: true,
//       text: response.data.text,
//     });

//   } catch (error) {
//     console.error("OCR Error:", error.message);
//     res.status(500).json({ error: "OCR processing failed" });
//   }
// };

const axios = require("axios");
const FormData = require("form-data");

exports.processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const formData = new FormData();

    formData.append("file", req.file.buffer, {
      filename: "image.jpg",
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      "http://127.0.0.1:8001/extract-text",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // 🔥 Forward FastAPI response properly
    res.json({
      success: true,
      found: response.data.found,
      missing: response.data.missing,
    });

  } catch (error) {
    console.error("OCR Error:", error.message);
    res.status(500).json({ error: "OCR processing failed" });
  }
};
