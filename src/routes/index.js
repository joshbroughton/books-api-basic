const express = require('express');
const messageRoutes = require('./book.js');
const userRoutes = require('./user.js');

const router = express.Router();

router.use('/books', messageRoutes);
router.use('/users', userRoutes);

module.exports = router;
