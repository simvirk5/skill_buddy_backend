const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');

// await this
const findUserByEmail = email => {
  return User.findOne({email});
}

const doesPasswordMatch = (pw, hashedPw) => {
  return bcrypt.compareSync(pw, hashedPw);
}

const createToken = user => {
  const expireTime = 60 * 60 * 24 * 7
  return jwt.sign(user.toObject(), process.env.JWT_SECRET, {
    expiresIn: expireTime,
  });
}

router.post('/login', async (req, res) => {
  const errMsg = 'Email or password is incorrect.';
  let user = await findUserByEmail(req.body.email);
  const hashedPass = user ? user.password : '';
  !user ? res.json({ user: null, token: null, errors: true, _message: errMsg })
          : doesPasswordMatch(req.body.password, hashedPass)
            ? res.json({ user: user.toObject(), token: createToken(user) })
            : res.json({ errors: true, _message: errMsg });
});

router.post('/create', async (req, res) => {
  if ( await findUserByEmail(req.body.email) ) {
    res.send({errors: true, _message: 'There is already a user with that email.'});
  } else {
    const { email, firstName, lastName, password } = req.body;
    User.create(
      {
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        email: email.toLowerCase(),
        password,
      }, (err, user) => {
        if (err) {
          console.log('err: ', err);
          res.send(err);
        } else {
          res.json({ user: user.toObject(), token: createToken(user) });
        }
      }
    )
  }
});

router.post('/validate', (req, res) => {
  const token = req.body.token;
  if (!token) {
    res.status(401).json({errors: true, _message: "Must pass the token"})
  } else {
    jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
      if (err) {
        res.status(401).send(err);
      } else {
        User.findById({
          '_id': user._id
        }, function(err, foundUser) {
          if (err) {
            console.log('in else, User findByID, but ERR')
            res.status(401).send(err);
          } else {
            res.json({user: foundUser.toObject(), token})
          }
        });
      }
    });
  }
});

module.exports = router;
