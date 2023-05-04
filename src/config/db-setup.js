const mongoose = require('mongoose');

// connect to mongo db
const mongoUri = process.env.MONGODB_URI
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  })
  .then(() =>  console.log('Connected to MongoDB'))
  .catch(error  =>  console.error('Error connecting to MongoDB: ', error));

module.exports = mongoose.connection
