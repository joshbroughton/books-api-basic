const mongoose = require('mongoose');

const { Schema } = mongoose;

// Add your models here.
const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  // user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  genre: String,
  publisher: String,
  pages: Number,
});

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
