const express = require('express')
const router = express.Router();


const authenticate = require('../middleware/authenticate');

const Book = require('../models/book')
const User = require('../models/user')

/** Route to get all books for a user */
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
        const bookIds = user.books;
        const books = await Promise.all(bookIds.map( async (bookId) => {
            const book = await Book.findById(bookId);
            console.log(book);
            return book;
        }));

        return res.json({ books })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

// Search the google books API; return a list of top 5 matches
// in the form they would need to be in to add a book
router.get('/search', async (req, res) => {
    try {
        const request_string =
        `https://www.googleapis.com/books/v1/volumes?q=${req.query.query}&key=${process.env.API_KEY}`;
        const response = await fetch(request_string);
        const jsonData = await response.json();
        const raw = jsonData["items"];
        const books = raw.map((item) => {
            bookInfo = item["volumeInfo"]
            cleanedBook = {
                title: bookInfo["title"],
                author: bookInfo["authors"][0],
                genre: bookInfo["categories"][0],
                publisher: bookInfo["publisher"],
                pages: bookInfo["pageCount"]
            }
            return(cleanedBook);
        })
        console.log(books);
        res.json({ books });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
});

/** Route to get one book by id. */
router.get('/:bookId', authenticate, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        return res.json({ book })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

/** Route to add a new book. */
router.post('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
        const { title, genre, published, pages, author } = req.body;
        const book = new Book({ title: title, author: author, genre: genre, published: published, pages: pages });
        await book.save();
        user.books.unshift(book);
        await user.save();
        return res.json({ book: book });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

/** Route to update an existing book. */
router.put('/:bookId', authenticate, async (req, res) => {
    try {
        await Book.findByIdAndUpdate(req.params.bookId, req.body);
        const book = await Book.findById(req.params.bookId);
        return res.json({ book });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

/** Route to delete a book. */
router.delete('/:bookId', authenticate, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        userId = req.auth.userId;
        const user = await User.findById(userId);
        const index = user.books.indexOf(book._id);
        user.books.splice(index, 1);
        await user.save();
        await book.remove();
        return res.json({
            'message': 'Successfully deleted.',
            '_id': req.params.userId
        });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})



module.exports = router
