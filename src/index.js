import http from 'http'
import {server}from 'websocket'
import { randomUUID} from 'crypto'

const httpServer = http.createServer()
httpServer.listen(6969, () => console.log("listening on 6969"))

const wsServer = new server({
    'httpServer': httpServer
})

const clients = {}
const games = {}

wsServer.on('request', req => {
    const conn = req.accept(null, req.origin)
    conn.on('open', () => console.log('open'))
    conn.on('close', () => console.log('closed'))

    conn.on('message', msg => {
        const result = JSON.parse(msg.utf8Data)

        if (result.method === 'create') {
            const {clientId} = result
            const gameId = randomUUID()

            const player = {clientId, color: 'red'}

            games[gameId] = {
                id: gameId,
                balls: 20,
                clients: [player]
            }

            const payload = {
                method: 'create',
                game: games[gameId]
            }

            const con = clients[clientId].connection
            console.log(games)
            con.send(JSON.stringify(payload))
        }

        if (result.method === 'join') {
            const {clientId, gameId} = result

            const game = games[gameId]
            if (game.clients.length >= 3) {
                const con = clients[clientId].connection
                con.send(JSON.stringify({error: 'max players reached'}))
                return
            }
            const color = {'0': 'red', '1': 'green', '2': 'blue'}[game.clients.length]
            game.clients.push({
                clientId,
                color
            })

            const payload = {
                method: 'join',
                game
            }

            game.clients.forEach(cli => {
                clients[cli.clientId].connection.send(JSON.stringify(payload))
            })
        }
    })

    handleRequest(conn)
})

function handleRequest(connection) {
    const newClientId = randomUUID()
    clients[newClientId] = {
        connection
    }

    const payload = {
        method: 'connect',
        clientId: newClientId,
    }

    connection.send(JSON.stringify(payload))
}
