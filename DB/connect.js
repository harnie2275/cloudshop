const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

async function connectDB(connectionString) {
  try {
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify:false,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
  }
}
module.exports = connectDB;
