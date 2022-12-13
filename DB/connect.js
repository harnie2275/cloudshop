const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

function connectDB(connectionString) {
  return mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify:false,
  });
}
module.exports = connectDB;
