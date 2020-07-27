const games = []

// create new Game
const newGame = (gameId) => {
  // name = name.trim().toLowerCase()
  gameId = gameId.trim().toLowerCase()

  const existingGame = getGame(gameId)

  if (!gameId) return { error: 'Game Id is required.' }
  if (existingGame) return { error: 'Game Id is taken.' }

  const game = { gameId, player1: 'player1', player2: null }

  games.push(game)

  return game
}

const joinGame = (gameId) => {
  gameId = gameId.trim().toLowerCase()

  let game
  game = getGame(gameId)

  if (!gameId) return { error: 'Game Id is required.' }

  if (!game) {
    game = { gameId, player1: 'player1', player2: null }
    games.push(game)
  } else {
    if (game.player2 !== null) return { error: 'Game is full.' }

    game.player2 = 'player2'
  }

  return game
}

// End a game
const closeGame = (id) => {
  console.log('reached closeGame function with: ' + id)
  const index = games.findIndex((game) => game.gameId === id)

  if (index !== -1) return games.splice(index, 1)[0]
}

const getGame = (gameId) => games.find((game) => game.gameId === gameId)

// const getUsersInRoom = (gameId) => users.filter((user) => user.gameId === gameId)

module.exports = { newGame, joinGame, closeGame, getGame }
