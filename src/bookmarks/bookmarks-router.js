require('dotenv').config();

const express = require('express');
const uuid = require('uuid/v4'); //generate uuids for new bookmark ids
const logger = require('../logger');
const store = require('../store')
const bookmarkRouter = express.Router(); 
const bodyParser = express.json(); //to parse json in POST endpoint
const { bookmarks } = require('../store')

bookmarkRouter
 .route('/bookmark')
 .get((req, res, next) => {
    res.json(bookmarks)
  })
  
 .post(bodyParser, (req, res) => {
    for (const field of ['title', 'url', 'rating']) {
        if (!req.body[field]) {
          logger.error(`${field} is required`)
          return res.status(400).send(`'${field}' is required`)
        }
      }
      const { title, url, description, rating } = req.body
  
      if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        logger.error(`Invalid rating '${rating}`)
        return res.status(400).send(`'Must be a number between 0 and 5`)
      }
  
      if (!isWebUri(url)) {
        logger.error(`Invalid url '${url}`)
        return res.status(400).send(`'Must be a valid URL`)
      }
  
      const bookmark = { id: uuid(), title, url, description, rating }
  
      store.bookmarks.push(bookmark)
  
      logger.info(`Bookmark with id ${bookmark.id} created`)
      res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
        .json(bookmark)
    });

bookmarkRouter
 .route('/bookmark/:id')
 .get((req, res) => {
    console.log(req.params.id)
    const {id}  = req.params
    console.log('below is')
    console.log(id)
    console.log(bookmarks)
    console.log('above is')
    const bookmark = bookmarks.find(b => b.id == id)
    console.log(bookmark);
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    res.json(bookmark)
  })
.delete((req, res, next) => {
    
    const { id  } = req.params
    const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`)
      return res
        .status(404)
        .send('Bookmark Not Found')
    }

    store.bookmarks.splice(bookmarkIndex, 1)

    logger.info(`Bookmark with id ${id} deleted.`)
    res
      .status(204)
      .end()
  })

 module.exports = bookmarkRouter;