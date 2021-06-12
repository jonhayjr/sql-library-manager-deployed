const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        // Forward error to the global error handler
        next(error);
      }
    }
  }

// Index route redirects to books route 
router.get('/', asyncHandler(async (req, res) => {
        res.redirect('/books');
  }));

//Gets a list of all books
router.get('/books', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render('index', {books})
}));

// Books post route
router.post('/books', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render('index', {books})
}));


//Shows create new book form
router.get('/books/new', asyncHandler(async (req, res) => {
   res.render('new-book', { book: {}});
}));

//Posts a new book to the database
router.post('/books/new', asyncHandler(async (req, res) => {
    // let book;
    // book = await Book.create(req.body);
    // res.redirect('/books')

   let book;
   try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    // if(error.name === 'SequelizeValidationError') {
    //   book = await Book.build(req.body);
    //   res.render('/books/new', { book, errors})
    // } else {
    //   throw error;
    // }  
    if (error.name === 'SequelizeValidationError') {
        book = await Book.build(req.body);
        res.render('new-book', {book, errors: error.errors})
    } else {
        throw error;
    }
  }
}));

//Show book detail form
router.get('/books/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    console.log(book);
    res.json(book);
}));

//Update book info in the database
router.post('/books/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    console.log(book);
    res.json(book);
}));


//Deletes book info from the database
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    console.log(book);
    res.json(book);
}));








module.exports = router;