const express = require('express')
const passport = require('passport')
const Game = require('../models/game')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
router.get('/games', requireToken, (req, res, next) => {
  Game.find()
    .then(games => {
      return games.map(game => game.toObject())
    })
    .then(games => res.status(200).json({ games: games }))
    .catch(next)
})

// CREATE
router.post('/games', requireToken, (req, res, next) => {
  req.body.game.owner = req.user.id

  Game.create(req.body.game)
    .then(game => {
      res.status(201).json({ game: game.toObject() })
    })
    .catch(next)
})

// UPDATE
router.patch('/games/:id', requireToken, removeBlanks, (req, res, next) => {
  Game.findById(req.params.id)
    .then(handle404)
    .then(game => {
      return game.updateOne(req.body.game)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
