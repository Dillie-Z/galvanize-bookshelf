'use strict';
const knex = require('../knex');
const express = require('express');
const humps = require('humps');
const bcrypt = require('bcrypt');

// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE
router.post('/', (req, res, next) => {
 let {email,password} = req.body;
//
 knex('users')
   .where('email', email)
   .first()
   .then(()=>{
     return bcrypt.hashSync(password,12);
   })
   .then((hashedPassword)=>{
     let {firstName,lastName} = req.body;
     let insertNewUser = {
       firstName:firstName,
       lastName:lastName,
       email:email,
       hashedPassword:hashedPassword}
     return knex('users')
       .insert(humps.decamelizeKeys(insertNewUser),'*')
       // res.send(humps.camelizeKeys(insertNewUser))
   })
   .then((rows)=>{
     let user = humps.camelizeKeys(rows[0]);
     delete user.hashedPassword;
     req.session.userId = user.id;
     res.send(user)
   })
})
module.exports = router;
