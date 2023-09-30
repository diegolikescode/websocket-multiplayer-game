import { clients, games, generateUUID, matrixH, matrixW } from "./index.js"

export const open = (result, connection) => {
    console.log(result)

    const clientID = result.clientID !== '' &&
        result.clientID !== 'undefined' ? result.clientID : generateUUID()

    if(!clients[result.clientID]) {
        clients[clientID] = { connection }
    }

    const payload = {
        method: 'connect',
        clientID
    }

    console.log(Object.keys(clients))
    connection.send(JSON.stringify(payload))
}

export const createGame = (result) => {
    console.log(result)
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
        currentRound: 1,
        fullMatrix
    }

    const payload = {
        method: 'create',
        game: games[gameID]
    }

    const { connection } = clients[clientID]
    connection.send(JSON.stringify(payload))
}

