const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const ocrRoutes = require("./routes/ocrRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", ocrRoutes);
app.use("/api", adminRoutes);
app.use("/api", ingredientRoutes);
app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
