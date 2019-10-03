const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, {timestamps: true});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
