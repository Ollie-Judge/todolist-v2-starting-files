const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_CONNECT_URI)
    .then(() => {
      app.listen(PORT, () => {
        console.log("Successfully connected to MongoDB");
      });
    })
    .catch((err) => console.log(err));
};

module.exports = connectDB;
