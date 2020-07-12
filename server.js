// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// require route files
const gameRoutes = require('./app/routes/game_routes')
const userRoutes = require('./app/routes/user_routes')

// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 4741
const clientDevPort = 7165

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true
})

// instantiate express application object
const app = express()

// Socket.io imports
const http = require('http')
const socketio = require('socket.io')

const { newGame, closeGame } = require('./game/game')

const server = http.createServer(app)

const io = socketio(server)

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}` }))

// define port for API to run on
const port = process.env.PORT || serverDevPort

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(gameRoutes)
app.use(userRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// Socket implementation
io.on('connect', (socket) => {
  socket.on('join', ({ gameId, action }, callback) => {
    let game
    let error
    if (action === 'create') {
      const response = newGame({ id: socket.id, gameId })
      game = response.game
      error = response.error
    }

    console.log(game)
    console.log('gameId is: ' + gameId)
    if (error) return callback(error)

    socket.join(gameId)

    socket.emit('message', { action: 'join', text: `Welcome to room ${gameId}.` })
    socket.broadcast.to(gameId).emit('message', { action: 'new player', text: `Another user has joined!` })

    // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

    callback()
  })

  socket.on('sendAction', (action, callback) => {
    console.log(action)
    io.to(action.gameId).emit('action', { action })

    callback()
  })

  socket.on('disconnect', () => {
    const game = closeGame(socket.id)

    if (game) {
      io.to(game.gameId).emit('message', { action: 'leave', text: `Game ended because opponent has left.` })
      // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
    }
  })
})

server.listen(port, () => {
  console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
