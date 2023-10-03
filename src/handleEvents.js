import { clients, games, generateUUID, matrixH, matrixW } from "./index.js"

export const open = (result, connection) => {

    const clientID = result.clientID && result.clientID !== '' &&
        result.clientID !== 'undefined' ? result.clientID : generateUUID()

    if(!clients[result.clientID]) {
        clients[clientID] = { connection }
    }

    const payload = {
        method: 'connect',
        clientID
    }

    console.info('current clients connected', Object.keys(clients))
    connection.send(JSON.stringify(payload))
}

export const createGame = (result, connection) => {
    const fullMatrix = new Array(matrixH)
    .fill(null)
    .map(() => new Array(matrixW).fill(null))

    for (let i = 0; i < matrixH; i++) {
        for (let j = 0; j < matrixW; j++) {
            fullMatrix[i][j] = {
                ball: '', // '' | 'blue' | 'red'
            }
        }
    }

    const { clientID } = result
    const player = { clientID, color: 'blue'}

    const gameID = generateUUID()
    games[gameID] = {
        id: gameID,
        clients: [player],
        playerTurn: Math.random() * (10 - 1) + 1 > 5 ? 'blue' : 'red',
        fullMatrix
    }

    const payload = {
        method: 'create',
        game: games[gameID]
    }

    connection.send(JSON.stringify(payload))
}

export const joinGame = (result, connection) => {
    console.table(result)

    const game = games[result.gameID]
    if(!game) {
        connection.send(JSON.stringify({'message': 'game not found, create a new one!'}))
        return
    }
    if(game.clients.length >= 2) {
        connection.send(JSON.stringify({'message': 'only 2 players per game'}))
        return
    }

    game.clients.push({clientID: result.clientID, color: 'red'})
    const payload = {
        method: 'join',
        game
    }

    game.clients.forEach(c => {
        clients[c.clientID].connection.send(JSON.stringify(payload))
    })
}

export const playRound = (result, connection) => {
    const game = games[result.gameID]

    if(!game) {
        connection.send(JSON.stringify({'message': 'game not found, create a new one!'}))
        return
    }

    game.fullMatrix = result.fullMatrix
    game.playRound = game.playerTurn === 'blue' ? 'red' : 'blue'

    console.log('MY GEIMES')
    console.log(games)
    // games[result.gameID]

    const payload = {
        method: 'playRound',
        game
    }

    game.clients.forEach(c => {
        clients[c.clientID].connection.send(JSON.stringify(payload))
    })
}

