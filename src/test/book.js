require('dotenv').config();
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const app = require('../server');

const Book = require('../models/book');
const User = require('../models/user');

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
      _id: SAMPLE_OBJECT_ID,
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
        if (error) { console.log(error); }
        expect(response).to.have.status(200);
        expect(response.body.books).to.be.an('array');
        expect(response.body.books[0]).to.deep.equal(bookOne);
        expect(response.body.books[1]).to.deep.equal(bookTwo);
      });
  });

  it('should return 10 books from the google books API', async () => {
    chai.request(app)
      .get('/books/search')
      .query({ q: 'the house of god' })
      .end(async (error, response) => {
        if (error) { console.log(error); }
        expect(response).to.have.status(200);
        expect(response.body.books).to.be.an('array');
        expect(response.body.books.length).to.equal(10);
      });
  });

  it('should get one book by bookId', async () => {
    chai.request(app)
      .get(`/books/${SAMPLE_OBJECT_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .end(async (error, response) => {
        if (error) { console.log(error); }
        expect(response).to.have.status(200);
        expect(response.body.book).to.deep.equal(bookOne);
      });
  });

  it('should create a new book', async () => {
    chai.request(app)
      .post('/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: "Man's 4th Best Hospital",
        author: 'Samuel Shem',
        genre: 'Fiction',
        publisher: 'Penguin',
        pages: 384,
      })
      .end(async (error, response) => {
        if (error) { console.log(error); }
        expect(response).to.have.status(200);
        expect(response.body.book).to.deep.equal({
          title: "Man's 4th Best Hospital",
          author: 'Samuel Shem',
          genre: 'Fiction',
          publisher: 'Penguin',
          pages: 384,
        });
        const book = await Book.findOne({ title: "Man's 4th Best Hospital" });
        expect(book).to.be.an('object');
      });
  });

  it('should delete a book by bookId', async () => {
    chai.request(app)
      .delete(`/books/${SAMPLE_OBJECT_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .end(async (error, response) => {
        if (error) { console.log(error); }
        expect(response).to.have.status(200);
        expect(response.body.message).to.equal(`Book with id ${SAMPLE_OBJECT_ID} deleted.`);
        const book = await Book.findOne({ _id: SAMPLE_OBJECT_ID });
        expect(book).to.be.null;
      });
  });

  it('should update a book by bookId', async () => {
    chai.request(app)
      .put(`/books/${SAMPLE_OBJECT_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'The House of God (Revised Edition)',
      })
      .end(async (error, response) => {
        if (error) { console.log(error); }
        expect(response).to.have.status(200);
        expect(response.body.book.title).to.equal('The House of God (Revised Edition)');
        const book = await Book.findOne({ _id: SAMPLE_OBJECT_ID });
        expect(book.title).to.equal('The House of God (Revised Edition)');
      });
  });
});
