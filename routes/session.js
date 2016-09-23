'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const humps = require('humps');

const router = express.Router();


router.get('/', (req, res) => {
    if (req.session.userId) {
        return res.send(true);
    }
    res.send(false)
})

router.post('/', (req, res, next) => {
    if (!req.body.email || !req.body.email.trim()) {
        return next(boom.create(400, 'Email must not be blank'));
    }
    if (!req.body.password || req.body.password.length < 8) {
        return next(boom.create(400, 'Password must not be blank'));
    }
    let user;

    knex('users')
        .where('email', req.body.email)
        .first()
        .then((row) => {
            if (!row) {
                throw boom.create(400, 'Bad email or password');
            }
            user = humps.camelizeKeys(row)
            return bcrypt.compare(req.body.password, user.hashedPassword);
        })
        .then(() => {
            delete user.hashedPassword
            req.session.userId = user.id
            res.send(user)
        })
        .catch(bcrypt.MISMATCH_ERROR, () => {
            throw boom.create(400, 'Bad email or password');
        })
        .catch((err) => {
            next(err);
        });
})

router.delete('/', (req, res) => {
    req.session = null;
    res.send(true);
})

module.exports = router;
