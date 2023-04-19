const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, select: false },
  books: [{ type: Schema.Types.ObjectId, ref: "Book" }]
})

const User = mongoose.model('User', UserSchema)

module.exports = User