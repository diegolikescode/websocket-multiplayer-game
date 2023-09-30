import http from 'http'
import {server}from 'websocket'
import crypto from 'crypto'
import {createGame, open} from './handleEvents.js'

export const generateUUID = () => {
    const buffer = crypto.randomBytes(16)
    buffer[6] = (buffer[6] & 0x0f) | 0x40
    buffer[8] = (buffer[8] & 0x3f) | 0x80

    return buffer.toString('hex').toUpperCase()
}

const httpServer = http.createServer()
httpServer.listen(6969, () => console.log("listening on 6969"))

const wsServer = new server({
    httpServer: httpServer
})

export const matrixW = 6
export const matrixH = 7

export const clients = {}
export const games = {}

wsServer.on('request', req => {
    const conn = req.accept(null, req.origin)
    conn.on('open', () => {
        console.log('open', msg)
    })
    conn.on('close', () => console.log('closed'))

    conn.on('message', msg => {
        const result = JSON.parse(msg.utf8Data)

        if(result.method === 'open') {
            open(result, conn)
        }

        if (result.method === 'create') {
            createGame(result)
        }

        if (result.method === 'join') {
            const { clientID, gameID } = result

            const game = games[gameID]
            if (game.clients.length >= 2) {
                const con = clients[gameID].connection
                con.send(JSON.stringify({error: 'this match already has 2 players'}))
                return
            }
            const color = {'0': 'blue', '1': 'red'}[game.clients.length]
            game.clients.push({
                clientID,
                color
            })

            const payload = {
                method: 'join',
                game
            }

            game.clients.forEach(cli => {
                clients[cli.clientID].connection.send(JSON.stringify(payload))
            })
        }

        if (result.method === 'playerTurn') {

        }
    })

    // handleRequest(conn)
})

