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

// Home redirects to books route 
router.get('/', asyncHandler(async (req, res) => {
        res.redirect('/books');
  }));

//Gets a list of all books
router.get('/books', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    console.log(books);
    res.json(books);
}));





module.exports = router;
