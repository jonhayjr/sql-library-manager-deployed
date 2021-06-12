const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const {Op} = require('sequelize');

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
    //Grabs search parameter and adds wildcards
    const search = req.query.search ? `%${req.query.search}%` : '';
    console.log(search)
    let searchConditions={}
    
    if (search) {
        searchConditions.where = {
            [Op.or] : [
                {title: {[Op.like] : search}},
                {author: {[Op.like] : search}},
                {genre: {[Op.like] : search}},
                {year: {[Op.like] : search}},
            ]}
    }

    
    const books = await Book.findAll(searchConditions);
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
   let book;
   try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {

    if (error.name === 'SequelizeValidationError') {
        book = await Book.build(req.body);
        res.render('new-book', {book, errors: error.errors})
    } else {
        throw error;
    }
  }
}));

//Show book detail form
router.get('/books/:id', asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (book) {
        console.log(book)
        res.render('update-book', {book});
    } else {
       const err = new Error();
      err.status = 404;
      next(err);
    }
}));

//Update book info in the database
router.post('/books/:id', asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let book;
    try {
        book = await Book.findByPk(id);
        if(book) {
            await book.update(req.body);
            res.redirect('/books');
        } else {
            const err = new Error();
            err.status = 404;
            next(err);
        }
    } catch (error) {
        if(error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = id;
            res.render('update-book', { book, errors: error.errors})
          } else {
            throw error;
          }
    }
}));


//Deletes book info from the database
router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if(book) {
        await book.destroy();
        res.redirect("/books");
      } else {
        const err = new Error();
        err.status = 404;
        next(err);
      }
}));








module.exports = router;
