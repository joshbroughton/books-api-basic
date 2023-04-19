const mongoose = require('mongoose');

// connect to mongo db
const mongoUri = process.env.MONGODB_URI
mongoose.connect(mongoUri)

mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`)
})

module.exports = mongoose.connection