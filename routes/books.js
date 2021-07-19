const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const {Op} = require('sequelize');
//Default page size
const pageSize = 5;

/* Handler function to wrap each route. */
const asyncHandler = (cb) => {
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
    //If there is no page number, 1 is used.
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);

    //Grabs search parameter
    const search = req.query.search ? req.query.search : '';

    //Create searchConditions object
    let searchConditions={}

    //If there is a search parameters, creates search condition that checks for title, author, genre, or year
    if (search) {
        searchConditions = {
            [Op.or] : [
                {title: {[Op.like] : `%${search}%`}},
                {author: {[Op.like] : `%${search}%`}},
                {genre: {[Op.like] : `%${search}%`}},
                {year: {[Op.like] : `%${search}%`}},
            ]}
    }

    //Get total number of books based on search conditions
    const totalBooks = await Book.findAll({where: searchConditions});

    //Get length of books array
    const booksLength = totalBooks.length;

    //Max pages is length of books array divided by page size rounded to the next highest integer.  If this value is less than 1, 0 is used.
    const maxPage = booksLength / pageSize >= 1 ? Math.ceil(booksLength / pageSize): 1;

    //If current page is greater than 1, then previous page is current page - 1.  In all other scenarios, this value is blank which hides previous button from page.
    const prevPage = page > 1 ? page - 1 : '';

    //If current page plus 1 is less than or equal to the max pages, then the next page is equal to the current page plus 1.  In all other scenarios, a blank is used which hides the next button
    const nextPage = page + 1 <= maxPage ? page + 1: '';

    //Sets limit variable equal to the pageSize variable
    const limit = pageSize;

    //Offset is equal to the current page - 1 * the page size or limit
    const offset = ((page - 1) * limit);

    //Gets books based on search conditions and limit and offset
    const books = await Book.findAll({where: searchConditions, limit: limit, offset: offset});
    
    res.render('index', {books, prevPage, nextPage, search})
}));


//Shows create new book form
router.get('/books/new', asyncHandler(async (req, res) => {
   res.render('new-book', { book: {}});
}));

//Inserts a new book into the database
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

//Shows book detail form
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

//Updates book info in the database
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
