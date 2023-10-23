const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT_URI);
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
