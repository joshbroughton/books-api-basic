require('dotenv').config();
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const app = require('../server.js');

const Book = require('../models/book.js');
const User = require('../models/user.js');

chai.config.includeStack = true;

const { expect } = chai;
chai.use(chaiHttp);

after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

const SAMPLE_OBJECT_ID = 'aaaaaaaaaaaa'; // 12 byte string
let token;
let bookOne;
let bookTwo;

describe('Book API endpoint tests', () => {
  // Create a sample user and book for use in tests.
  beforeEach(async () => {
    const sampleUser = new User({
      username: 'myuser',
      password: 'mypassword',
      _id: SAMPLE_OBJECT_ID,
    });
    await sampleUser.save();

    bookOne = new Book({
      title: 'The House of God',
      author: 'Samuel Shem',
      genre: 'Fiction',
      publisher: 'Berkley Publishing Group',
      pages: 380,
    });

    bookTwo = new Book({
      title: 'Mount Misery',
      author: 'Samuel Shem, M.D.',
      genre: 'Fiction',
      publisher: 'Ballantine Books',
      pages: 576,
    });

    await bookOne.save();
    await bookTwo.save();
    sampleUser.books.unshift(bookOne);
    sampleUser.books.unshift(bookTwo);
    console.log(sampleUser.books);
    await sampleUser.save();

    token = jwt.sign({ userId: sampleUser._id }, process.env.SECRET_KEY, { expiresIn: '1m' });
  });

  // Delete test users and books
  afterEach(async () => {
    await User.deleteMany({ username: ['myuser', 'anotheruser'] });
    await Book.deleteMany({ title: ['The House of God', 'Mount Misery'] });
  });

  it('should load all books for current user', async () => {
    chai.request(app)
      .get('/books')
      .set('Authorization', `Bearer ${token}`)
      .end(async (error, response) => {
        if (error) { console.log(err); }
        expect(response).to.have.status(200);
        expect(response.body.books).to.be.an('array');
        expect(response.body.books[0]).to.deep.equal(bookOne);
        expect(response.body.books[1]).to.deep.equal(bookTwo);
      });
  });
});
