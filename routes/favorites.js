'use strict';
const knex = require('../knex');
const express = require('express');
const boom = require('boom');
const humps = require('humps');
const bcrypt = require('bcrypt');

// eslint-disable-next-line new-cap
const router = express.Router();


const auth = function(req, res, next) {
        if (!req.session.userId) {
            return next(boom.create(401, 'Unauthorized'))
        }
        next()
    }
    // YOUR CODE HERE
router.get('/', auth, (req, res, next) => {

    knex('favorites')
        .innerJoin('books', 'books.id', 'favorites.book_id')
        .where('favorites.user_id', req.session.userId)
        .orderBy('books.title', 'ASC')
        .then((row) => {
            let fav = humps.camelizeKeys(row)
            res.send(fav)
        })
        .catch((err) => {
            next(err);
        });
})

router.get('/check', auth, (req, res, next) => {
    if (!Number.isInteger(Number.parseInt(req.query.bookId))) {
        return next(boom.create(400, 'Book ID must be an integer'));
    }
    knex('books')
        .innerJoin('favorites', 'favorites.book_id', 'books.id')
        .where({
            'favorites.book_id': Number.parseInt(req.query.bookId),
            'favorites.user_id': req.session.userId
        })
        .first()
        .then((row) => {
            if (row) {
                return res.send(true)
            }
            res.send(false)
        })
        .catch((err) => {
            next(err);
        });
})


router.post('/', auth, (req, res, next) => {
    knex('books')
        .where('id', req.body.bookId)
        .first()
        .then((book) => {
            let insertBook = {
                bookId: req.body.bookId,
                userId: req.session.userId
            }

            return knex('favorites')
                .insert(humps.decamelizeKeys(insertBook), '*')
        })
        .then((rows) => {
            let fav = humps.camelizeKeys(rows[0])
            res.send(fav)
        })
        .catch((err) => {
            next(err);
        });
})

router.delete('/', auth, (req, res, next) => {
    let fav
    knex('favorites')
        .where({
            book_id: req.body.bookId,
            user_id: req.session.userId
        })
        .first()
        .then((row) => {
            fav = humps.camelizeKeys(row)
            return knex('favorites')
                .del()
                .where('id', fav.id)
        })
        .then(() => {
            delete fav.id
            res.send(fav)
        })
        .catch((err) => {
            next(err);
        });
})
module.exports = router;
