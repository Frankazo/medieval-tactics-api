const games = []

// create new Game
const newGame = ({ id, gameId }) => {
  // name = name.trim().toLowerCase()
  gameId = gameId.trim().toLowerCase()

  const existingGame = games.find((game) => game.gameId === gameId)

  if (!gameId) return { error: 'Game Id is required.' }
  if (existingGame) return { error: 'Game Id is taken.' }

  const game = { id, gameId }

  games.push(game)

  return { game }
}

// End a game
const closeGame = (id) => {
  const index = games.findIndex((game) => game.id === id)

  if (index !== -1) return games.splice(index, 1)[0]
}

const getGame = (gameId) => games.find((game) => game.gameId === gameId)

// const getUsersInRoom = (gameId) => users.filter((user) => user.gameId === gameId)

module.exports = { newGame, closeGame, getGame }
