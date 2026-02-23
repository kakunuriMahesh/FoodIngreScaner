const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // await mongoose.connect("mongodb://127.0.0.1:27017/food_db");
    await mongoose.connect("mongodb+srv://team_db_user:DXIQvBqkPDmGh5ec@ingredient.fydx6zw.mongodb.net/food_db");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
