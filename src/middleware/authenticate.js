const { expressjwt } = require('express-jwt');

const authenticate = expressjwt({ secret: process.env.SECRET_KEY, algorithms: ['HS256'] });

module.exports = authenticate;
