import { clients, games, generateUUID, matrixH, matrixW } from "./index.js"

export const open = (result, connection) => {

    const clientID = result.clientID && result.clientID !== '' &&
        result.clientID !== 'undefined' ? result.clientID : generateUUID()

    if(!clients[result.clientID]) {
        clients[clientID] = { connection }
    }

    const userGame = Object.keys(games).find(g => {
        return games[g].clients.find(c => c.clientID === clientID)
    })

    const payload = {
        method: 'connect',
        clientID,
        game: games[userGame],
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
        fullMatrix,
    }

    const payload = {
        method: 'create',
        game: games[gameID]
    }

    connection.send(JSON.stringify(payload))
}

export const joinGame = (result, connection) => {
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
        connection.send(JSON.stringify({
            method: 'playRound',
            'message': 'game not found, create a new one!',
            games
        }))
        return
    }

    game.fullMatrix = result.fullMatrix
    game.playerTurn = game.playerTurn === 'blue' ? 'red' : 'blue'

    const payload = {
        method: 'playRound',
        game,
        fullMatrix: result.fullMatrix
    }

    connection.send(JSON.stringify(payload))

    game.clients.forEach(c => {
        clients[c.clientID].connection.send(JSON.stringify(payload))
    })
}

export const updateConnection = (clientID, connection) => {
    if(clients[clientID])
        clients[clientID].connection = connection
}

export const exitGame = ({ clientID }, connection) => {
    for (const gameID in games) {
        let gameData = games[gameID]
        gameData.clients = gameData.clients.filter(c => c.clientID !== clientID)
    }

    const payload = {
        method: 'exitGame',
        success: true,
    }

    connection.send(JSON.stringify(payload))
    return
}

export const winner = ({ clientID, gameID, ballColor }, _) => {
    console.log(clientID, gameID)

    const payload = {
        method: 'winner',
        winnerColor: ballColor
    }

    games[gameID].clients.forEach(c => {
        clients[c.clientID].connection.send(JSON.stringify(payload))
    })
}

