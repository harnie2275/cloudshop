const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
    },
    wordPhrase: {
      type: String,
      required: true,
      unique: true,
    },
    subItem: {
      type: Array,
    },
    parentCategory: {
      type: Object,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
